import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getFeatureSuggestions } from '../../constants/featureSuggestions';

const FeatureTagInput = ({ features, onAdd, onRemove }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.length > 0) {
      setSuggestions(getFeatureSuggestions(value, features));
    } else {
      setSuggestions([]);
    }
  };

  const handleAddFeature = (feature = input) => {
    if (feature.trim()) {
      onAdd(feature.trim());
      setInput('');
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input with suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a feature (e.g., Leather Seats, Navigation)"
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddFeature()}
            className="btn-primary"
          >
            Add Feature
          </button>
        </div>
        
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddFeature(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Feature tags */}
      <div className="flex flex-wrap gap-2">
        {features.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No features added yet. Add some features to make your listing more attractive.
          </p>
        ) : (
          features.map((feature, idx) => (
            <span key={idx} className="feature-tag">
              {feature}
              <button 
                type="button"
                onClick={() => onRemove(feature)}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default FeatureTagInput;
