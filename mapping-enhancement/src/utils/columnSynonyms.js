// Common column name variations for auto-mapping
// Add more synonyms as you encounter different dealer formats
export const COLUMN_SYNONYMS = {
  // Grouping fields
  make: ['make', 'brand', 'manufacturer', 'oem', 'car make', 'vehicle make'],
  model: ['model', 'model name', 'car model', 'vehicle model'],
  year: ['year', 'model year', 'manufacturing year', 'mfg year', 'yr', 'production year', 'year of production'],
  color: ['color', 'colour', 'exterior color', 'body color', 'ext color', 'paint color', 'ext.color', 'exterior colour'],

  // Listing fields - ORDER MATTERS for priority (more specific first)
  drivetrain: ['drivetrain', 'drive type', 'wheel drive', 'driven wheels', '4wd', '2wd', 'awd', 'fwd', 'rwd'],
  engineSize: ['engine size', 'engine', 'displacement', 'cc', 'engine capacity', 'engine cc', 'liters', 'litres'],
  fuelType: ['fuel type', 'fuel', 'power type', 'propulsion', 'petrol', 'diesel', 'gasoline'],
  bodyType: ['body type', 'body style', 'vehicle type', 'car type', 'sedan', 'suv', 'hatchback'],
  variant: ['variant', 'trim', 'trim level', 'version', 'grade', 'spec level', 'edition', 'series'],
  transmission: ['transmission', 'gearbox', 'trans', 'gear type', 'transmission type'],
  cylinders: ['cylinders', 'cyl', 'no of cylinders', 'cylinder count', 'cyls'],
  horsepower: ['horsepower', 'hp', 'bhp', 'horse power', 'ps', 'kw'],
  seatingCapacity: ['seating capacity', 'seats', 'seating', 'passengers', 'no of seats', 'seat count'],
  doors: ['doors', 'number of doors', 'no of doors', 'door count'],
  condition: ['condition', 'vehicle condition', 'state', 'car condition', 'test level', 'level', 'grade', 'rating'],
  regionalSpecs: ['regional specs', 'specs', 'specification', 'region', 'market', 'emission standard', 'brand type'],
  city: ['city', 'location', 'dealer city'],
  country: ['country', 'nation', 'dealer country'],
  description: ['description', 'details', 'about', 'notes', 'remarks', 'comments', 'vehicle condition description', 'material name'],

  // Vehicle-specific fields
  vin: ['vin', 'vehicle identification number', 'chassis number', 'chassis', 'vin number', 'chassis no', 'vehicle chassis number'],
  registrationNumber: ['registration number', 'reg number', 'registration', 'plate number', 'license plate', 'number plate', 'reg no', 'plate', '1st registration', '1st registration date', 'first registration', 'first registration date', 'registration date'],
  mileage: ['mileage', 'kms driven', 'kilometers', 'odometer', 'odometer reading', 'km', 'miles', 'kms', 'distance', 'run', 'mileage displayed', 'milage', 'milage（km)', 'mileage (km)', 'mileage(km)'],
  owners: ['owners', 'no of owners', 'number of owners', 'previous owners', 'owner count', 'ownership'],
  warranty: ['warranty', 'warranty period', 'warranty status', 'warranty remaining'],
  price: ['price', 'asking price', 'cost', 'amount', 'selling price', 'rate', 'value', 'cif cost', 'exw', 'cif', 'fob', 'cif cost (jebel ali)', 'fob cost', 'unit price'],

  // Additional fields
  inspectionReport: ['test report', 'inspection report', 'inspection', 'report', 'report url', 'inspection url', 'inspection link'],

  // Serial/Index columns to skip (internal use)
  _skip: ['no', 'sr. no', 'sr no', 'sr.no', 'serial', 'serial number', 'serial no', 'row', '#', 'id', 'index', 'sno', 's.no'],
};

// Column names that often contain combined Make+Model data
const COMBINED_COLUMN_HINTS = [
  'model', 'vehicle', 'car', 'name', '车型', 'vehicle info', 'model name'
];

