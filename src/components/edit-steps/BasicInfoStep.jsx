import React from 'react';
import ColorPicker from '../common/ColorPicker';
import { 
  CAR_MAKES, 
  BODY_TYPES, 
  FUEL_TYPES, 
  TRANSMISSIONS, 
  DRIVETRAINS, 
  CONDITIONS, 
  REGIONAL_SPECS,
  CYLINDERS,
  SEATING_CAPACITIES,
  DOOR_COUNTS,
  getModelsForMake 
} from '../../constants/dropdownOptions';

const BasicInfoStep = ({ listing, updateField }) => {
  const models = getModelsForMake(listing.make);

  return (
    <div className="space-y-8">
      {/* Basic Vehicle Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Basic Vehicle Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <label className="form-label">Brand / Make</label>
            <select
              value={listing.make || ''}
              onChange={(e) => updateField('make', e.target.value)}
              className="form-select"
            >
              <option value="">Select Brand</option>
              {CAR_MAKES.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="form-label">Model</label>
            <select
              value={listing.model || ''}
              onChange={(e) => updateField('model', e.target.value)}
              className="form-select"
            >
              <option value="">Select Model</option>
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              {listing.model && !models.includes(listing.model) && (
                <option value={listing.model}>{listing.model}</option>
              )}
            </select>
            {!listing.make && (
              <p className="text-xs text-gray-400 mt-1">Select a brand first</p>
            )}
          </div>

          {/* Variant */}
          <div>
            <label className="form-label">Variant / Trim</label>
            <input
              type="text"
              value={listing.variant || ''}
              onChange={(e) => updateField('variant', e.target.value)}
              placeholder="e.g., XLE, Sport, Limited"
              className="form-input"
            />
          </div>

          {/* Year */}
          <div>
            <label className="form-label">Year</label>
            <select
              value={listing.year || ''}
              onChange={(e) => updateField('year', e.target.value)}
              className="form-select"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Regional Specs */}
          <div>
            <label className="form-label">Regional Specs</label>
            <select
              value={listing.regionalSpecs || ''}
              onChange={(e) => updateField('regionalSpecs', e.target.value)}
              className="form-select"
            >
              <option value="">Select Specs</option>
              {REGIONAL_SPECS.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="form-label">Body Type</label>
            <select
              value={listing.bodyType || ''}
              onChange={(e) => updateField('bodyType', e.target.value)}
              className="form-select"
            >
              <option value="">Select Body Type</option>
              {BODY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="form-label">Condition</label>
            <select
              value={listing.condition || ''}
              onChange={(e) => updateField('condition', e.target.value)}
              className="form-select"
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Exterior Color</h3>
        <ColorPicker 
          value={listing.color} 
          onChange={(color) => updateField('color', color)} 
        />
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">City</label>
            <input
              type="text"
              value={listing.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g., Dubai, Abu Dhabi"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Country</label>
            <input
              type="text"
              value={listing.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="e.g., UAE, Saudi Arabia"
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Engine & Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Engine & Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fuel Type */}
          <div>
            <label className="form-label">Fuel Type</label>
            <select
              value={listing.fuelType || ''}
              onChange={(e) => updateField('fuelType', e.target.value)}
              className="form-select"
            >
              <option value="">Select Fuel Type</option>
              {FUEL_TYPES.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="form-label">Transmission</label>
            <select
              value={listing.transmission || ''}
              onChange={(e) => updateField('transmission', e.target.value)}
              className="form-select"
            >
              <option value="">Select Transmission</option>
              {TRANSMISSIONS.map(trans => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>

          {/* Drivetrain */}
          <div>
            <label className="form-label">Drivetrain</label>
            <select
              value={listing.drivetrain || ''}
              onChange={(e) => updateField('drivetrain', e.target.value)}
              className="form-select"
            >
              <option value="">Select Drivetrain</option>
              {DRIVETRAINS.map(drive => (
                <option key={drive} value={drive}>{drive}</option>
              ))}
            </select>
          </div>

          {/* Engine Size */}
          <div>
            <label className="form-label">Engine Size</label>
            <input
              type="text"
              value={listing.engineSize || ''}
              onChange={(e) => updateField('engineSize', e.target.value)}
              placeholder="e.g., 2.0L, 3.5L"
              className="form-input"
            />
          </div>

          {/* Cylinders */}
          <div>
            <label className="form-label">Cylinders</label>
            <select
              value={listing.cylinders || ''}
              onChange={(e) => updateField('cylinders', e.target.value)}
              className="form-select"
            >
              <option value="">Select Cylinders</option>
              {CYLINDERS.map(cyl => (
                <option key={cyl} value={cyl}>{cyl}</option>
              ))}
            </select>
          </div>

          {/* Horsepower */}
          <div>
            <label className="form-label">Horsepower</label>
            <input
              type="text"
              value={listing.horsepower || ''}
              onChange={(e) => updateField('horsepower', e.target.value)}
              placeholder="e.g., 300"
              className="form-input"
            />
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="form-label">Seating Capacity</label>
            <select
              value={listing.seatingCapacity || ''}
              onChange={(e) => updateField('seatingCapacity', e.target.value)}
              className="form-select"
            >
              <option value="">Select Capacity</option>
              {SEATING_CAPACITIES.map(cap => (
                <option key={cap} value={cap}>{cap}</option>
              ))}
            </select>
          </div>

          {/* Doors */}
          <div>
            <label className="form-label">Number of Doors</label>
            <select
              value={listing.doors || ''}
              onChange={(e) => updateField('doors', e.target.value)}
              className="form-select"
            >
              <option value="">Select Doors</option>
              {DOOR_COUNTS.map(door => (
                <option key={door} value={door}>{door}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Description</h3>
        
        <textarea
          value={listing.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Add a detailed description of the vehicle..."
          className="form-textarea"
          rows={5}
        />
        <p className="text-xs text-gray-400 mt-2">
          Include any additional details about the vehicle's history, features, or condition.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
