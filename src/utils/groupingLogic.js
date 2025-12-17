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
const VEHICLE_KEYS = ['vin', 'registrationNumber', 'mileage', 'owners', 'warranty', 'price', 'incoterm', 'inspectionReportLink'];

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
 * Transform raw data using column mapping to standard vehicle format
 * 
 * PRECEDENCE: Direct column mappings take priority over split-extracted fields.
 * Example: If "Brand" column is mapped to "make", it takes precedence over
 * extracting "make" from a combined "MODEL NAME" column.
 * 
 * @param {Object[]} rawData - Raw data from Excel
 * @param {Object} mapping - Column to field mapping
 * @returns {Object[]} - Array of standardized vehicle objects
 */
export const transformToVehicles = (rawData, mapping, options = {}) => {
  const { defaultIncoterm } = options;
  // Build reverse mapping for direct (non-combined) field mappings
  const directMappings = {};
  Object.entries(mapping).forEach(([col, field]) => {
    if (!isCombinedField(field)) {
      directMappings[field] = col;
    }
  });

  return rawData.map(row => {
    const vehicle = {};

    // STEP 1: Apply DIRECT mappings first (these take precedence)
    Object.entries(directMappings).forEach(([field, col]) => {
      const value = row[col];
      if (value !== undefined && value !== null && value !== '') {
        vehicle[field] = value;
      }
    });

    // STEP 2: Apply split fields ONLY for fields that weren't directly mapped
    Object.entries(mapping).forEach(([col, field]) => {
      if (!isCombinedField(field)) return;

      const value = row[col];
      if (!value) return;

      if (field === 'combined_make_model') {
        const split = splitMakeModel(String(value));

        // Only fill in if NOT already set by direct mapping
        if (split.make && !vehicle.make) {
          vehicle.make = split.make;
        }
        if (split.model && !vehicle.model) {
          vehicle.model = split.model;
        }
        if (split.variant && !vehicle.variant) {
          vehicle.variant = split.variant;
        }
        if (split.year && !vehicle.year) {
          vehicle.year = split.year;
        }
      }
    });

    // STEP 3: Clean up year - handle various formats including "2021年"
    if (vehicle.year) {
      const yearStr = String(vehicle.year);
      // Remove Chinese character 年 and extract 4-digit year
      const cleanYear = yearStr.replace(/年/g, '');
      const yearMatch = cleanYear.match(/\b(199\d|20[0-3]\d)\b/);
      if (yearMatch) {
        vehicle.year = yearMatch[1];
      }
    }

    // STEP 4: Clean up mileage
    if (vehicle.mileage) {
      const mileageStr = String(vehicle.mileage).replace(/[,\s]/g, '');
      const mileageNum = parseFloat(mileageStr);
      if (!isNaN(mileageNum)) {
        vehicle.mileage = mileageNum < 500 ? mileageNum * 1000 : mileageNum;
      }
    }

    // STEP 5: Apply default incoterm if not mapped from column
    if (!vehicle.incoterm && defaultIncoterm) {
      vehicle.incoterm = defaultIncoterm;
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
