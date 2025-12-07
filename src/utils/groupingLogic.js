/**
 * Grouping Logic for Vehicle Listings
 * 
 * This module handles the core logic of grouping individual vehicles
 * into listings based on matching criteria (make, model, year, color).
 */

import { splitMakeModel, extractColorFromDescription } from './smartSplit';
import { isCombinedField, getCombinedFieldInfo } from '../constants/standardFields';

// Fields used for grouping vehicles into a single listing
const GROUPING_KEYS = ['make', 'model', 'year', 'color'];

// Fields that are listing-level (same for all vehicles in listing)
const LISTING_KEYS = [
  'variant', 'bodyType', 'fuelType', 'transmission', 'drivetrain',
  'engineSize', 'cylinders', 'horsepower', 'seatingCapacity', 'doors',
  'condition', 'regionalSpecs', 'city', 'country', 'description'
];

// Fields that are vehicle-specific (different for each vehicle)
const VEHICLE_KEYS = ['vin', 'registrationNumber', 'mileage', 'owners', 'warranty', 'price'];

/**
 * Generate a unique key for grouping vehicles
 * @param {Object} vehicle - Vehicle data
 * @returns {string} - Unique grouping key
 */
export const generateListingKey = (vehicle) => {
  return GROUPING_KEYS
    .map(key => String(vehicle[key] || '').toLowerCase().trim())
    .join('_');
};

/**
 * Group an array of vehicles into listings
 * @param {Object[]} vehicles - Array of vehicle objects
 * @returns {Object[]} - Array of listing objects with nested vehicles
 */
export const groupVehiclesIntoListings = (vehicles) => {
  const groups = {};

  vehicles.forEach(vehicle => {
    const key = generateListingKey(vehicle);

    if (!groups[key]) {
      // Create new listing with grouping and listing-level fields
      groups[key] = {
        id: key,
        // Grouping fields
        ...GROUPING_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {}),
        // Listing fields (take from first vehicle)
        ...LISTING_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {}),
        // Initialize vehicles array and count
        vehicles: [],
        count: 0,
        // Edit-only fields (defaults)
        features: [],
        images: [],
        allowNegotiations: false,
        status: 'draft',
      };
    }

    // Add vehicle-specific data
    groups[key].vehicles.push(
      VEHICLE_KEYS.reduce((acc, k) => ({ ...acc, [k]: vehicle[k] }), {})
    );
    groups[key].count++;
  });

  return Object.values(groups);
};

/**
 * Process combined fields and split them into individual fields
 * @param {Object} row - Raw row data
 * @param {Object} mapping - Column to field mapping
 * @returns {Object} - Processed row with split fields
 */
const processCombinedFields = (row, mapping) => {
  const processed = {};
  const filledByCombo = new Set();

  Object.entries(mapping).forEach(([col, field]) => {
    if (!isCombinedField(field)) return;

    const value = row[col];
    if (!value) return;

    if (field === 'combined_make_model' || field === 'combined_make_model_variant') {
      const split = splitMakeModel(String(value));

      if (split.make && !processed.make) {
        processed.make = split.make;
        filledByCombo.add('make');
      }
      if (split.model && !processed.model) {
        processed.model = split.model;
        filledByCombo.add('model');
      }
      if (field === 'combined_make_model_variant' && split.variant && !processed.variant) {
        processed.variant = split.variant;
        filledByCombo.add('variant');
      }
      if (split.year && !processed.year) {
        processed.year = split.year;
        filledByCombo.add('year');
      }
    }

    if (field === 'combined_full_description') {
      const color = extractColorFromDescription(String(value));
      if (color && !processed.color) {
        processed.color = color;
        filledByCombo.add('color');
      }
      if (!processed.description) {
        processed.description = String(value);
        filledByCombo.add('description');
      }
      const parts = String(value).split('-').map(s => s.trim());
      if (parts.length > 0 && !processed.variant) {
        processed.variant = parts[0];
        filledByCombo.add('variant');
      }
    }
  });

  return { processed, filledByCombo };
};

/**
 * Transform raw data using column mapping to standard vehicle format
 * @param {Object[]} rawData - Raw data from Excel
 * @param {Object} mapping - Column to field mapping
 * @returns {Object[]} - Array of standardized vehicle objects
 */
export const transformToVehicles = (rawData, mapping) => {
  const reverseMapping = {};
  Object.entries(mapping).forEach(([col, field]) => {
    if (!isCombinedField(field)) {
      reverseMapping[field] = col;
    }
  });

  return rawData.map(row => {
    const vehicle = {};

    const { processed, filledByCombo } = processCombinedFields(row, mapping);
    Object.assign(vehicle, processed);

    Object.entries(reverseMapping).forEach(([field, col]) => {
      if (!filledByCombo.has(field)) {
        vehicle[field] = row[col];
      }
    });

    // Clean up year
    if (vehicle.year) {
      const yearStr = String(vehicle.year);
      const yearMatch = yearStr.match(/\b(19[9][0-9]|20[0-3][0-9])\b/);
      if (yearMatch) {
        vehicle.year = yearMatch[1];
      }
    }

    // Clean up mileage
    if (vehicle.mileage) {
      const mileageStr = String(vehicle.mileage).replace(/[,\s]/g, '');
      const mileageNum = parseFloat(mileageStr);
      if (!isNaN(mileageNum)) {
        vehicle.mileage = mileageNum < 500 ? mileageNum * 1000 : mileageNum;
      }
    }

    return vehicle;
  });
};

/**
 * Get summary statistics for listings
 * @param {Object[]} listings - Array of listings
 * @returns {Object} - Statistics object
 */
export const getListingsStats = (listings) => {
  return {
    totalListings: listings.length,
    totalVehicles: listings.reduce((sum, l) => sum + l.count, 0),
    avgVehiclesPerListing: listings.length > 0
      ? (listings.reduce((sum, l) => sum + l.count, 0) / listings.length).toFixed(1)
      : 0,
    uniqueMakes: [...new Set(listings.map(l => l.make).filter(Boolean))].length,
  };
};
