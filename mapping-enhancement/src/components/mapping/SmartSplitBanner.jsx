import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, ArrowRight, Check, X } from 'lucide-react';

/**
 * SmartSplitBanner - Shows detected combined columns with preview and apply option
 * 
 * @param {Object} props
 * @param {Array} props.detectedColumns - Array of { columnName, analysis } objects
 * @param {Function} props.onApplySplit - Callback when user applies a split
 * @param {Function} props.onDismiss - Callback when user dismisses a suggestion
 */
const SmartSplitBanner = ({ detectedColumns, onApplySplit, onDismiss }) => {
  const [expanded, setExpanded] = useState(true);
  const [dismissedColumns, setDismissedColumns] = useState(new Set());

  if (!detectedColumns || detectedColumns.length === 0) return null;

  const activeColumns = detectedColumns.filter(d => !dismissedColumns.has(d.columnName));
  if (activeColumns.length === 0) return null;

  const handleDismiss = (columnName) => {
    setDismissedColumns(prev => new Set([...prev, columnName]));
    onDismiss?.(columnName);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-blue-800">
              Smart Split Detected
            </p>
            <p className="text-xs text-blue-600">
              {activeColumns.length} column(s) appear to contain combined data
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {activeColumns.map(({ columnName, analysis }) => (
            <div 
              key={columnName}
              className="bg-white rounded-lg border border-blue-200 p-4"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-800">
                    Column: <span className="text-blue-600">"{columnName}"</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {analysis.confidence}% confidence • 
                    {analysis.detectedMakes?.length > 0 && (
                      <span> Brands detected: {analysis.detectedMakes.slice(0, 3).join(', ')}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(columnName)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Dismiss suggestion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview extractions */}
              {analysis.previews && analysis.previews.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-gray-600">Preview extractions:</p>
                  {analysis.previews.map((preview, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm bg-gray-50 rounded p-2">
                      <span className="text-gray-400 flex-shrink-0">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs truncate mb-1">
                          "{preview.original}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {preview.make && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              Make: <strong>{preview.make}</strong>
                            </span>
                          )}
                          {preview.model && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              Model: <strong>{preview.model}</strong>
                            </span>
                          )}
                          {preview.variant && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              Variant: <strong>{preview.variant}</strong>
                            </span>
                          )}
                          {preview.year && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                              Year: <strong>{preview.year}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Apply button */}
              <button
                onClick={() => onApplySplit(columnName, analysis)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Apply Smart Split for this column
              </button>
            </div>
          ))}

          {/* Help text */}
          <p className="text-xs text-blue-600 text-center">
            Smart split will automatically extract Make, Model, Variant, and Year from combined columns
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartSplitBanner;
