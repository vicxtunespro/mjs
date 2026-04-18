import React from 'react';
import { Camera, X } from 'lucide-react';
import clsx from 'clsx';

interface PhotoUploadProps {
  preview: string;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  label: string;
  disabled?: boolean;
  verified?: boolean;
  existingUrl?: string;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  preview,
  onFileChange,
  onClear,
  label,
  disabled = false,
  verified = false,
  existingUrl,
  className
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const displayImage = preview || existingUrl;

  return (
    <div className={clsx("flex flex-col items-center", className)}>
      <div className="relative w-40 h-40 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={label} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        )}
        
        {!disabled && displayImage && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {!disabled && !verified && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`photo-${label.replace(/\s+/g, '-')}`}
          />
          <label
            htmlFor={`photo-${label.replace(/\s+/g, '-')}`}
            className="mt-2 text-sm text-gray-600 hover:text-gray-700 cursor-pointer"
          >
            {displayImage ? 'Change photo' : 'Upload photo'}
          </label>
        </>
      )}

      {verified && (
        <p className="mt-2 text-xs text-green-600">Verified guardian</p>
      )}
    </div>
  );
};