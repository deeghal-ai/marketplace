import React from 'react';
import { Check, FileText, Star, Settings, Upload, DollarSign } from 'lucide-react';

const STEP_ICONS = {
  'FileText': FileText,
  'Star': Star,
  'Settings': Settings,
  'Upload': Upload,
  'DollarSign': DollarSign,
};

const StepProgress = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 mx-12" />
      <div 
        className="absolute top-6 left-0 h-1 bg-green-500 mx-12 transition-all duration-300"
        style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 6rem)` }}
      />
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon] || FileText;
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div 
              key={step.id}
              className="step-indicator cursor-pointer"
              onClick={() => onStepClick(index)}
            >
              <div 
                className={`step-circle ${
                  isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span 
                className={`step-label mt-2 ${
                  isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
