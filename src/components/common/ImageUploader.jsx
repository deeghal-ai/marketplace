import React, { useState } from 'react';
import { Upload, X, Image, AlertCircle } from 'lucide-react';

const ImageUploader = ({ images = [], onChange, maxImages = 10 }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Image upload disabled for now
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Upload up to {maxImages} images ({images.length}/{maxImages})
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled
        >
          <Upload className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          
          {images.length === 0 ? (
            <>
              <div className="text-center">
                <p className="text-gray-600 font-medium">No images uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Image" to upload your first image
                </p>
              </div>
              
              {/* Coming Soon Notice */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Image upload coming soon. Save draft without images for now.
                </span>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-5 gap-4 w-full">
              {images.map((image, idx) => (
                <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Vehicle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onChange(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
