/**
 * Mapping Analyzer Utility
 * 
 * Provides functions for analyzing Excel columns and detecting patterns
 * to improve auto-mapping accuracy.
 */

import { COLUMN_SYNONYMS, shouldSkipColumn, isFeatureColumn } from './columnSynonyms';
import { analyzeColumnForSmartSplit, getSampleValues } from './smartSplit';

/**
 * Database field definitions with metadata
 * Order determines display order in the mapping UI
 */
export const DB_FIELDS = {
  // Required/Grouping fields (appear first)
  required: [
    { key: 'make', label: 'Make / Brand', required: true, description: 'Vehicle manufacturer' },
    { key: 'model', label: 'Model', required: true, description: 'Vehicle model name' },
    { key: 'year', label: 'Year', required: true, description: 'Manufacturing year' },
    { key: 'color', label: 'Color', required: true, description: 'Exterior color' },
  ],

  // Vehicle-specific fields (important for individual vehicles)
  vehicleSpecific: [
    { key: 'vin', label: 'VIN', required: false, description: 'Vehicle Identification Number' },
    { key: 'registrationNumber', label: 'Registration Number', required: false },
    { key: 'mileage', label: 'Mileage', required: false, description: 'Odometer reading' },
    { key: 'price', label: 'Price', required: false, description: 'Selling price' },
    { key: 'incoterm', label: 'Incoterm', required: false, description: 'International Commercial Terms' },
    { key: 'inspectionReportLink', label: 'Inspection Report Link', required: false, description: 'URL to vehicle inspection report' },
    { key: 'owners', label: 'Number of Owners', required: false },
    { key: 'warranty', label: 'Warranty', required: false },
  ],

  // Listing-level fields (shared across grouped vehicles)
  listingLevel: [
    { key: 'variant', label: 'Variant / Trim', required: false },
    { key: 'bodyType', label: 'Body Type', required: false },
    { key: 'fuelType', label: 'Fuel Type', required: false },
    { key: 'transmission', label: 'Transmission', required: false },
    { key: 'drivetrain', label: 'Drivetrain', required: false },
    { key: 'engineSize', label: 'Engine Size', required: false },
    { key: 'cylinders', label: 'Cylinders', required: false },
    { key: 'horsepower', label: 'Horsepower', required: false },
    { key: 'seatingCapacity', label: 'Seating Capacity', required: false },
    { key: 'doors', label: 'Number of Doors', required: false },
    { key: 'condition', label: 'Condition', required: false },
    { key: 'regionalSpecs', label: 'Regional Specs', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'description', label: 'Description', required: false },
  ],

  // Additional fields
  additional: [
    { key: 'inspectionReport', label: 'Inspection Report URL', required: false },
  ],
};

/**
 * Get all database fields as a flat array
 * @returns {Array} - All field definitions
 */
export const getAllFields = () => [
  ...DB_FIELDS.required,
  ...DB_FIELDS.vehicleSpecific,
  ...DB_FIELDS.listingLevel,
  ...DB_FIELDS.additional,
];

/**
 * Get required field keys
 * @returns {string[]} - Array of required field keys
 */
export const getRequiredFieldKeys = () =>
  DB_FIELDS.required.filter(f => f.required).map(f => f.key);

/**
 * Analyze all columns from an Excel file
 * @param {string[]} columns - Array of column names
 * @param {Object[]} rawData - Raw data rows from Excel
 * @returns {Object} - Analysis result
 */
export const analyzeColumns = (columns, rawData) => {
  const result = {
    // Columns that should be skipped (serial numbers, etc.)
    skipColumns: [],
    // Columns that are feature columns (Feature 1, Feature 2, etc.)
    featureColumns: [],
    // Columns with smart split potential
    smartSplitCandidates: [],
    // Auto-mapping suggestions
    mappingSuggestions: {},
    // Sample data for each column
    sampleData: {},
  };

  columns.forEach(col => {
    // Get sample values for this column
    const samples = rawData
      .slice(0, 10)
      .map(row => row[col])
      .filter(v => v != null && v !== '');
    result.sampleData[col] = samples;

    // Check if column should be skipped
    if (shouldSkipColumn(col)) {
      result.skipColumns.push(col);
      return;
    }

    // Check if it's a feature column
    if (isFeatureColumn(col)) {
      result.featureColumns.push(col);
      return;
    }

    // Check for smart split potential
    const smartSplitAnalysis = analyzeColumnForSmartSplit(samples.map(String));
    if (smartSplitAnalysis.shouldSplit) {
      result.smartSplitCandidates.push({
        columnName: col,
        analysis: smartSplitAnalysis,
      });
    }

    // Try to auto-map
    const suggestedField = findBestFieldMatch(col, samples);
    if (suggestedField) {
      result.mappingSuggestions[col] = suggestedField;
    }
  });

  return result;
};

