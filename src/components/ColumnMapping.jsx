import React, { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

// Import sub-components
import MappingRow from './mapping/MappingRow';
import SmartSplitSection from './mapping/SmartSplitSection';
import SkippedColumns from './mapping/SkippedColumns';

// Import utilities
import {

  DB_FIELDS,
  getAllFields,
  analyzeColumns,
  generateInitialMapping,
  validateMapping,
  getUnmappedColumns,
  invertMapping,
  getRequiredFieldKeys
} from '../utils/mappingAnalyzer';
import { splitMakeModel } from '../utils/smartSplit';

/**
 * ColumnMapping - Main component for mapping Excel columns to database fields
 * 
 * Layout: Database fields on LEFT, Excel column dropdowns on RIGHT
 * Sections: Required fields first, then optional, then skipped
 */
const ColumnMapping = ({
  columns,
  mapping,
  rawData,
  onMappingChange,
  onConfirm,
  onCancel
}) => {
  // Analyze columns on mount/change
  const [analysis, setAnalysis] = useState(null);
  const [appliedSmartSplits, setAppliedSmartSplits] = useState(new Set());
  const [autoMappedFields, setAutoMappedFields] = useState(new Set());
  const [defaultIncoterm, setDefaultIncoterm] = useState(null);

  // Run analysis when columns or data changes
  useEffect(() => {
    if (columns && columns.length > 0 && rawData && rawData.length > 0) {
      const result = analyzeColumns(columns, rawData);
      setAnalysis(result);

      // Apply initial auto-mapping if mapping is empty
      if (Object.keys(mapping).length === 0) {
        const initialMapping = generateInitialMapping(result, columns);
        const autoFields = new Set(Object.values(initialMapping));
        setAutoMappedFields(autoFields);

        // Apply each mapping
        Object.entries(initialMapping).forEach(([col, field]) => {
          onMappingChange(col, field);
        });
      }
    }
  }, [columns, rawData]);

  // Create inverted mapping (dbField -> excelColumn) for the UI
  const fieldToColumn = useMemo(() => invertMapping(mapping), [mapping]);

  // Validation
  const validation = useMemo(() => validateMapping(mapping), [mapping]);

  // Check if incoterm is valid (either mapped to column OR has default selected)
  const isIncotermValid = fieldToColumn['incoterm'] || defaultIncoterm;

  // Get unmapped columns for the skipped section
  const unmappedColumns = useMemo(() => {
    if (!analysis) return [];
    return getUnmappedColumns(
      columns,
      mapping,
      analysis.skipColumns,
      analysis.featureColumns
    );
  }, [columns, mapping, analysis]);

  // All skipped columns (explicitly skipped + unmapped)
  const allSkippedColumns = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.skipColumns, ...analysis.featureColumns, ...unmappedColumns];
  }, [analysis, unmappedColumns]);

  // Handle field mapping change
  const handleFieldChange = (fieldKey, columnName) => {
    // If selecting a column, clear any previous mapping of that column
    if (columnName) {
      // Find if this column was mapped to another field
      const previousField = mapping[columnName];
      if (previousField && previousField !== fieldKey) {
        // This column was mapped elsewhere, clear it first
      }

      // Find if this field was mapped to another column
      const previousColumn = fieldToColumn[fieldKey];
      if (previousColumn && previousColumn !== columnName) {
        // Clear the old mapping
        onMappingChange(previousColumn, '');
      }

      // Set the new mapping
      onMappingChange(columnName, fieldKey);
    } else {
      // Clearing a mapping - find the column that was mapped to this field
      const currentColumn = fieldToColumn[fieldKey];
      if (currentColumn) {
        onMappingChange(currentColumn, '');
      }
    }
  };

  // Handle smart split toggle (checkbox-style)
  const handleToggleSmartSplit = (columnName, analysis) => {
    const isCurrentlyApplied = appliedSmartSplits.has(columnName);

    if (isCurrentlyApplied) {
      // Unchecking - remove the smart split
      setAppliedSmartSplits(prev => {
        const next = new Set(prev);
        next.delete(columnName);
        return next;
      });
      // Clear the mapping for this column
      onMappingChange(columnName, '');
    } else {
      // Checking - apply the smart split
      setAppliedSmartSplits(prev => new Set([...prev, columnName]));

      // Always use combined_make_model - it extracts all fields
      onMappingChange(columnName, 'combined_make_model');

      // Clear any existing individual field mappings that would conflict
      Object.entries(mapping).forEach(([col, field]) => {
        if (['make', 'model', 'variant', 'year'].includes(field) && col !== columnName) {
          onMappingChange(col, '');
        }
      });
    }
  };

  // Get available columns for a field (exclude already-mapped columns except current)
  const getAvailableColumns = (fieldKey) => {
    const currentColumn = fieldToColumn[fieldKey];
    const mappedColumns = new Set(Object.keys(mapping));

    return columns.filter(col => {
      // Always include the currently selected column
      if (col === currentColumn) return true;
      // Include if not mapped and not in skip list
      if (!mappedColumns.has(col) &&
        !analysis?.skipColumns.includes(col) &&
        !analysis?.featureColumns.includes(col)) {
        return true;
      }
      return false;
    });
  };



  // Check if incoterm is mapped to a column
  const isIncotermMapped = fieldToColumn['incoterm'];

  // Render a section of fields
  const renderFieldSection = (fields, title, variant = 'default') => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${variant === 'required' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {variant === 'required' && (
          <span className="text-xs text-gray-500">
            ({fields.filter(f => fieldToColumn[f.key] || validation.fulfilledBy?.[f.key]).length}/{fields.length} mapped)
          </span>
        )}
      </div>

      <div className={`space-y-2 ${variant === 'required' ? 'p-4 bg-red-50/30 rounded-lg border border-red-100' : ''
        }`}>
        {fields.map(field => (
          <div key={field.key}>
            <MappingRow
              field={field}
              selectedColumn={fieldToColumn[field.key] || ''}
              availableColumns={getAvailableColumns(field.key)}
              isAutoMapped={autoMappedFields.has(field.key)}
              onChange={handleFieldChange}
              smartSplitInfo={
                analysis?.smartSplitCandidates?.length > 0 &&
                  ['make', 'model', 'year', 'variant'].includes(field.key) &&
                  !appliedSmartSplits.size
                  ? {
                    shouldSplit: true,
                    suggestedColumn: analysis.smartSplitCandidates[0]?.columnName
                  }
                  : null
              }
              fulfilledBy={validation.fulfilledBy?.[field.key]}
            />
            {/* Show FOB/CIF toggle when incoterm is not mapped */}
            {field.key === 'incoterm' && !isIncotermMapped && (
              <div className="ml-[180px] mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">or select default:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setDefaultIncoterm('FOB')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${defaultIncoterm === 'FOB'
                      ? 'bg-navy text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    FOB
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultIncoterm('CIF')}
                    className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 ${defaultIncoterm === 'CIF'
                      ? 'bg-navy text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    CIF
                  </button>
                </div>
                {defaultIncoterm && (
                  <span className="text-xs text-green-600">✓ {defaultIncoterm} will apply to all</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy">Map Your Columns</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select which Excel column contains data for each database field
          </p>
        </div>

        {/* Validation status */}
        <div className="flex items-center gap-4">
          {validation.missingRequired.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                {validation.missingRequired.length} required field(s) not mapped
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">All required fields mapped</span>
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">How mapping works:</p>
          <p className="mt-1 text-blue-700">
            Each database field on the left needs to be matched with an Excel column from the dropdown on the right.
            Fields marked with <span className="text-red-500">*</span> are required for import.
          </p>
        </div>
      </div>

      {/* Smart Split Section - Simple checkbox-based selection */}
      {analysis?.smartSplitCandidates && analysis.smartSplitCandidates.length > 0 && (
        <SmartSplitSection
          candidates={analysis.smartSplitCandidates}
          appliedSplits={appliedSmartSplits}
          onToggle={handleToggleSmartSplit}
        />
      )}


      {/* Main mapping sections */}
      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
        {/* Required Fields */}
        {renderFieldSection(DB_FIELDS.required, 'Required Fields', 'required')}

        {/* Vehicle-Specific Fields */}
        {renderFieldSection(DB_FIELDS.vehicleSpecific, 'Vehicle-Specific Fields')}

        {/* Listing-Level Fields */}
        {renderFieldSection(DB_FIELDS.listingLevel, 'Listing Details')}

        {/* Additional Fields */}
        {DB_FIELDS.additional.length > 0 &&
          renderFieldSection(DB_FIELDS.additional, 'Additional Fields')
        }
      </div>


      {/* Skipped Columns Section */}
      {allSkippedColumns.length > 0 && (
        <div className="mt-6">
          <SkippedColumns
            columns={allSkippedColumns}
            sampleData={analysis?.sampleData || {}}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span>
            Mapped
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span>
            Required (not mapped)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span>
            Smart split detected
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500">*</span>
            Required field
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {/* Show missing fields warning */}
          {validation.missingRequired.length > 0 && (
            <span className="text-sm text-amber-600">
              Missing: {validation.missingRequired.join(', ')}
            </span>
          )}
          {/* Show incoterm warning */}
          {validation.isValid && !isIncotermValid && (
            <span className="text-sm text-amber-600">
              Please select Incoterm column or default
            </span>
          )}

          <button
            onClick={() => onConfirm({ defaultIncoterm })}
            disabled={!validation.isValid || !isIncotermValid}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Confirm & Import ({rawData?.length || 0} rows)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMapping;