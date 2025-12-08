import React, { useState } from 'react';
import { Check, AlertCircle, Zap, Edit2, X } from 'lucide-react';

/**
 * MappingRow - Single row for mapping a database field to an Excel column
 * 
 * @param {Object} props
 * @param {Object} props.field - Field definition { key, label, required }
 * @param {string} props.selectedColumn - Currently selected Excel column
 * @param {string[]} props.availableColumns - All Excel columns
 * @param {boolean} props.isAutoMapped - Whether this was auto-detected
 * @param {Function} props.onChange - Callback when selection changes
 * @param {Object} props.smartSplitInfo - Info about smart split if applicable
 * @param {string} props.fulfilledBy - Column that fulfills this field via combined mapping
 */
const MappingRow = ({
  field,
  selectedColumn,
  availableColumns,
  isAutoMapped,
  onChange,
  smartSplitInfo,
  fulfilledBy,
  disabled = false
}) => {
  const [isOverriding, setIsOverriding] = useState(false);

  const hasSelection = selectedColumn && selectedColumn !== '';
  const isFulfilledByCombined = fulfilledBy && !hasSelection;
  const showSmartSplitHint = smartSplitInfo?.shouldSplit && !hasSelection && !isFulfilledByCombined;

  // Handle override - when user wants to manually select instead of using split
  const handleStartOverride = () => {
    setIsOverriding(true);
  };

  const handleCancelOverride = () => {
    setIsOverriding(false);
  };

  const handleOverrideSelect = (columnName) => {
    onChange(field.key, columnName);
    setIsOverriding(false);
  };

  // Show dropdown if: overriding, has direct selection, or not fulfilled by combined
  const showDropdown = isOverriding || hasSelection || !isFulfilledByCombined;

  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-lg border transition-all
      ${field.required
        ? (hasSelection || isFulfilledByCombined)
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        : (hasSelection || isFulfilledByCombined)
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200'
      }
    `}>
      {/* Left side - Database field label */}
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center gap-2">
          {field.required && (
            <span className={`w-2 h-2 rounded-full ${(hasSelection || isFulfilledByCombined) ? 'bg-green-500' : 'bg-red-500'
              }`} />
          )}
          <span className={`font-medium ${field.required ? 'text-gray-800' : 'text-gray-600'}`}>
            {field.label}
          </span>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        {field.description && (
          <p className="text-xs text-gray-400 mt-1">{field.description}</p>
        )}
      </div>

      {/* Arrow */}
      <div className="text-gray-300">←</div>

      {/* Right side - Excel column dropdown or combined field indicator */}
      <div className="flex-1">
        {isFulfilledByCombined && !isOverriding ? (
          <div className={`
            w-full px-3 py-2 border rounded-lg text-sm bg-green-50 border-green-300
            flex items-center justify-between
          `}>
            <span className="text-green-700 font-medium">
              Provided by "{fulfilledBy}" (combined field)
            </span>
            <button
              onClick={handleStartOverride}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Override with a different column"
            >
              <Edit2 className="w-3 h-3" />
              Override
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={selectedColumn || ''}
              onChange={(e) => handleOverrideSelect(e.target.value)}
              disabled={disabled}
              className={`
                flex-1 px-3 py-2 border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
                ${hasSelection ? 'border-green-300' : 'border-gray-300'}
              `}
            >
              <option value="">-- Select Excel Column --</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {/* Cancel override button - show only when overriding a split field */}
            {isOverriding && fulfilledBy && (
              <button
                onClick={handleCancelOverride}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Use split value instead"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Smart split hint - only show if not overriding */}
        {showSmartSplitHint && !isOverriding && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            <Zap className="w-3 h-3" />
            <span>Tip: "{smartSplitInfo.suggestedColumn}" may contain this data</span>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="w-20 flex-shrink-0 flex items-center justify-end gap-2">
        {hasSelection && isAutoMapped && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Auto
          </span>
        )}
        {isFulfilledByCombined && !isOverriding && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Split
          </span>
        )}
        {(hasSelection || (isFulfilledByCombined && !isOverriding)) && (
          <Check className="w-5 h-5 text-green-500" />
        )}
        {field.required && !hasSelection && !isFulfilledByCombined && (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
      </div>
    </div>
  );
};

export default MappingRow;