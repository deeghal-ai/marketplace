# Implementation Instructions for Column Mapping Enhancement

## Overview
This document provides instructions for implementing the enhanced column mapping screen. The changes:
1. Flip the layout (DB fields on left, Excel columns dropdown on right)
2. Add better auto-detection of column mappings
3. Improve smart split functionality for combined data like "2019 GAC Honda Crider..."
4. Handle Chinese year formats like "2021年"
5. Show skipped/unmapped columns in a separate section

---

## STEP 1: Create New Directory

Create the directory: `src/components/mapping/`

---

## STEP 2: Create New Files

Copy these NEW files to your project:

| Source File | Destination |
|-------------|-------------|
| `src/components/mapping/MappingRow.jsx` | `src/components/mapping/MappingRow.jsx` |
| `src/components/mapping/SmartSplitBanner.jsx` | `src/components/mapping/SmartSplitBanner.jsx` |
| `src/components/mapping/SkippedColumns.jsx` | `src/components/mapping/SkippedColumns.jsx` |
| `src/utils/mappingAnalyzer.js` | `src/utils/mappingAnalyzer.js` |

---

## STEP 3: Replace Existing Files

**COMPLETELY REPLACE** these existing files with the new versions:

| Source File | Destination (REPLACE) |
|-------------|----------------------|
| `src/components/ColumnMapping.jsx` | `src/components/ColumnMapping.jsx` |
| `src/utils/columnSynonyms.js` | `src/utils/columnSynonyms.js` |
| `src/utils/smartSplit.js` | `src/utils/smartSplit.js` |
| `src/utils/groupingLogic.js` | `src/utils/groupingLogic.js` |

---

## STEP 4: No Other Changes Required

The following files do NOT need changes:
- `src/App.jsx` - Already imports ColumnMapping correctly
- `src/constants/standardFields.js` - No changes needed
- All other files - Unchanged

---

## Summary of All Files

### 1. `src/utils/columnSynonyms.js`

**Changes to make:**

#### A. Add new entries to `COLUMN_SYNONYMS` object:

Add these new keys after the existing `description` key:

```javascript
  // Serial/Index columns to skip
  _skip: ['no', 'sr. no', 'sr no', 'sr.no', 'serial', 'serial number', 'serial no', 'row', '#', 'id', 'index', 'sno', 's.no'],
  
  // Enhanced mappings
  inspectionReport: ['test report', 'inspection report', 'inspection', 'report', 'report url', 'inspection url', 'inspection link'],
```

#### B. Update `mileage` synonyms - FIND this line:
```javascript
  mileage: ['mileage', 'kms driven', 'kilometers', 'odometer', 'odometer reading', 'km', 'miles', 'kms', 'distance', 'run', 'mileage displayed'],
```
REPLACE WITH:
```javascript
  mileage: ['mileage', 'kms driven', 'kilometers', 'odometer', 'odometer reading', 'km', 'miles', 'kms', 'distance', 'run', 'mileage displayed', 'milage', 'milage（km)', 'mileage (km)', 'mileage(km)'],
```

#### C. Update `color` synonyms - FIND this line:
```javascript
  color: ['color', 'colour', 'exterior color', 'body color', 'ext color', 'paint color'],
```
REPLACE WITH:
```javascript
  color: ['color', 'colour', 'exterior color', 'body color', 'ext color', 'paint color', 'ext.color', 'ext color', 'exterior colour'],
```

#### D. Update `price` synonyms - FIND this line:
```javascript
  price: ['price', 'asking price', 'cost', 'amount', 'selling price', 'rate', 'value', 'cif cost', 'exw'],
```
REPLACE WITH:
```javascript
  price: ['price', 'asking price', 'cost', 'amount', 'selling price', 'rate', 'value', 'cif cost', 'exw', 'cif', 'fob', 'cif cost (jebel ali)', 'fob cost', 'unit price'],
```

#### E. Update `registrationNumber` synonyms - FIND this line:
```javascript
  registrationNumber: ['registration number', 'reg number', 'registration', 'plate number', 'license plate', 'number plate', 'reg no', 'plate', 'first registration'],
```
REPLACE WITH:
```javascript
  registrationNumber: ['registration number', 'reg number', 'registration', 'plate number', 'license plate', 'number plate', 'reg no', 'plate', '1st registration', '1st registration date', 'first registration', 'first registration date', 'registration date'],
```

#### F. Update `condition` synonyms - FIND this line:
```javascript
  condition: ['condition', 'vehicle condition', 'state', 'car condition', 'test level'],
```
REPLACE WITH:
```javascript
  condition: ['condition', 'vehicle condition', 'state', 'car condition', 'test level', 'level', 'grade', 'rating'],
```

#### G. Update `variant` synonyms - FIND this line:
```javascript
  variant: ['variant', 'trim', 'trim level', 'version', 'grade', 'spec level', 'edition'],
```
REPLACE WITH:
```javascript
  variant: ['variant', 'trim', 'trim level', 'version', 'grade', 'spec level', 'edition', 'series'],
```

