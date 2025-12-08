/**
 * Mapping Analyzer Utility
 * 
 * Provides functions for analyzing Excel columns and detecting patterns
 * to improve auto-mapping accuracy.
 */

import { COLUMN_SYNONYMS, shouldSkipColumn, isFeatureColumn } from './columnSynonyms.js';
import { analyzeColumnForSmartSplit } from './smartSplit.js';

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
    { key: 'owners', label: 'Number of Owners', required: false },
    { key: 'warranty', label: 'Warranty', required: false },
  ],
  
  // Listing-level fields (shared across grouped vehicles)
  listingLevel: [
    { key: 'variant', label: 'Variant / Trim', required: false, description: 'Trim level, version, or variant' },
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
  
  // Virtual/Combined fields (not shown directly, used for smart split)
  combined: [
    { key: 'combined_make_model', label: 'Combined Make+Model', virtual: true, fulfills: ['make', 'model'] },
    { key: 'combined_make_model_variant', label: 'Combined Make+Model+Variant', virtual: true, fulfills: ['make', 'model', 'variant'] },
    { key: 'combined_variant_extract', label: 'Variant Extract', virtual: true, fulfills: ['variant'] },
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
    // Cross-column insights
    columnRelationships: {},
    // Recommendations for better mapping
    recommendations: [],
  };

  // First pass: collect data and basic analysis
  const columnAnalysis = {};
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

    // Analyze column content
    columnAnalysis[col] = {
      samples,
      suggestedField: findBestFieldMatch(col, samples),
      smartSplitAnalysis: analyzeColumnForSmartSplit(samples.map(String)),
      dataQuality: assessDataQuality(samples),
    };
  });

  // Second pass: cross-column analysis to find better mappings
  const crossColumnInsights = analyzeCrossColumnRelationships(columnAnalysis, columns);
  result.columnRelationships = crossColumnInsights.relationships;
  result.recommendations = crossColumnInsights.recommendations;

  // Apply insights to improve suggestions
  columns.forEach(col => {
    if (result.skipColumns.includes(col) || result.featureColumns.includes(col)) {
      return;
    }

    const analysis = columnAnalysis[col];
    const hasRecommendation = result.recommendations.find(r => r.columnName === col);

    if (hasRecommendation) {
      // Use recommendation over basic analysis
      if (hasRecommendation.suggestedMapping) {
        result.mappingSuggestions[col] = hasRecommendation.suggestedMapping;
      }
      if (hasRecommendation.type === 'avoid_smart_split') {
        // Don't suggest smart split for this column
      } else if (analysis.smartSplitAnalysis.shouldSplit && !hasRecommendation.avoidSmartSplit) {
        result.smartSplitCandidates.push({
          columnName: col,
          analysis: analysis.smartSplitAnalysis,
        });
      }
    } else {
      // Use basic analysis
      if (analysis.suggestedField) {
        result.mappingSuggestions[col] = analysis.suggestedField;
      }
      if (analysis.smartSplitAnalysis.shouldSplit) {
        result.smartSplitCandidates.push({
          columnName: col,
          analysis: analysis.smartSplitAnalysis,
        });
      }
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

  // Validate the match against sample data
  if (bestMatch && sampleValues.length > 0) {
    const validationScore = validateFieldMatch(bestMatch, sampleValues);
    if (validationScore < 0.3) {
      // Data doesn't match the suggested field, reject it
      return null;
    }
  }

  return bestScore > 30 ? bestMatch : null;
};

/**
 * Validate if sample data matches the expected field type
 * @param {string} fieldKey - The suggested field
 * @param {Array} samples - Sample values
 * @returns {number} - Validation score (0-1)
 */
const validateFieldMatch = (fieldKey, samples) => {
  if (!samples || samples.length === 0) return 0;

  const sampleStrings = samples.map(String);
  let matches = 0;

  switch (fieldKey) {
    case 'make':
      // Check if samples contain known car makes
      matches = sampleStrings.filter(sample => {
        // Import KNOWN_MAKES from smartSplit - for now use basic check
        const commonMakes = ['Toyota', 'Honda', 'BMW', 'Audi', 'Mercedes', 'Ford', 'Volkswagen', 'Nissan'];
        return commonMakes.some(make => sample.toLowerCase().includes(make.toLowerCase()));
      }).length;
      break;
      
    case 'year':
      // Check if samples look like years (4-digit numbers)
      matches = sampleStrings.filter(sample => {
        const cleanSample = sample.replace(/年/g, '');
        return /\b(199\d|20[0-3]\d)\b/.test(cleanSample);
      }).length;
      break;
      
    case 'price':
      // Check if samples look like prices (numbers)
      matches = sampleStrings.filter(sample => {
        return /\d/.test(sample) && !/^[a-zA-Z\s]+$/.test(sample);
      }).length;
      break;
      
    case 'mileage':
      // Check if samples look like mileage (numbers)
      matches = sampleStrings.filter(sample => {
        return /\d/.test(sample) && !/^[a-zA-Z\s]+$/.test(sample);
      }).length;
      break;
      
    case 'color':
      // Check if samples look like colors
      const commonColors = ['white', 'black', 'silver', 'gray', 'red', 'blue', 'green'];
      matches = sampleStrings.filter(sample => {
        return commonColors.some(color => sample.toLowerCase().includes(color));
      }).length;
      break;
      
    default:
      // For other fields, assume the column name matching is sufficient
      return 1.0;
  }

  return matches / samples.length;
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

  // First, handle high-priority recommendations that should override basic suggestions
  const highPriorityRecs = analysis.recommendations.filter(r => r.priority === 'high');
  for (const rec of highPriorityRecs) {
    if (rec.suggestedMapping && !usedColumns.has(rec.columnName)) {
      mapping[rec.columnName] = rec.suggestedMapping;
      usedColumns.add(rec.columnName);
      
      // If this is a combined field, mark the individual fields as "will be filled"
      if (rec.suggestedMapping === 'combined_make_model') {
        usedFields.add('make');
        usedFields.add('model');
      } else if (rec.suggestedMapping === 'combined_make_model_variant') {
        usedFields.add('make');
        usedFields.add('model');
        usedFields.add('variant');
      } else if (rec.suggestedMapping === 'combined_variant_extract') {
        usedFields.add('variant');
      }
    }
  }

  // Second pass: apply other confident auto-mappings (avoid conflicts with high-priority recs)
  for (const [col, field] of Object.entries(analysis.mappingSuggestions)) {
    if (!usedFields.has(field) && !usedColumns.has(col)) {
      // Skip if there's a high-priority recommendation against using this mapping
      const hasConflictingRec = analysis.recommendations.some(r => 
        r.priority === 'high' && 
        (r.columnName === col || (r.type === 'avoid_smart_split' && col === r.columnName))
      );
      
      if (!hasConflictingRec) {
        mapping[col] = field;
        usedFields.add(field);
        usedColumns.add(col);
      }
    }
  }

  return mapping;
};

/**
 * Validate a mapping
 * @param {Object} mapping - Current mapping { excelColumn: dbFieldKey }
 * @returns {Object} - { isValid, missingRequired, warnings, fulfilledBy }
 */
export const validateMapping = (mapping) => {
  const mappedFields = new Set(Object.values(mapping));
  const requiredFields = getRequiredFieldKeys();
  const fulfilledBy = {};
  
  // Check for combined fields that fulfill individual requirements
  Object.entries(mapping).forEach(([col, field]) => {
    if (field === 'combined_make_model') {
      fulfilledBy.make = col;
      fulfilledBy.model = col;
    } else if (field === 'combined_make_model_variant') {
      fulfilledBy.make = col;
      fulfilledBy.model = col;
      fulfilledBy.variant = col;
    } else if (field === 'combined_full_description') {
      fulfilledBy.description = col;
      // Could potentially fulfill color if extracted
    } else if (field === 'combined_variant_extract') {
      fulfilledBy.variant = col;
    }
  });

  // Mark fields as fulfilled if they're either directly mapped or fulfilled by combined fields
  const allFulfilledFields = new Set([
    ...mappedFields,
    ...Object.keys(fulfilledBy)
  ]);

  const missingRequired = requiredFields.filter(f => !allFulfilledFields.has(f));
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
    fulfilledBy, // Which column fulfills each field via combined mapping
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
 * Assess data quality of a column
 * @param {Array} samples - Sample values from column
 * @returns {Object} - Quality assessment
 */
const assessDataQuality = (samples) => {
  if (!samples || samples.length === 0) {
    return { score: 0, issues: ['No data'] };
  }

  const issues = [];
  let score = 100;

  // Check for consistency
  const uniqueValues = new Set(samples.map(String));
  const duplicateRatio = (samples.length - uniqueValues.size) / samples.length;
  
  if (duplicateRatio > 0.8) {
    issues.push('Very repetitive data');
    score -= 30;
  } else if (duplicateRatio > 0.5) {
    issues.push('Somewhat repetitive data');
    score -= 15;
  }

  // Check for cleanliness (simple heuristics)
  const avgLength = samples.reduce((sum, s) => sum + String(s).length, 0) / samples.length;
  if (avgLength < 3) {
    issues.push('Very short values');
    score -= 10;
  } else if (avgLength > 100) {
    issues.push('Very long values');
    score -= 10;
  }

  // Check for complex combined data (multiple spaces, special chars)
  const hasComplexData = samples.some(s => {
    const str = String(s);
    return str.includes('  ') || /[(),\-\/]/.test(str);
  });
  
  if (hasComplexData) {
    issues.push('Contains complex combined data');
    score -= 20;
  }

  return {
    score: Math.max(0, score),
    issues,
    isClean: score > 70,
    avgLength,
    duplicateRatio,
  };
};

/**
 * Analyze relationships between columns to provide better mapping suggestions
 * @param {Object} columnAnalysis - Analysis of individual columns
 * @param {string[]} columns - All column names
 * @returns {Object} - Cross-column insights
 */
const analyzeCrossColumnRelationships = (columnAnalysis, columns) => {
  const relationships = {};
  const recommendations = [];
  
  // Collect columns by their smart split data type
  const cleanMakeModelColumns = [];
  const fullDescriptionColumns = [];

  Object.entries(columnAnalysis).forEach(([col, analysis]) => {
    const smartAnalysis = analysis.smartSplitAnalysis;
    
    // Only consider columns that are actually splittable (have multiple words)
    if (!smartAnalysis?.shouldSplit) return;
    
    const dataType = smartAnalysis.dataType;
    const avgWords = smartAnalysis.avgWordCount || 0;
    
    // Clean make+model: exactly 2 words like "HONDA Crider"
    if (dataType === 'clean_make_model' && avgWords >= 1.5 && avgWords <= 2.5) {
      cleanMakeModelColumns.push({ column: col, analysis: smartAnalysis });
      
      relationships[col] = {
        type: 'clean_make_model',
        description: 'Contains clean Make + Model data',
      };
      
      recommendations.push({
        type: 'prefer_clean_source',
        columnName: col,
        message: `"${col}" contains clean Make + Model data. Consider using this instead of smart split on complex columns.`,
        suggestedMapping: 'combined_make_model',
        priority: 'high',
      });
    }
    
    // Full description: 3+ words with variant info
    if ((dataType === 'full_description' || smartAnalysis.hasVariant) && avgWords > 2.5) {
      fullDescriptionColumns.push({ column: col, analysis: smartAnalysis });
      
      relationships[col] = {
        type: 'full_description_with_variant',
        description: 'Contains Make + Model + Variant data',
        variantConfidence: smartAnalysis.variantConfidence,
      };
      
      recommendations.push({
        type: 'extract_variant_source',
        columnName: col,
        message: `"${col}" contains detailed variant information (${smartAnalysis.variantConfidence}% confidence). Use this for extracting variant/trim data.`,
        suggestedMapping: 'combined_make_model_variant',
        priority: 'high',
        hasVariant: true,
        variantConfidence: smartAnalysis.variantConfidence,
      });
    }
  });

  // If we have both clean Make+Model AND full description columns, suggest optimal combo
  if (cleanMakeModelColumns.length > 0 && fullDescriptionColumns.length > 0) {
    const bestClean = cleanMakeModelColumns[0];
    const bestFull = fullDescriptionColumns[0];
    
    if (bestClean.column !== bestFull.column) {
      // Add optimal combination as first recommendation
      recommendations.unshift({
        type: 'optimal_combination',
        columnName: bestClean.column,
        relatedColumn: bestFull.column,
        message: `Best mapping: Use "${bestClean.column}" for Make/Model, and "${bestFull.column}" for Variant extraction.`,
        suggestedMapping: 'combined_make_model',
        priority: 'high',
        combination: {
          makeModelSource: bestClean.column,
          variantSource: bestFull.column,
        },
      });
    }
  }

  return {
    relationships,
    recommendations,
    variantSources: fullDescriptionColumns.map(v => v.column),
    cleanMakeModelSources: cleanMakeModelColumns.map(c => c.column),
  };
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