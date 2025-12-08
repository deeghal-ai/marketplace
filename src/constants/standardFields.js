// Standard field definitions for the application
export const STANDARD_FIELDS = {
  // Grouping fields (used to create single listing)
  grouping: [
    { key: 'make', label: 'Make/Brand', required: true },
    { key: 'model', label: 'Model', required: true },
    { key: 'year', label: 'Year', required: true },
    { key: 'color', label: 'Color', required: true },
  ],
  // Listing fields (same for all cars in a listing)
  listing: [
    { key: 'variant', label: 'Variant' },
    { key: 'bodyType', label: 'Body Type' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'drivetrain', label: 'Drivetrain' },
    { key: 'engineSize', label: 'Engine Size' },
    { key: 'cylinders', label: 'Cylinders' },
    { key: 'horsepower', label: 'Horsepower' },
    { key: 'seatingCapacity', label: 'Seating Capacity' },
    { key: 'doors', label: 'Number of Doors' },
    { key: 'condition', label: 'Condition' },
    { key: 'regionalSpecs', label: 'Regional Specs' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'description', label: 'Description' },
  ],
  // Vehicle-specific fields (different for each car)
  vehicle: [
    { key: 'vin', label: 'VIN', required: true },
    { key: 'registrationNumber', label: 'Registration Number' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'owners', label: 'Number of Owners' },
    { key: 'warranty', label: 'Warranty Period' },
    { key: 'price', label: 'Price' },
    { key: 'inspectionReport', label: 'Inspection Report' },
  ],
  // Smart combined fields (simplified - one option that extracts all)
  combined: [
    {
      key: 'combined_make_model',
      label: '🔀 Split Combined Column',
      description: 'Automatically extracts Make, Model, Variant, and Year from combined text like "2019 Honda Civic LX"',
      splitsTo: ['make', 'model', 'variant', 'year'],
    },
  ],

  // Edit-only fields (added during edit, not from import)
  editOnly: [
    { key: 'features', label: 'Features', type: 'array' },
    { key: 'images', label: 'Images', type: 'array' },
    { key: 'allowNegotiations', label: 'Allow Price Negotiations', type: 'boolean' },
    { key: 'status', label: 'Status', type: 'string' }, // 'draft' | 'published'
  ],
};

// Get all fields as a flat array (excluding combined)
export const getAllFields = () => [
  ...STANDARD_FIELDS.grouping,
  ...STANDARD_FIELDS.listing,
  ...STANDARD_FIELDS.vehicle,
];

// Get all fields including combined options
export const getAllFieldsWithCombined = () => [
  ...STANDARD_FIELDS.grouping,
  ...STANDARD_FIELDS.listing,
  ...STANDARD_FIELDS.vehicle,
  ...STANDARD_FIELDS.combined,
];

// Get required field keys
export const getRequiredFields = () =>
  getAllFields().filter(f => f.required).map(f => f.key);

// Check if a field key is a combined field
export const isCombinedField = (fieldKey) =>
  STANDARD_FIELDS.combined.some(f => f.key === fieldKey);

// Get combined field info
export const getCombinedFieldInfo = (fieldKey) =>
  STANDARD_FIELDS.combined.find(f => f.key === fieldKey);

// Edit wizard steps
export const EDIT_STEPS = [
  { id: 'basic', label: 'Basic Info', icon: 'FileText' },
  { id: 'features', label: 'Features', icon: 'Star' },
  { id: 'details', label: 'Details', icon: 'Settings' },
  { id: 'images', label: 'Images', icon: 'Upload' },
  { id: 'pricing', label: 'Pricing & Options', icon: 'DollarSign' },
];

// Default listing state for edit
export const getDefaultListingState = (listing = {}) => ({
  // From import
  id: listing.id || '',
  make: listing.make || '',
  model: listing.model || '',
  year: listing.year || '',
  color: listing.color || '',
  variant: listing.variant || '',
  bodyType: listing.bodyType || '',
  fuelType: listing.fuelType || '',
  transmission: listing.transmission || '',
  drivetrain: listing.drivetrain || '',
  engineSize: listing.engineSize || '',
  cylinders: listing.cylinders || '',
  horsepower: listing.horsepower || '',
  seatingCapacity: listing.seatingCapacity || '',
  doors: listing.doors || '',
  condition: listing.condition || '',
  regionalSpecs: listing.regionalSpecs || '',
  city: listing.city || '',
  country: listing.country || '',
  description: listing.description || '',
  vehicles: listing.vehicles || [],
  count: listing.count || 0,
  // Edit-only fields
  features: listing.features || [],
  images: listing.images || [],
  allowNegotiations: listing.allowNegotiations || false,
  status: listing.status || 'draft',
});
