import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, FileQuestion } from 'lucide-react';

/**
 * SkippedColumns - Displays Excel columns that weren't mapped to any DB field
 * 
 * @param {Object} props
 * @param {string[]} props.columns - Array of unmapped column names
 * @param {Object} props.sampleData - Sample data for each column { columnName: [values] }
 */
const SkippedColumns = ({ columns, sampleData = {} }) => {
  const [expanded, setExpanded] = useState(false);

  if (!columns || columns.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <FileQuestion className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-700">
              Unmapped Columns
            </p>
            <p className="text-xs text-gray-500">
              {columns.length} column(s) will be ignored during import
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
            {columns.length}
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {columns.map((col, idx) => (
              <div key={col} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 truncate">
                      {col}
                    </p>
                    {sampleData[col] && sampleData[col].length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-400 mb-1">Sample values:</p>
                        <div className="flex flex-wrap gap-1">
                          {sampleData[col].slice(0, 3).map((val, vIdx) => (
                            <span 
                              key={vIdx}
                              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs truncate max-w-[150px]"
                              title={String(val)}
                            >
                              {String(val).length > 25 
                                ? String(val).substring(0, 25) + '...' 
                                : String(val)
                              }
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-2">Skipped</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info note */}
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              These columns don't match any database fields and will not be imported. 
              If you need data from these columns, contact support to add new field mappings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkippedColumns;
