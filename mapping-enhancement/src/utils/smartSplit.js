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
  'Trumpchi', 'GAC Trumpchi', 'Maxus', 'SAIC Maxus', 'Hongqi', 'Arcfox', 'Zeekr', 'Leapmotor',
  'IM Motors', 'Rising Auto', 'Voyah', 'Denza', 'Yangwang', 'Fangchengbao', 'Jiyue',
  // Japanese additional
  'Daihatsu', 'Isuzu',
  // Other
  'Tata', 'Mahindra', 'Proton', 'Perodua',
  // Models that might appear as makes in combined fields (for Chinese JV vehicles)
  'Crider', 'Sylphy', 'Levin', 'Lavida', 'Passat', 'Sagitar', 'Teana', 'Tiguan',
];

// Normalize make names (handle variations)
const MAKE_ALIASES = {
  'VW': 'Volkswagen',
  'Chevy': 'Chevrolet',
  'Mercedes-Benz': 'Mercedes',
  'Range Rover': 'Land Rover',
  'GAC Trumpchi': 'Trumpchi',
  'SAIC Maxus': 'Maxus',
};

// Helper function to escape special regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

// Chinese joint venture parent company names
const PARENT_COMPANIES = [
  'GAC', 'SAIC', 'FAW', 'Dongfeng', 'BAIC', 'Changan', 'Brilliance', 'Beijing',
  'Guangzhou', 'Shanghai', 'Geely', 'Great Wall', 'Chery', 'BYD',
];

/**
 * Extract year from various formats (2021, 2021年, "2021 Model", etc.)
 * @param {string} value - String that may contain a year
 * @returns {string|null} - Extracted 4-digit year or null
 */
export const extractYear = (value) => {
  if (!value) return null;
  const str = String(value);
  
  // Match 4-digit year (1990-2039)
  const yearMatch = str.match(/\b(199\d|20[0-3]\d)\b/);
  if (yearMatch) return yearMatch[1];
  
  // Match year with Chinese character (2021年)
  const chineseYearMatch = str.match(/(199\d|20[0-3]\d)年/);
  if (chineseYearMatch) return chineseYearMatch[1];
  
  return null;
};

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
      if (make === 'Gac') make = 'GAC';
      if (make === 'Byd') make = 'BYD';
      remainder = trimmed.slice(match[0].length).trim();
      break;
    }
  }

  // If no make found at start, check for INVERTED pattern (parent company first)
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
          if (make === 'Gac') make = 'GAC';
          if (make === 'Byd') make = 'BYD';
          remainder = afterParent.slice(match[0].length).trim();
          break;
        }
      }
    }

    // Still no make? Try to find it anywhere in the string
    if (!make) {
      for (const knownMake of sortedMakes) {
        const regex = new RegExp(`\\b${escapeRegex(knownMake)}\\b`, 'i');
        const match = trimmed.match(regex);
        if (match) {
          make = MAKE_ALIASES[match[0]] || match[0];
          make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
          if (make === 'Vw') make = 'Volkswagen';
          if (make === 'Bmw') make = 'BMW';
          if (make === 'Gac') make = 'GAC';
          if (make === 'Byd') make = 'BYD';
          const afterMake = trimmed.slice(match.index + match[0].length).trim();
          remainder = afterMake;
          break;
        }
      }
    }
  }

  // Extract year using enhanced function - handle various formats including "2021年"
  let year = '';
  const extractedYear = extractYear(remainder);
  if (extractedYear) {
    year = extractedYear;
    // Remove year and any trailing Chinese characters from remainder
    remainder = remainder.replace(/\b(199\d|20[0-3]\d)年?\b/g, '').trim();
  }

  // Also check for year with decimal (legacy format)
  if (!year) {
    const yearDecimalMatch = remainder.match(/\b(199\d|20[0-3]\d)\.\d+/);
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

/**
 * Analyze a column's values to detect if it contains combined Make+Model data
 * Returns detailed analysis for UI display
 * @param {string[]} sampleValues - Array of sample values from the column
 * @returns {Object} - Analysis result with confidence, detected patterns, and preview
 */
export const analyzeColumnForSmartSplit = (sampleValues) => {
  if (!sampleValues || sampleValues.length === 0) {
    return { shouldSplit: false, confidence: 0, detectedMakes: [], previews: [] };
  }
  
  const validSamples = sampleValues.filter(v => v && typeof v === 'string' && v.trim().length > 0);
  if (validSamples.length === 0) {
    return { shouldSplit: false, confidence: 0, detectedMakes: [], previews: [] };
  }
  
  const detectedMakes = new Set();
  let makeMatchCount = 0;
  let yearMatchCount = 0;
  let multiWordCount = 0;
  const previews = [];
  
  validSamples.slice(0, 5).forEach(value => {
    const normalized = value.trim();
    
    // Check for known makes
    for (const make of KNOWN_MAKES) {
      const regex = new RegExp(`\\b${escapeRegex(make)}\\b`, 'i');
      if (regex.test(normalized)) {
        detectedMakes.add(make);
        makeMatchCount++;
        break;
      }
    }
    
    // Check for year pattern
    if (extractYear(normalized)) {
      yearMatchCount++;
    }
    
    // Check for multi-word (likely combined)
    if (normalized.split(/\s+/).length >= 2) {
      multiWordCount++;
    }
    
    // Generate preview
    const split = splitMakeModel(normalized);
    if (split.make || split.model) {
      previews.push({
        original: normalized.length > 50 ? normalized.substring(0, 50) + '...' : normalized,
        ...split
      });
    }
  });
  
  // Calculate confidence
  const makeConfidence = makeMatchCount / validSamples.length;
  const yearConfidence = yearMatchCount / validSamples.length;
  const multiWordConfidence = multiWordCount / validSamples.length;
  
  // Combined confidence score
  const confidence = (makeConfidence * 0.5) + (multiWordConfidence * 0.3) + (yearConfidence * 0.2);
  
  return {
    shouldSplit: confidence > 0.3 && makeMatchCount > 0,
    confidence: Math.round(confidence * 100),
    detectedMakes: Array.from(detectedMakes),
    hasYearInValues: yearMatchCount > 0,
    previews: previews.slice(0, 3)
  };
};
