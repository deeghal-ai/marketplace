/**
 * Smart Split Utility
 * Handles detection and splitting of combined fields like "Make + Model" or "Make + Model + Variant"
 */

// Comprehensive list of known car makes for pattern matching
export const KNOWN_MAKES = [
  // German
  'Volkswagen', 'VW', 'Audi', 'BMW', 'Mercedes', 'Mercedes-Benz', 'Porsche', 'Opel',
  // Japanese
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura',
  // Korean
  'Hyundai', 'Kia', 'Genesis',
  // American
  'Ford', 'Chevrolet', 'Chevy', 'GMC', 'Dodge', 'Jeep', 'Chrysler', 'Cadillac', 'Lincoln', 'Buick', 'Tesla',
  // European
  'Volvo', 'Peugeot', 'Renault', 'Citroen', 'Fiat', 'Alfa Romeo', 'Seat', 'Skoda', 'Saab',
  // British
  'Land Rover', 'Range Rover', 'Jaguar', 'Mini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
  // Italian
  'Ferrari', 'Lamborghini', 'Maserati',
  // Chinese
  'BYD', 'Geely', 'Great Wall', 'Haval', 'Chery', 'SAIC', 'NIO', 'XPeng', 'Li Auto', 'Dongfeng', 'FAW',
  'Changan', 'GAC', 'BAIC', 'JAC', 'Zotye', 'Foton', 'Wuling', 'Baojun', 'Roewe', 'MG', 'Lynk & Co',
  // Other
  'Tata', 'Mahindra', 'Proton', 'Perodua',
];

// Normalize make names (handle variations)
const MAKE_ALIASES = {
  'VW': 'Volkswagen',
  'Chevy': 'Chevrolet',
  'Mercedes-Benz': 'Mercedes',
  'Range Rover': 'Land Rover',
};

// Helper function to escape special regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/**
 * Detect if a column likely contains combined Make+Model data
 * @param {string[]} sampleValues - Array of sample values from the column
 * @returns {Object} - { isCombined: boolean, confidence: number, detectedMakes: string[] }
 */
export const detectCombinedMakeModel = (sampleValues) => {
  if (!sampleValues || sampleValues.length === 0) {
    return { isCombined: false, confidence: 0, detectedMakes: [] };
  }

  const detectedMakes = new Set();
  let matchCount = 0;

  sampleValues.forEach(value => {
    if (!value || typeof value !== 'string') return;

    const normalizedValue = value.trim();

    for (const make of KNOWN_MAKES) {
      const regex = new RegExp(`\\b${escapeRegex(make)}\\b`, 'i');
      if (regex.test(normalizedValue)) {
        detectedMakes.add(make);
        matchCount++;
        break;
      }
    }
  });

  const confidence = matchCount / sampleValues.filter(v => v).length;

  return {
    isCombined: confidence > 0.3,
    confidence,
    detectedMakes: Array.from(detectedMakes),
  };
};

// Chinese joint venture parent company names
const PARENT_COMPANIES = [
  'GAC', 'SAIC', 'FAW', 'Dongfeng', 'BAIC', 'Changan', 'Brilliance', 'Beijing',
  'Guangzhou', 'Shanghai', 'Geely', 'Great Wall', 'Chery', 'BYD',
];

/**
 * Split a combined Make+Model value into separate parts
 * @param {string} value - The combined value like "Volkswagen Tiguan L 2017 330TSI"
 * @returns {Object} - { make, model, variant, year }
 */
