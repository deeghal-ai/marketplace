import React from 'react';
import { Star } from 'lucide-react';
import FeatureTagInput from '../common/FeatureTagInput';
import { FEATURE_SUGGESTIONS } from '../../constants/featureSuggestions';

const FeaturesStep = ({ listing, addFeature, removeFeature }) => {
  // Group suggestions by category
  const categories = {
    'Comfort & Convenience': FEATURE_SUGGESTIONS.slice(0, 15),
    'Safety': FEATURE_SUGGESTIONS.slice(15, 27),
    'Technology': FEATURE_SUGGESTIONS.slice(27, 41),
    'Exterior': FEATURE_SUGGESTIONS.slice(41, 49),
    'Performance': FEATURE_SUGGESTIONS.slice(49, 55),
    'Other': FEATURE_SUGGESTIONS.slice(55),
  };

  const handleQuickAdd = (feature) => {
    if (!listing.features.includes(feature)) {
      addFeature(feature);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-navy" />
          <h3 className="text-lg font-bold text-gray-800">Vehicle Features</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Add features to highlight what makes this vehicle special. These will be displayed on the listing page.
        </p>

        <FeatureTagInput
          features={listing.features}
          onAdd={addFeature}
          onRemove={removeFeature}
        />
      </div>

      {/* Quick Add Suggestions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Add</h3>
        <p className="text-gray-500 text-sm mb-6">
          Click on any feature below to quickly add it to your listing.
        </p>

        <div className="space-y-6">
          {Object.entries(categories).map(([category, features]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => {
                  const isAdded = listing.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      onClick={() => handleQuickAdd(feature)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        isAdded
                          ? 'bg-navy text-white border-navy cursor-default'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-navy hover:text-navy'
                      }`}
                    >
                      {isAdded && <span className="mr-1">✓</span>}
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total features added:</span>
          <span className="font-bold text-navy text-lg">{listing.features.length}</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturesStep;
