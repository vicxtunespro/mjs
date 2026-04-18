import React, { useEffect } from 'react';
import { StepProps } from '../types';
import { CLASS_OPTIONS_MAP, STREAM_OPTIONS_MAP, HOUSE_OPTIONS } from '../constants';
import { AlertCircle } from 'lucide-react';

export const AcademicInfo: React.FC<StepProps> = ({
  data,
  errors,
  onUpdate
}) => {
  const currentClassOptions = data.section ? CLASS_OPTIONS_MAP[data.section] : [];
  const currentStreamOptions = data.section ? STREAM_OPTIONS_MAP[data.section] : [];

  // Reset class when section changes
  useEffect(() => {
    if (data.section) {
      onUpdate({
        class: { name: '', stream: '' }
      });
    }
  }, [data.section]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('class.')) {
      const field = name.replace('class.', '');
      onUpdate({
        class: {
          ...data.class,
          [field]: value
        }
      });
    } else {
      onUpdate({ [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Academic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">
            Academic Section <span className="text-red-500">*</span>
          </label>
          <select
            name="section"
            value={data.section}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Section</option>
            <option value="Day Care">Day Care</option>
            <option value="Pre-Primary">Pre-Primary</option>
            <option value="Primary">Primary</option>
          </select>
          {errors['section'] && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors['section']}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            name="class.name"
            value={data.class.name}
            onChange={handleChange}
            disabled={!data.section}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Class</option>
            {currentClassOptions.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
          {errors['class.name'] && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors['class.name']}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Stream</label>
          <select
            name="class.stream"
            value={data.class.stream}
            onChange={handleChange}
            disabled={!data.section || currentStreamOptions.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Stream</option>
            {currentStreamOptions.map(stream => (
              <option key={stream} value={stream}>{stream}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">School Section</label>
          <select
            name="house"
            value={data.house}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select House</option>
            {HOUSE_OPTIONS.map(house => (
              <option key={house} value={house}>{house}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Club</label>
        <input
          type="text"
          name="club"
          value={data.club}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter club name"
        />
      </div>
    </div>
  );
};