export const splitMakeModel = (value) => {
  if (!value || typeof value !== 'string') {
    return { make: '', model: '', variant: '', year: '' };
  }

  const trimmed = value.trim();
  let make = '';
  let remainder = trimmed;

  const sortedMakes = [...KNOWN_MAKES].sort((a, b) => b.length - a.length);

  // Try to find make at the START of the string
  for (const knownMake of sortedMakes) {
    const regex = new RegExp(`^${escapeRegex(knownMake)}\\b`, 'i');
    const match = trimmed.match(regex);
    if (match) {
      make = MAKE_ALIASES[match[0]] || match[0];
      make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
      if (make === 'Vw') make = 'Volkswagen';
      if (make === 'Bmw') make = 'BMW';
      remainder = trimmed.slice(match[0].length).trim();
      break;
    }
  }

  // If no make found at start, check for INVERTED pattern
  if (!make) {
    const firstWord = trimmed.split(/\s+/)[0];
    const isParentCompany = PARENT_COMPANIES.some(p =>
      firstWord.toLowerCase() === p.toLowerCase()
    );

    if (isParentCompany) {
      const afterParent = trimmed.slice(firstWord.length).trim();

      for (const knownMake of sortedMakes) {
        const regex = new RegExp(`^${escapeRegex(knownMake)}\\b`, 'i');
        const match = afterParent.match(regex);
        if (match) {
          make = MAKE_ALIASES[match[0]] || match[0];
          make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
          if (make === 'Vw') make = 'Volkswagen';
          if (make === 'Bmw') make = 'BMW';
          remainder = afterParent.slice(match[0].length).trim();
          break;
        }
      }
    }

    if (!make) {
      for (const knownMake of sortedMakes) {
        const regex = new RegExp(`\\b${escapeRegex(knownMake)}\\b`, 'i');
        const match = trimmed.match(regex);
        if (match) {
          make = MAKE_ALIASES[match[0]] || match[0];
          make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
          if (make === 'Vw') make = 'Volkswagen';
          if (make === 'Bmw') make = 'BMW';
          const afterMake = trimmed.slice(match.index + match[0].length).trim();
          remainder = afterMake;
          break;
        }
      }
    }
  }

  // Extract year
  let year = '';
  const yearMatch = remainder.match(/\b(19[9][0-9]|20[0-3][0-9])\b/);
  if (yearMatch) {
    year = yearMatch[1];
    remainder = remainder.replace(yearMatch[0], '').trim();
  }

  if (!year) {
    const yearDecimalMatch = remainder.match(/\b(19[9][0-9]|20[0-3][0-9])\.\d+/);
    if (yearDecimalMatch) {
      year = yearDecimalMatch[0].split('.')[0];
      remainder = remainder.replace(yearDecimalMatch[0], '').trim();
    }
  }

  const parts = remainder.split(/\s+/).filter(p => p);
  const model = parts[0] || '';
  const variant = parts.slice(1).join(' ');

  return {
    make: make || '',
    model: model || '',
    variant: variant || '',
    year: year || '',
  };
};

/**
 * Extract color from a description string
 * @param {string} description - Full description text
 * @returns {string} - Detected color or empty string
 */
export const extractColorFromDescription = (description) => {
  if (!description || typeof description !== 'string') return '';

  const colors = [
    'Black', 'White', 'Silver', 'Gray', 'Grey', 'Red', 'Blue', 'Green', 'Yellow',
    'Orange', 'Brown', 'Beige', 'Gold', 'Pearl White', 'Metallic', 'Sky Blue',
    'Manganese Black', 'Starry Gold', 'Rose Gold', 'Mountain Green', 'Pearl',
  ];

  const normalizedDesc = description.toLowerCase();

  for (const color of colors) {
    if (normalizedDesc.includes(color.toLowerCase())) {
      return color;
    }
  }

  return '';
};

/**
 * Get sample values from a column for analysis
 * @param {Object[]} rawData - Array of row objects
 * @param {string} columnName - Column to sample
 * @param {number} sampleSize - Number of samples to take
 * @returns {string[]} - Array of sample values
 */
export const getSampleValues = (rawData, columnName, sampleSize = 10) => {
  return rawData
    .slice(0, Math.min(sampleSize, rawData.length))
    .map(row => row[columnName])
    .filter(v => v !== null && v !== undefined)
    .map(v => String(v));
};
