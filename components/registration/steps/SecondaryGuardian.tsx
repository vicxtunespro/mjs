import React from 'react';
import { GuardianStepProps } from '../types';
import { RELATIONSHIP_OPTIONS } from '../constants';
import { PhotoUpload } from '../components/PhotoUpload';
import { AlertCircle, Verified, OctagonX, X } from 'lucide-react';
import clsx from 'clsx';

interface SecondaryGuardianProps extends GuardianStepProps {
  onRemove: () => void;
}

export const SecondaryGuardian: React.FC<SecondaryGuardianProps> = ({
  data,
  photos,
  errors,
  isContinuing,
  continuingId,
  verifyState,
  onUpdate,
  onPhotoUpdate,
  onContinuingToggle,
  onContinuingIdChange,
  onVerify,
  onRemove
}) => {
  // Provide default values for guardianData
  const guardianData = data.guardian2 || {
    full_name: '',
    contact: '',
    nin: '',
    email: '',
    relationship: ''
  };
  
  const photoData = isContinuing ? photos.continuingGuardian2 : photos.guardian2;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('guardian2.')) {
      const field = name.replace('guardian2.', '') as keyof typeof guardianData;
      onUpdate({
        guardian2: {
          ...guardianData,
          [field]: value
        }
      });
    }
  };

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isContinuing) {
          onPhotoUpdate('continuingGuardian2', file, reader.result as string, photoData.existingUrl);
        } else {
          onPhotoUpdate('guardian2', file, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (isContinuing) {
        onPhotoUpdate('continuingGuardian2', null, '', photoData.existingUrl);
      } else {
        onPhotoUpdate('guardian2', null, '');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Secondary Guardian Information</h2>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => onContinuingToggle(false)}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition",
            !isContinuing
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          New Guardian
        </button>
        <button
          type="button"
          onClick={() => onContinuingToggle(true)}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition",
            isContinuing
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Continuing Parent
        </button>
      </div>

      {!isContinuing ? (
        // New Guardian Form
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="guardian2.full_name"
                value={guardianData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JOHN DOE"
              />
              {errors['guardian2.full_name'] && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors['guardian2.full_name']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="guardian2.contact"
                value={guardianData.contact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+256700000000"
              />
              {errors['guardian2.contact'] && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors['guardian2.contact']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                NIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="guardian2.nin"
                value={guardianData.nin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CM00000000000AA"
              />
              {errors['guardian2.nin'] && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors['guardian2.nin']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="guardian2.email"
                value={guardianData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                name="guardian2.relationship"
                value={guardianData.relationship}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Relationship</option>
                {RELATIONSHIP_OPTIONS.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              {errors['guardian2.relationship'] && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors['guardian2.relationship']}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <PhotoUpload
              preview={photoData.preview}
              onFileChange={handlePhotoChange}
              onClear={() => handlePhotoChange(null)}
              label="Guardian Photo"
            />
          </div>
        </div>
      ) : (
        // Continuing Parent Form
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Enter the Guardian ID for the continuing parent
          </p>

          <div className="max-w-md">
            <label className="block text-sm mb-1">
              Guardian ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={continuingId}
              onChange={(e) => onContinuingIdChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="G240101123456789"
            />
            {errors['continuingGuardian2ID'] && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors['continuingGuardian2ID']}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onVerify}
            disabled={verifyState === 'loading' || !continuingId}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition",
              verifyState === 'idle' && "bg-red-600 text-white hover:bg-red-700",
              verifyState === 'loading' && "bg-gray-400 text-white cursor-not-allowed",
              verifyState === 'success' && "bg-green-600 text-white",
              verifyState === 'error' && "bg-red-600 text-white"
            )}
          >
            {verifyState === 'loading' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {verifyState === 'success' && <Verified className="w-4 h-4" />}
            {verifyState === 'error' && <OctagonX className="w-4 h-4" />}
            
            <span>
              {verifyState === 'idle' && 'Verify Guardian'}
              {verifyState === 'loading' && 'Verifying...'}
              {verifyState === 'success' && 'Verified'}
              {verifyState === 'error' && 'Not Found'}
            </span>
          </button>

          {verifyState === 'success' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    value={guardianData.full_name}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Contact</label>
                  <input
                    type="text"
                    value={guardianData.contact}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">NIN</label>
                  <input
                    type="text"
                    value={guardianData.nin}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="text"
                    value={guardianData.email || 'Not Provided'}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="guardian2.relationship"
                    value={guardianData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Relationship</option>
                    {RELATIONSHIP_OPTIONS.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <PhotoUpload
                  preview={photoData.preview}
                  existingUrl={photoData.existingUrl}
                  onFileChange={handlePhotoChange}
                  onClear={() => handlePhotoChange(null)}
                  label="Guardian Photo"
                  verified={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};