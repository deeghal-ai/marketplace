// Common vehicle features for suggestions
export const FEATURE_SUGGESTIONS = [
  // Comfort & Convenience
  'Leather Seats',
  'Heated Seats',
  'Cooled Seats',
  'Power Seats',
  'Memory Seats',
  'Sunroof',
  'Panoramic Roof',
  'Keyless Entry',
  'Push Button Start',
  'Remote Start',
  'Power Liftgate',
  'Automatic Climate Control',
  'Dual Zone Climate',
  'Tri Zone Climate',
  'Heated Steering Wheel',
  
  // Safety
  'Blind Spot Monitor',
  'Lane Departure Warning',
  'Lane Keep Assist',
  'Adaptive Cruise Control',
  'Forward Collision Warning',
  'Automatic Emergency Braking',
  'Rear Cross Traffic Alert',
  '360 Camera',
  'Parking Sensors',
  'Backup Camera',
  'Head-Up Display',
  'Night Vision',
  
  // Technology
  'Navigation',
  'Apple CarPlay',
  'Android Auto',
  'Wireless Charging',
  'Premium Sound System',
  'Bose Sound System',
  'Harman Kardon',
  'Bang & Olufsen',
  'Wi-Fi Hotspot',
  'USB Ports',
  'Bluetooth',
  'Voice Control',
  'Touchscreen Display',
  'Digital Instrument Cluster',
  
  // Exterior
  'LED Headlights',
  'Adaptive Headlights',
  'Fog Lights',
  'Roof Rails',
  'Running Boards',
  'Tow Package',
  'Alloy Wheels',
  'Chrome Trim',
  
  // Performance
  'Sport Mode',
  'All-Wheel Drive',
  'Sport Suspension',
  'Air Suspension',
  'Performance Brakes',
  'Paddle Shifters',
  
  // Other
  'Third Row Seating',
  'Ventilated Seats',
  'Massage Seats',
  'Power Mirrors',
  'Auto-Dimming Mirrors',
  'Rain Sensing Wipers',
];

// Get suggestions based on input
export const getFeatureSuggestions = (input, existingFeatures = []) => {
  if (!input) return [];
  const lowerInput = input.toLowerCase();
  return FEATURE_SUGGESTIONS
    .filter(f => 
      f.toLowerCase().includes(lowerInput) && 
      !existingFeatures.some(ef => ef.toLowerCase() === f.toLowerCase())
    )
    .slice(0, 5);
};
