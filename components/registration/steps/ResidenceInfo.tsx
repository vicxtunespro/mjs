import React, { useState, useEffect } from 'react';
import { StepProps, Region } from '../types';
import { REGIONS } from '../constants';
import { getDistrictByRegion } from '@/types/residence.type';

export const ResidenceInfo: React.FC<StepProps> = ({
  data,
  onUpdate
}) => {
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (data.residence.region) {
      const availableDistricts = getDistrictByRegion(data.residence.region as Region);
      // Create a mutable copy of the readonly array
      setDistricts([...availableDistricts]);
    } else {
      setDistricts([]);
    }
  }, [data.residence.region]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('residence.')) {
      const field = name.replace('residence.', '');
      onUpdate({
        residence: {
          ...data.residence,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Residence Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm mb-1">Region</label>
          <select
            name="residence.region"
            value={data.residence.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Region</option>
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">District</label>
          <select
            name="residence.district"
            value={data.residence.district}
            onChange={handleChange}
            disabled={!data.residence.region}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Village</label>
          <input
            type="text"
            name="residence.village"
            value={data.residence.village}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter village name"
          />
        </div>
      </div>
    </div>
  );
};