/**
 * Find the best matching database field for a column
 * @param {string} columnName - Excel column name
 * @param {Array} sampleValues - Sample values from the column
 * @returns {string|null} - Best matching field key or null
 */
export const findBestFieldMatch = (columnName, sampleValues = []) => {
  const normalizedCol = columnName.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const [fieldKey, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
    // Skip internal fields
    if (fieldKey.startsWith('_')) continue;

    for (const syn of synonyms) {
      let score = 0;

      // Exact match
      if (normalizedCol === syn) {
        score = 100;
      }
      // Column starts with synonym
      else if (normalizedCol.startsWith(syn + ' ') || normalizedCol.startsWith(syn + '(')) {
        score = 90;
      }
      // Synonym starts with column (e.g., column "ext.color" matches "ext color")
      else if (syn.replace(/[.\s]/g, '') === normalizedCol.replace(/[.\s]/g, '')) {
        score = 85;
      }
      // Column contains synonym
      else if (normalizedCol.includes(syn) && syn.length > 2) {
        score = 50 + syn.length;
      }
      // Synonym contains column
      else if (syn.includes(normalizedCol) && normalizedCol.length > 2) {
        score = 30 + normalizedCol.length;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = fieldKey;
      }
    }
  }

  return bestScore > 30 ? bestMatch : null;
};

/**
 * Generate initial mapping from analysis
 * @param {Object} analysis - Result from analyzeColumns
 * @param {string[]} columns - All Excel columns
 * @returns {Object} - Initial mapping { excelColumn: dbFieldKey }
 */
export const generateInitialMapping = (analysis, columns) => {
  const mapping = {};
  const usedFields = new Set();
  const usedColumns = new Set([
    ...analysis.skipColumns,
    ...analysis.featureColumns
  ]);

  // First pass: apply confident auto-mappings
  for (const [col, field] of Object.entries(analysis.mappingSuggestions)) {
    if (!usedFields.has(field) && !usedColumns.has(col)) {
      mapping[col] = field;
      usedFields.add(field);
      usedColumns.add(col);
    }
  }

  return mapping;
};

/**
 * Validate a mapping
 * @param {Object} mapping - Current mapping { excelColumn: dbFieldKey }
 * @returns {Object} - { isValid, missingRequired, warnings }
 */
export const validateMapping = (mapping) => {
  const mappedFields = new Set(Object.values(mapping));
  const requiredFields = getRequiredFieldKeys();

  const missingRequired = requiredFields.filter(f => !mappedFields.has(f));
  const warnings = [];

  // Check for duplicate field mappings
  const fieldCounts = {};
  Object.values(mapping).forEach(field => {
    fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    if (fieldCounts[field] > 1) {
      warnings.push(`Field "${field}" is mapped to multiple columns`);
    }
  });

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    warnings,
  };
};

/**
 * Get columns that are not mapped to any field
 * @param {string[]} allColumns - All Excel columns
 * @param {Object} mapping - Current mapping
 * @param {string[]} skipColumns - Columns marked to skip
 * @param {string[]} featureColumns - Feature columns (ignored for now)
 * @returns {string[]} - Unmapped columns
 */
export const getUnmappedColumns = (allColumns, mapping, skipColumns = [], featureColumns = []) => {
  const mappedColumns = new Set(Object.keys(mapping));
  const excludedColumns = new Set([...skipColumns, ...featureColumns]);

  return allColumns.filter(col =>
    !mappedColumns.has(col) && !excludedColumns.has(col)
  );
};

/**
 * Invert mapping from { excelColumn: dbField } to { dbField: excelColumn }
 * @param {Object} mapping - Original mapping
 * @returns {Object} - Inverted mapping
 */
export const invertMapping = (mapping) => {
  const inverted = {};
  for (const [col, field] of Object.entries(mapping)) {
    inverted[field] = col;
  }
  return inverted;
};
