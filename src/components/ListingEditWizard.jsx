import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, Send, X } from 'lucide-react';
import StepProgress from './common/StepProgress';
import BasicInfoStep from './edit-steps/BasicInfoStep';
import FeaturesStep from './edit-steps/FeaturesStep';
import DetailsStep from './edit-steps/DetailsStep';
import ImagesStep from './edit-steps/ImagesStep';
import PricingStep from './edit-steps/PricingStep';
import useListingEdit from '../hooks/useListingEdit';
import { EDIT_STEPS } from '../constants/standardFields';

const ListingEditWizard = ({ listing, onSave, onCancel }) => {
  const {
    listing: editedListing,
    currentStep,
    stepsStatus,
    hasChanges,
    summary,
    updateField,
    updateFields,
    updateVehicle,
    addVehicle,
    removeVehicle,
    addFeature,
    removeFeature,
    goToStep,
    nextStep,
    prevStep,
    initializeListing,
    saveAsDraft,
    publishListing,
  } = useListingEdit(listing);

  // Initialize when listing changes
  useEffect(() => {
    if (listing) {
      initializeListing(listing);
    }
  }, [listing?.id]);

  const handleSaveDraft = () => {
    const draft = saveAsDraft();
    onSave(draft);
  };

  const handlePublish = () => {
    const published = publishListing();
    onSave(published);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            listing={editedListing} 
            updateField={updateField} 
          />
        );
      case 1:
        return (
          <FeaturesStep 
            listing={editedListing} 
            addFeature={addFeature}
            removeFeature={removeFeature}
          />
        );
      case 2:
        return (
          <DetailsStep 
            listing={editedListing}
            updateVehicle={updateVehicle}
            addVehicle={addVehicle}
            removeVehicle={removeVehicle}
          />
        );
      case 3:
        return (
          <ImagesStep 
            listing={editedListing}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <PricingStep 
            listing={editedListing}
            updateField={updateField}
            updateVehicle={updateVehicle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-navy">
                  {editedListing.id ? 'Edit Listing' : 'New Listing'}
                </h1>
                <p className="text-sm text-gray-500">{summary.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span className={`badge ${editedListing.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                {editedListing.status === 'published' ? 'Published' : 'Draft'}
              </span>
              
              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                className="btn-secondary"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              
              {/* Publish Button */}
              <button
                onClick={handlePublish}
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <StepProgress 
            steps={EDIT_STEPS} 
            currentStep={currentStep} 
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {EDIT_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep 
                      ? 'bg-navy w-4' 
                      : idx < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {currentStep < EDIT_STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Publish Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingEditWizard;
