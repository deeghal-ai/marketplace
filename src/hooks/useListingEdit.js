import { useState, useCallback, useMemo } from 'react';
import { getDefaultListingState, EDIT_STEPS } from '../constants/standardFields';

/**
 * Custom hook for managing listing edit state
 * Handles the 5-step edit wizard
 */
export const useListingEdit = (initialListing = null) => {
  // Current step (0-4)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Listing data being edited
  const [listing, setListing] = useState(() => 
    getDefaultListingState(initialListing)
  );
  
  // Track which steps have been visited
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));
  
  // Validation errors per step
  const [errors, setErrors] = useState({});

  // Initialize with a listing
  const initializeListing = useCallback((listingData) => {
    setListing(getDefaultListingState(listingData));
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
    setErrors({});
  }, []);

  // Update listing field
  const updateField = useCallback((field, value) => {
    setListing(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update multiple fields at once
  const updateFields = useCallback((fields) => {
    setListing(prev => ({
      ...prev,
      ...fields,
    }));
  }, []);

  // Update a specific vehicle in the vehicles array
  const updateVehicle = useCallback((index, field, value) => {
    setListing(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  }, []);

  // Add a new vehicle
  const addVehicle = useCallback(() => {
    setListing(prev => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
        { vin: '', registrationNumber: '', mileage: '', owners: '', warranty: '', price: '' }
      ],
      count: prev.count + 1,
    }));
  }, []);

  // Remove a vehicle
  const removeVehicle = useCallback((index) => {
    setListing(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
      count: Math.max(0, prev.count - 1),
    }));
  }, []);

  // Features management
  const addFeature = useCallback((feature) => {
    if (!feature.trim()) return;
    setListing(prev => ({
      ...prev,
      features: [...new Set([...prev.features, feature.trim()])],
    }));
  }, []);

  const removeFeature = useCallback((feature) => {
    setListing(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  }, []);

  // Navigation
  const goToStep = useCallback((step) => {
    if (step >= 0 && step < EDIT_STEPS.length) {
      setCurrentStep(step);
      setVisitedSteps(prev => new Set([...prev, step]));
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < EDIT_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setVisitedSteps(prev => new Set([...prev, next]));
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Validation for each step
  const validateStep = useCallback((step) => {
    const stepErrors = {};
    
    switch (step) {
      case 0: // Basic Info
        // All fields are optional now, but we can add validation later
        break;
      case 1: // Features
        // No required fields
        break;
      case 2: // Details
        // Check if at least one vehicle has VIN (optional but recommended)
        break;
      case 3: // Images
        // No required fields (images are optional)
        break;
      case 4: // Pricing
        // No required fields
        break;
    }
    
    return stepErrors;
  }, []);

  // Check if a step is complete (all required fields filled)
  const isStepComplete = useCallback((step) => {
    // Since all fields are optional, we consider a step complete if visited
    return visitedSteps.has(step);
  }, [visitedSteps]);

  // Get completion status for all steps
  const stepsStatus = useMemo(() => {
    return EDIT_STEPS.map((step, index) => ({
      ...step,
      isComplete: isStepComplete(index),
      isActive: index === currentStep,
      isVisited: visitedSteps.has(index),
    }));
  }, [currentStep, visitedSteps, isStepComplete]);

  // Save as draft
  const saveAsDraft = useCallback(() => {
    return {
      ...listing,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
  }, [listing]);

  // Publish listing
  const publishListing = useCallback(() => {
    return {
      ...listing,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [listing]);

  // Check if listing has any changes from initial
  const hasChanges = useMemo(() => {
    if (!initialListing) return true;
    return JSON.stringify(listing) !== JSON.stringify(getDefaultListingState(initialListing));
  }, [listing, initialListing]);

  // Get listing summary for preview
  const summary = useMemo(() => ({
    title: `${listing.year} ${listing.make} ${listing.model}`.trim() || 'Untitled Listing',
    variant: listing.variant || '',
    color: listing.color || '',
    vehicleCount: listing.count,
    featuresCount: listing.features.length,
    hasImages: listing.images.length > 0,
    status: listing.status,
    priceRange: listing.vehicles.length > 0 
      ? {
          min: Math.min(...listing.vehicles.map(v => parseFloat(v.price) || 0).filter(p => p > 0)) || 0,
          max: Math.max(...listing.vehicles.map(v => parseFloat(v.price) || 0)) || 0,
        }
      : { min: 0, max: 0 },
  }), [listing]);

  return {
    // State
    listing,
    currentStep,
    stepsStatus,
    errors,
    hasChanges,
    summary,
    
    // Field updates
    updateField,
    updateFields,
    updateVehicle,
    addVehicle,
    removeVehicle,
    addFeature,
    removeFeature,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Lifecycle
    initializeListing,
    saveAsDraft,
    publishListing,
    validateStep,
  };
};

export default useListingEdit;