#### H. Add new function at the end of the file (before the last closing brace or after `addSynonym`):

```javascript
/**
 * Check if a column should be skipped (serial numbers, IDs, etc.)
 * @param {string} columnName - The column name to check
 * @returns {boolean}
 */
export const shouldSkipColumn = (columnName) => {
  const normalized = columnName.toLowerCase().trim();
  const skipPatterns = COLUMN_SYNONYMS._skip || [];
  return skipPatterns.some(pattern => normalized === pattern || normalized.startsWith(pattern + ' '));
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
```

---

### 2. `src/utils/smartSplit.js`

**Changes to make:**

#### A. Add to KNOWN_MAKES array (after existing makes, before the closing bracket):
```javascript
  // Additional Chinese brands
  'Trumpchi', 'GAC Trumpchi', 'Roewe', 'Maxus', 'SAIC Maxus', 'Hongqi', 'Arcfox', 'Zeekr', 'Leapmotor',
  'IM Motors', 'Rising Auto', 'Voyah', 'Denza', 'Yangwang', 'Fangchengbao', 'Jiyue',
  // Japanese
  'Daihatsu', 'Isuzu',
  // Additional models that might appear as makes in combined fields
  'Crider', 'Sylphy', 'Levin', 'Lavida', 'Passat', 'Sagitar', 'Teana', 'Tiguan',
```

#### B. Add new helper function after the `escapeRegex` function:

```javascript
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
```

#### C. Update the `splitMakeModel` function - FIND the line that starts with:
```javascript
  // Extract year
  let year = '';
```
And REPLACE the entire year extraction block (until the next comment or section) with:
```javascript
  // Extract year using enhanced function
  let year = '';
  const extractedYear = extractYear(remainder);
  if (extractedYear) {
    year = extractedYear;
    // Remove year and any trailing Chinese characters from remainder
    remainder = remainder.replace(/\b(199\d|20[0-3]\d)年?\b/g, '').trim();
  }
```

#### D. Add new function at the end of the file:

```javascript
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
```

---

### 3. `src/utils/groupingLogic.js`

**Changes to make:**

#### A. FIND the `transformToVehicles` function and locate this line inside it:
```javascript
    // Clean up year
    if (vehicle.year) {
```

REPLACE the entire year cleanup block with:
```javascript
    // Clean up year - handle various formats including "2021年"
    if (vehicle.year) {
      const yearStr = String(vehicle.year);
      // Remove Chinese character 年 and extract 4-digit year
      const cleanYear = yearStr.replace(/年/g, '');
      const yearMatch = cleanYear.match(/\b(199\d|20[0-3]\d)\b/);
      if (yearMatch) {
        vehicle.year = yearMatch[1];
      }
    }
```

---

## File Structure After Changes

```
src/
├── components/
│   ├── mapping/                    # NEW DIRECTORY
│   │   ├── MappingRow.jsx          # NEW
│   │   ├── SmartSplitBanner.jsx    # NEW
│   │   └── SkippedColumns.jsx      # NEW
│   ├── ColumnMapping.jsx           # REPLACED
│   └── ... (other existing files)
├── utils/
│   ├── columnSynonyms.js           # MODIFIED
│   ├── smartSplit.js               # MODIFIED
│   ├── groupingLogic.js            # MODIFIED
│   ├── mappingAnalyzer.js          # NEW
│   └── ... (other existing files)
```

---

## Testing Checklist

After implementing changes, test with:

1. **Lot_1_cars.xlsx** - Standard format with separate columns
2. **Stock_Details_Set6_5vehicles.xlsx** - Vehicle-specific data
3. **Leasing_channel.xlsx** - Combined data formats:
   - `MODEL NAME` column should trigger smart split detection
   - `Year` column with "2021年" should parse correctly
   - `Milage（km)` should map to mileage
   - `CIF Cost (Jebel Ali)` should map to price
   - `Ext.Color` should map to color
   - `Level` should map to condition

---

## Key Behavioral Changes

1. **Layout Flip**: Database fields now appear on the LEFT side as labels, Excel columns appear in dropdowns on the RIGHT side

2. **Mandatory Fields First**: Required fields (Make, Model, Year, Color, VIN) appear in a highlighted section at the top

3. **Smart Split Detection**: When a column like "MODEL NAME" contains combined data (e.g., "2019 GAC Honda Crider..."), the system:
   - Detects it automatically
   - Shows a preview of what will be extracted
   - Allows user to confirm/apply the split

4. **Skipped Columns Section**: Columns that don't map to any field (like "No", "MODEL IN CHINESE", "L*W*H") appear in a collapsible "Unmapped Columns" section

5. **Year Parsing**: Now handles formats like "2021年" (Chinese year format)

---

## Notes for Production Implementation

1. The smart split logic uses regex patterns - ensure proper escaping for special characters
2. The KNOWN_MAKES list should be maintained/expanded as new brands are encountered
3. Consider adding a "Learn" feature that saves successful manual mappings for future auto-detection
4. The confidence threshold (0.3) for smart split can be adjusted based on user feedback
