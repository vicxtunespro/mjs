import React from 'react';
import { StepProps } from '../types';
import { RELIGION_OPTIONS } from '../constants';
import { PhotoUpload } from '../components/PhotoUpload';
import { AlertCircle } from 'lucide-react';

export const PersonalInfo: React.FC<StepProps> = ({
  data,
  photos,
  errors,
  onUpdate,
  onPhotoUpdate
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('name.')) {
      const field = name.replace('name.', '');

      onUpdate({
        name: {
          ...data.name,
          [field]: value,
        },
      });

      return;
    }

    onUpdate({ [name]: value });
  };

  const inputClassName =
    'w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition';

  const errorClassName =
    'mt-1 text-xs text-red-500 flex items-center gap-1';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name.first_name"
              value={data.name?.first_name || ''}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder="JOHN"
            />
            {errors['name.first_name'] && (
              <p className={errorClassName}>
                <AlertCircle className="w-3 h-3" />
                {errors['name.first_name']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name.last_name"
              value={data.name?.last_name || ''}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder="DOE"
            />
            {errors['name.last_name'] && (
              <p className={errorClassName}>
                <AlertCircle className="w-3 h-3" />
                {errors['name.last_name']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Other Names</label>
            <input
              type="text"
              name="name.other_names"
              value={data.name?.other_names || ''}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={data.gender || ''}
              onChange={handleInputChange}
              className={inputClassName}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors['gender'] && (
              <p className={errorClassName}>
                <AlertCircle className="w-3 h-3" />
                {errors['gender']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={data.date_of_birth || ''}
              onChange={handleInputChange}
              className={inputClassName}
            />
            {errors['date_of_birth'] && (
              <p className={errorClassName}>
                <AlertCircle className="w-3 h-3" />
                {errors['date_of_birth']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Religion</label>
            <select
              name="religion"
              value={data.religion || ''}
              onChange={handleInputChange}
              className={inputClassName}
            >
              <option value="">Select Religion</option>
              {RELIGION_OPTIONS.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right column - Photo upload */}
        <div className="flex justify-center">
          <PhotoUpload
            preview={photos.student.preview}
            onFileChange={(file) => {
              if (file) {
                const reader = new FileReader();

                reader.onloadend = () => {
                  onPhotoUpdate('student', file, reader.result as string);
                };

                reader.readAsDataURL(file);
              }
            }}
            onClear={() => onPhotoUpdate('student', null, '')}
            label="Student Photo"
          />
        </div>
      </div>

      {/* Optional IDs */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-4">Optional Information</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">LIN</label>
            <input
              type="text"
              name="LIN"
              value={data.LIN || ''}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder="Learner Identification Number"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Payment Code</label>
            <input
              type="text"
              name="payment_code"
              value={data.payment_code || ''}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder="Payment Code"
            />
          </div>
        </div>
      </div>
    </div>
  );
};