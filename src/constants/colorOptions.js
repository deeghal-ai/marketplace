// Color options for the color picker
export const COLOR_OPTIONS = [
  { id: 'white', name: 'White', hex: '#FFFFFF', border: true },
  { id: 'black', name: 'Black', hex: '#1a1a1a' },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
  { id: 'gray', name: 'Gray', hex: '#808080' },
  { id: 'red', name: 'Red', hex: '#DC2626' },
  { id: 'blue', name: 'Blue', hex: '#2563EB' },
  { id: 'darkblue', name: 'Dark Blue', hex: '#1E3A5F' },
  { id: 'green', name: 'Green', hex: '#16A34A' },
  { id: 'beige', name: 'Beige', hex: '#D4A574' },
  { id: 'brown', name: 'Brown', hex: '#8B4513' },
  { id: 'gold', name: 'Gold', hex: '#DAA520' },
  { id: 'orange', name: 'Orange', hex: '#EA580C' },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308' },
  { id: 'purple', name: 'Purple', hex: '#9333EA' },
  { id: 'maroon', name: 'Maroon', hex: '#7F1D1D' },
  { id: 'champagne', name: 'Champagne', hex: '#F7E7CE' },
];

// Get color by ID
export const getColorById = (id) => 
  COLOR_OPTIONS.find(c => c.id === id || c.name.toLowerCase() === id?.toLowerCase());

// Get color hex by name
export const getColorHex = (name) => {
  const color = COLOR_OPTIONS.find(c => 
    c.name.toLowerCase() === name?.toLowerCase() ||
    c.id === name?.toLowerCase()
  );
  return color?.hex || '#808080';
};
