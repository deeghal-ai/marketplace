import React from 'react';
import { Image, AlertCircle, Info } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';

const ImagesStep = ({ listing, updateField }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-navy" />
          <h3 className="text-lg font-bold text-gray-800">Listing Images</h3>
        </div>
        
        <p className="text-gray-600">
          Add high-quality images of the vehicle. These images will be shown for all 
          <span className="font-semibold"> {listing.count} vehicle(s)</span> in this listing.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Listing-Level Images</p>
          <p className="text-sm text-blue-600 mt-1">
            Images you upload here apply to all vehicles in this listing. Since all vehicles 
            share the same make, model, year, and color, they use the same images.
          </p>
        </div>
      </div>

      {/* Image Uploader */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ImageUploader
          images={listing.images}
          onChange={(images) => updateField('images', images)}
          maxImages={10}
        />
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📷 Photo Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Take photos in good lighting, preferably outdoors
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Include exterior shots from all angles (front, back, sides)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Capture the interior, dashboard, and seating
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Show the engine bay and trunk/boot
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Highlight any special features or accessories
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            Avoid blurry or dark images
          </li>
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Images uploaded:</span>
          <span className="font-bold text-navy text-lg">{listing.images.length} / 10</span>
        </div>
      </div>
    </div>
  );
};

export default ImagesStep;
