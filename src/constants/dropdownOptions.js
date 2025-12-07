// Dropdown options for form fields

export const BODY_TYPES = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Wagon',
  'Van',
  'Minivan',
  'Pickup Truck',
  'Crossover',
  'Sports Car',
  'Luxury',
];

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid',
  'LPG',
  'CNG',
  'Hydrogen',
];

export const TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'CVT',
  'Semi-Automatic',
  'Dual Clutch (DCT)',
];

export const DRIVETRAINS = [
  'Front-Wheel Drive (FWD)',
  'Rear-Wheel Drive (RWD)',
  'All-Wheel Drive (AWD)',
  'Four-Wheel Drive (4WD)',
];

export const CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
];

export const REGIONAL_SPECS = [
  'GCC Specs',
  'American Specs',
  'European Specs',
  'Japanese Specs',
  'Korean Specs',
  'Chinese Specs',
  'Other',
];

export const CYLINDERS = [
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  'Electric Motor',
];

export const SEATING_CAPACITIES = [
  '2',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9+',
];

export const DOOR_COUNTS = [
  '2',
  '3',
  '4',
  '5',
];

// Popular car makes for the brand dropdown
export const CAR_MAKES = [
  'Audi',
  'BMW',
  'Chevrolet',
  'Dodge',
  'Ferrari',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Maserati',
  'Mazda',
  'Mercedes-Benz',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Porsche',
  'Ram',
  'Rolls-Royce',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

// Models by make (common models)
export const MODELS_BY_MAKE = {
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS6', 'RS7'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'M3', 'M5'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'AMG GT', 'EQS'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Yaris', 'Fortuner', 'Hilux', 'Supra'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'City', 'Jazz'],
  'Nissan': ['Altima', 'Maxima', 'Sentra', 'Patrol', 'X-Trail', 'Kicks', 'Pathfinder', 'GT-R'],
  'Ford': ['Mustang', 'F-150', 'Explorer', 'Bronco', 'Ranger', 'Edge', 'Expedition', 'Escape'],
  'Chevrolet': ['Camaro', 'Corvette', 'Silverado', 'Tahoe', 'Suburban', 'Traverse', 'Equinox', 'Malibu'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  'Lexus': ['ES', 'IS', 'LS', 'GS', 'RX', 'NX', 'LX', 'GX', 'LC', 'RC'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Discovery', 'Defender', 'Evoque'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Jetta', 'Arteon', 'ID.4', 'Polo'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Ioniq'],
  'Kia': ['K5', 'Stinger', 'Sportage', 'Sorento', 'Telluride', 'Seltos', 'Carnival', 'EV6'],
};

// Get models for a specific make
export const getModelsForMake = (make) => {
  return MODELS_BY_MAKE[make] || [];
};
