import React from 'react';
import { DollarSign, MessageSquare, Info, Car } from 'lucide-react';

const PricingStep = ({ listing, updateField, updateVehicle }) => {
  // Calculate price stats
  const prices = listing.vehicles
    .map(v => parseFloat(v.price) || 0)
    .filter(p => p > 0);
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-navy" />
          <h3 className="text-lg font-bold text-gray-800">Pricing & Options</h3>
        </div>
        
        <p className="text-gray-600">
          Set prices for each vehicle and configure negotiation options.
        </p>
      </div>

      {/* Price Summary */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-lg p-6 text-white">
        <h4 className="text-sm font-medium opacity-80 mb-4">Price Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">
              {minPrice > 0 ? `AED ${minPrice.toLocaleString()}` : '-'}
            </p>
            <p className="text-sm opacity-80">Minimum Price</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {avgPrice > 0 ? `AED ${avgPrice.toLocaleString()}` : '-'}
            </p>
            <p className="text-sm opacity-80">Average Price</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {maxPrice > 0 ? `AED ${maxPrice.toLocaleString()}` : '-'}
            </p>
            <p className="text-sm opacity-80">Maximum Price</p>
          </div>
        </div>
      </div>

      {/* Per-Vehicle Pricing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Car className="w-5 h-5 text-navy" />
          <h3 className="text-lg font-bold text-gray-800">Vehicle Prices</h3>
        </div>

        <div className="space-y-4">
          {listing.vehicles.map((vehicle, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-20">
                <span className="text-sm font-medium text-gray-600">
                  Vehicle #{index + 1}
                </span>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">VIN:</span>
                  <span className="ml-2 font-mono text-gray-700">
                    {vehicle.vin || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Mileage:</span>
                  <span className="ml-2 text-gray-700">
                    {vehicle.mileage ? `${parseInt(vehicle.mileage).toLocaleString()} km` : '-'}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 w-48">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    AED
                  </span>
                  <input
                    type="number"
                    value={vehicle.price || ''}
                    onChange={(e) => updateVehicle(index, 'price', e.target.value)}
                    placeholder="0"
                    className="form-input pl-12 text-right font-semibold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiation Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-navy mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Allow Price Negotiations</h3>
              <p className="text-gray-600 text-sm mt-1">
                Enable this to let buyers send you price negotiation requests.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => updateField('allowNegotiations', !listing.allowNegotiations)}
            className={`toggle-switch ${listing.allowNegotiations ? 'active' : ''}`}
          />
        </div>

        {listing.allowNegotiations && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Info className="w-4 h-4" />
              <span>Buyers will see a "Negotiate Price" button on your listing.</span>
            </div>
          </div>
        )}
      </div>

      {/* Final Review */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📋 Listing Review</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle:</span>
              <span className="font-medium text-gray-800">
                {listing.year} {listing.make} {listing.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Variant:</span>
              <span className="font-medium text-gray-800">{listing.variant || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Color:</span>
              <span className="font-medium text-gray-800">{listing.color || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Condition:</span>
              <span className="font-medium text-gray-800">{listing.condition || '-'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Units Available:</span>
              <span className="font-medium text-gray-800">{listing.vehicles.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Features:</span>
              <span className="font-medium text-gray-800">{listing.features.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Images:</span>
              <span className="font-medium text-gray-800">{listing.images.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Negotiations:</span>
              <span className={`font-medium ${listing.allowNegotiations ? 'text-green-600' : 'text-gray-500'}`}>
                {listing.allowNegotiations ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