/**
 * Auto-detect mapping based on column names
 * Uses a scoring system: exact match > contains synonym > synonym contains column
 * @param {string[]} columns - Array of column names from uploaded file
 * @returns {Object} - Mapping of column name to standard field key
 */
export const autoDetectMapping = (columns) => {
  const mapping = {};
  const usedFields = new Set();

  columns.forEach(col => {
    const normalizedCol = col.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;

    for (const [fieldKey, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
      // Skip if this field is already mapped or is internal
      if (usedFields.has(fieldKey) || fieldKey.startsWith('_')) continue;

      for (const syn of synonyms) {
        let score = 0;

        // Exact match is highest priority
        if (normalizedCol === syn) {
          score = 100;
        }
        // Column equals a synonym word boundary match (e.g., "engine" matches "engine size")
        else if (normalizedCol === syn.split(' ')[0] && syn.includes(' ')) {
          score = 80;
        }
        // Synonym equals first word of column (e.g., "fuel type" matches "fuel")
        else if (syn === normalizedCol.split(' ')[0] && normalizedCol.includes(' ') && syn.length > 2) {
          score = 75;
        }
        // Normalized comparison (remove dots, spaces, special chars)
        else if (syn.replace(/[.\s]/g, '') === normalizedCol.replace(/[.\s]/g, '')) {
          score = 85;
        }
        // Column starts with synonym (e.g., "milage（km)" starts with "milage")
        else if (normalizedCol.startsWith(syn) && syn.length > 2) {
          score = 70;
        }
        // Column contains the full synonym (e.g., "total mileage" contains "mileage")
        else if (normalizedCol.includes(syn) && syn.length > 2) {
          score = 50 + syn.length;
        }
        // Synonym contains the column (e.g., "kms driven" contains "kms")
        else if (syn.includes(normalizedCol) && normalizedCol.length > 2) {
          score = 30 + normalizedCol.length;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = fieldKey;
        }
      }
    }

    if (bestMatch && bestScore > 0) {
      mapping[col] = bestMatch;
      usedFields.add(bestMatch);
    }
  });

  return mapping;
};

/**
 * Check if a column name suggests it might contain combined Make+Model data
 * @param {string} columnName - The column name to check
 * @returns {boolean}
 */
export const mightBeCombinedColumn = (columnName) => {
  const normalized = columnName.toLowerCase().trim();
  return COMBINED_COLUMN_HINTS.some(hint => normalized.includes(hint));
};

/**
 * Add a new synonym for a field
 * @param {string} fieldKey - The standard field key
 * @param {string} synonym - The new synonym to add
 */
export const addSynonym = (fieldKey, synonym) => {
  if (COLUMN_SYNONYMS[fieldKey]) {
    const normalizedSynonym = synonym.toLowerCase().trim();
    if (!COLUMN_SYNONYMS[fieldKey].includes(normalizedSynonym)) {
      COLUMN_SYNONYMS[fieldKey].push(normalizedSynonym);
    }
  }
};

/**
 * Check if a column should be skipped (serial numbers, IDs, etc.)
 * @param {string} columnName - The column name to check
 * @returns {boolean}
 */
export const shouldSkipColumn = (columnName) => {
  const normalized = columnName.toLowerCase().trim();
  const skipPatterns = COLUMN_SYNONYMS._skip || [];
  return skipPatterns.some(pattern => 
    normalized === pattern || 
    normalized.startsWith(pattern + ' ') ||
    normalized.endsWith(' ' + pattern)
  );
};

/**
 * Detect if column name suggests it contains a feature
 * @param {string} columnName - The column name to check  
 * @returns {boolean}
 */
export const isFeatureColumn = (columnName) => {
  const normalized = columnName.toLowerCase().trim();
  return /^feature\s*\d*$/i.test(normalized) || 
         /^option\s*\d*$/i.test(normalized) ||
         /^equipment\s*\d*$/i.test(normalized);
};
