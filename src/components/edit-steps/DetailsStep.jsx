import React from 'react';
import { Car, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

const DetailsStep = ({ listing, updateVehicle, addVehicle, removeVehicle }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-navy" />
            <h3 className="text-lg font-bold text-gray-800">Vehicle Details</h3>
          </div>
          <button
            onClick={addVehicle}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
        
        <p className="text-gray-600">
          This listing contains <span className="font-bold text-navy">{listing.vehicles.length}</span> vehicle(s). 
          Each vehicle has unique details like VIN, mileage, and price.
        </p>
      </div>

      {/* Vehicle Cards */}
      {listing.vehicles.map((vehicle, index) => (
        <div key={index} className="vehicle-card">
          <div className="vehicle-card-header flex items-center justify-between">
            <span>Vehicle #{index + 1}</span>
            {listing.vehicles.length > 1 && (
              <button
                onClick={() => removeVehicle(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* VIN */}
            <div>
              <label className="form-label">VIN (Vehicle Identification Number)</label>
              <input
                type="text"
                value={vehicle.vin || ''}
                onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                placeholder="e.g., 1HGBH41JXMN109186"
                className="form-input font-mono text-sm"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                value={vehicle.registrationNumber || ''}
                onChange={(e) => updateVehicle(index, 'registrationNumber', e.target.value)}
                placeholder="e.g., ABC-12345"
                className="form-input"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="form-label">Mileage (km)</label>
              <input
                type="number"
                value={vehicle.mileage || ''}
                onChange={(e) => updateVehicle(index, 'mileage', e.target.value)}
                placeholder="e.g., 50000"
                className="form-input"
              />
            </div>

            {/* Number of Owners */}
            <div>
              <label className="form-label">Number of Previous Owners</label>
              <select
                value={vehicle.owners || ''}
                onChange={(e) => updateVehicle(index, 'owners', e.target.value)}
                className="form-select"
              >
                <option value="">Select</option>
                <option value="1">1 (First Owner)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>

            {/* Warranty */}
            <div>
              <label className="form-label">Warranty Status</label>
              <select
                value={vehicle.warranty || ''}
                onChange={(e) => updateVehicle(index, 'warranty', e.target.value)}
                className="form-select"
              >
                <option value="">Select</option>
                <option value="Under Manufacturer Warranty">Under Manufacturer Warranty</option>
                <option value="Extended Warranty">Extended Warranty</option>
                <option value="Warranty Expired">Warranty Expired</option>
                <option value="No Warranty">No Warranty</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="form-label">Price (AED)</label>
              <input
                type="number"
                value={vehicle.price || ''}
                onChange={(e) => updateVehicle(index, 'price', e.target.value)}
                placeholder="e.g., 150000"
                className="form-input"
              />
            </div>
          </div>

          {/* Inspection Report Upload */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="form-label flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Inspection Report (PDF)
            </label>
            <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm">PDF upload coming soon</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You'll be able to upload inspection reports for each vehicle
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-sm">Total Vehicles</p>
            <p className="font-bold text-navy text-xl">{listing.vehicles.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Price Range</p>
            <p className="font-bold text-navy text-xl">
              {(() => {
                const prices = listing.vehicles
                  .map(v => parseFloat(v.price) || 0)
                  .filter(p => p > 0);
                if (prices.length === 0) return '-';
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                if (min === max) return `AED ${min.toLocaleString()}`;
                return `AED ${min.toLocaleString()} - ${max.toLocaleString()}`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Mileage</p>
            <p className="font-bold text-navy text-xl">
              {(() => {
                const mileages = listing.vehicles
                  .map(v => parseInt(v.mileage) || 0)
                  .filter(m => m > 0);
                if (mileages.length === 0) return '-';
                const avg = Math.round(mileages.reduce((a, b) => a + b, 0) / mileages.length);
                return `${avg.toLocaleString()} km`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
