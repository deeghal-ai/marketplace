import React from 'react';
import { Scissors, Info, ChevronRight } from 'lucide-react';

/**
 * SmartSplitSection - Simple checkbox-based UI for splitting combined columns
 * 
 * Shows detected columns that might contain combined Make/Model/Variant data
 * and lets users check which ones to split.
 */
const SmartSplitSection = ({ candidates, appliedSplits, onToggle }) => {
    if (!candidates || candidates.length === 0) return null;

    // Ensure appliedSplits is a Set
    const splits = appliedSplits || new Set();


    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-amber-900">Split Combined Columns</h4>
                    <p className="text-xs text-amber-700">
                        These columns appear to contain combined vehicle data
                    </p>
                </div>
            </div>

            {/* Help text */}
            <div className="flex items-start gap-2 mb-4 p-2 bg-white/50 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                    Check the columns you want to automatically split into separate Make, Model, Variant, and Year fields.
                    This is useful when your Excel has combined data like "Honda Civic 2023 LX".
                </p>
            </div>

            {/* Candidate list */}
            <div className="space-y-2">
                {candidates.map(({ columnName, analysis }) => {
                    const isApplied = splits.has(columnName);
                    const preview = analysis.previews?.[0];

                    return (
                        <label
                            key={columnName}
                            className={`
                flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${isApplied
                                    ? 'bg-green-100 border-2 border-green-400'
                                    : 'bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                                }
              `}
                        >
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={isApplied}
                                onChange={() => onToggle(columnName, analysis)}
                                className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />

                            {/* Column info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-medium ${isApplied ? 'text-green-800' : 'text-gray-800'}`}>
                                        "{columnName}"
                                    </span>
                                    {isApplied && (
                                        <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                            Will Split
                                        </span>
                                    )}
                                </div>

                                {/* Preview */}
                                {preview && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                        <div className="text-gray-500 mb-1 truncate">
                                            "{preview.original}"
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <ChevronRight className="w-3 h-3 text-gray-400" />
                                            {preview.make && (
                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                    Make: <strong>{preview.make}</strong>
                                                </span>
                                            )}
                                            {preview.model && (
                                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                    Model: <strong>{preview.model}</strong>
                                                </span>
                                            )}
                                            {preview.variant && (
                                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                                                    Variant: <strong>{preview.variant}</strong>
                                                </span>
                                            )}
                                            {preview.year && (
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                                    Year: <strong>{preview.year}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Summary */}
            {splits.size > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-800">
                    <strong>{splits.size}</strong> column(s) will be split during import
                </div>
            )}
        </div>
    );
};

export default SmartSplitSection;
