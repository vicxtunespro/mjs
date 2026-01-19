'use client'
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Search, Edit, Camera, X, Upload, FileWarning, UserPlus, MapPin, Users, Book } from 'lucide-react';
import clsx from 'clsx';
import { getDistrictByRegion, Region } from '@/types/residence.type';

type Gender = 'Male' | 'Female' | 'Other';
type Section = 'Day Care' | 'Pre-Primary' | 'Primary';
type Relationship = 'Mother' | 'Father' | 'Guardian' | 'Sibling' | 'Relative' | 'Other';

interface GuardianData {
  full_name: string;
  contact: string;
  nin: string;
  email?: string;
  relationship: Relationship | '';
  guardian_id?: string;
  photo?: string;
}

interface StudentData {
  registration_id?: string;
  LIN?: string;
  payment_code?: string;
  name: {
    first_name: string;
    last_name: string;
    other_names?: string;
  };
  class: {
    name: string;
    stream?: string;
  };
  gender: Gender | '';
  date_of_birth: string;
  religion?: string;
  section: Section | '';
  house?: string;
  club?: string;
  residence: {
    region?: string;
    district?: string;
    village?: string;
  };
  guardian1?: GuardianData;
  guardian2?: GuardianData;
  photo?: string;
}

const CLASS_OPTIONS_MAP = {
  'Day Care': ['Infant', 'Toddler', 'Pre-Nursery'],
  'Pre-Primary': ['Pre A', 'Pre B', 'Pre C'],
  'Primary': ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7']
};

const STREAM_OPTIONS_MAP = {
  'Day Care': [],
  'Pre-Primary': ['1', '2', '3'],
  'Primary': ['Apple', 'Lemon', 'Orange']
};

const HOUSE_OPTIONS = ['Day', 'Bording'];
const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hindu', 'Other'];
const RELATIONSHIP_OPTIONS: Relationship[] = ['Mother', 'Father', 'Guardian', 'Sibling', 'Relative', 'Other'];

const CLOUDINARY_UPLOAD_PRESET = 'mjs-admission-photos';
const CLOUDINARY_CLOUD_NAME = 'dzidperyt';

export default function StudentUpdateForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'registration_id' | 'LIN' | 'payment_code'>('registration_id');
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [studentFound, setStudentFound] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);

  // Photo states
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string>('');
  const [guardian1PhotoFile, setGuardian1PhotoFile] = useState<File | null>(null);
  const [guardian1PhotoPreview, setGuardian1PhotoPreview] = useState<string>('');
  const [guardian2PhotoFile, setGuardian2PhotoFile] = useState<File | null>(null);
  const [guardian2PhotoPreview, setGuardian2PhotoPreview] = useState<string>('');

  const [studentData, setStudentData] = useState<StudentData>({
    name: { first_name: '', last_name: '', other_names: '' },
    class: { name: '', stream: '' },
    gender: '',
    date_of_birth: '',
    religion: '',
    section: '',
    house: '',
    club: '',
    residence: { region: '', district: '', village: '' },
    guardian1: { full_name: '', contact: '', nin: '', email: '', relationship: '' },
    guardian2: { full_name: '', contact: '', nin: '', email: '', relationship: '' },
    photo: '',
  });

  const [originalStudentData, setOriginalStudentData] = useState<StudentData | null>(null);

  // Search for student
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search value');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setStudentFound(false);

    try {
      const response = await fetch(
        `https://mjs-backend-server.onrender.com/students/view?${searchType}=${searchQuery.trim()}`
      );

      if (!response.ok) {
        throw new Error('Student not found');
      }

      const result = await response.json();
      const student = result.data;

      // Populate form with student data
      const loadedData: StudentData = {
        registration_id: student.registration_id || '',
        LIN: student.LIN || '',
        payment_code: student.payment_code || '',
        name: {
          first_name: student.name?.first_name || '',
          last_name: student.name?.last_name || '',
          other_names: student.name?.other_names || '',
        },
        class: {
          name: student.class?.name || '',
          stream: student.class?.stream || '',
        },
        gender: student.gender || '',
        date_of_birth: student.date_of_birth || '',
        religion: student.religion || '',
        section: student.section || '',
        house: student.house || '',
        club: student.club || '',
        residence: {
          region: student.residence?.region || '',
          district: student.residence?.district || '',
          village: student.residence?.village || '',
        },
        photo: student.photo || '',
      };

      // Load guardian data
      if (student.guardian1?.guardian_id) {
        const g1Response = await fetch(
          `https://mjs-backend-server.onrender.com/guardians/view/${student.guardian1.guardian_id}`
        );
        if (g1Response.ok) {
          const g1Data = await g1Response.json();
          loadedData.guardian1 = {
            guardian_id: g1Data.data.guardian_id,
            full_name: g1Data.data.full_name || '',
            contact: g1Data.data.contact || '',
            nin: g1Data.data.nin || '',
            email: g1Data.data.email || '',
            relationship: student.guardian1.relationship || '',
            photo: g1Data.data.photo || '',
          };
          setGuardian1PhotoPreview(g1Data.data.photo || '');
        }
      }

      if (student.guardian2?.guardian_id) {
        const g2Response = await fetch(
          `https://mjs-backend-server.onrender.com/guardians/view/${student.guardian2.guardian_id}`
        );
        if (g2Response.ok) {
          const g2Data = await g2Response.json();
          loadedData.guardian2 = {
            guardian_id: g2Data.data.guardian_id,
            full_name: g2Data.data.full_name || '',
            contact: g2Data.data.contact || '',
            nin: g2Data.data.nin || '',
            email: g2Data.data.email || '',
            relationship: student.guardian2.relationship || '',
            photo: g2Data.data.photo || '',
          };
          setGuardian2PhotoPreview(g2Data.data.photo || '');
        }
      }

      setStudentData(loadedData);
      setOriginalStudentData(JSON.parse(JSON.stringify(loadedData)));
      setStudentPhotoPreview(student.photo || '');
      setStudentFound(true);

      // Load districts if region exists
      if (loadedData.residence.region) {
        getDistricts(loadedData.residence.region as Region);
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to find student');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('guardian1.')) {
      const field = name.replace('guardian1.', '');
      setStudentData(prev => ({
        ...prev,
        guardian1: { ...prev.guardian1!, [field]: value }
      }));
    } else if (name.startsWith('guardian2.')) {
      const field = name.replace('guardian2.', '');
      setStudentData(prev => ({
        ...prev,
        guardian2: { ...prev.guardian2!, [field]: value }
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStudentData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StudentData] as any),
          [child]: value
        }
      }));
    } else {
      setStudentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('guardian1.')) {
      const field = name.replace('guardian1.', '');
      setStudentData(prev => ({
        ...prev,
        guardian1: { ...prev.guardian1!, [field]: value }
      }));
    } else if (name.startsWith('guardian2.')) {
      const field = name.replace('guardian2.', '');
      setStudentData(prev => ({
        ...prev,
        guardian2: { ...prev.guardian2!, [field]: value }
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStudentData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StudentData] as any),
          [child]: value
        }
      }));
    } else {
      setStudentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.secure_url;
  };

  const handleStudentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setStudentPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardian1PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuardian1PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGuardian1PhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardian2PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuardian2PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGuardian2PhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getDistricts = (selectedRegion: Region) => {
    const availableDistricts = getDistrictByRegion(selectedRegion);
    setDistricts([...availableDistricts]);
  };

  const handleUpdate = async () => {
    setUpdateMessage('');
    setUpdateStatus('idle');
    setIsUpdating(true);

    try {
      // Upload new photos if changed
      let studentPhotoUrl = studentData.photo;
      let guardian1PhotoUrl = studentData.guardian1?.photo;
      let guardian2PhotoUrl = studentData.guardian2?.photo;

      if (studentPhotoFile) {
        studentPhotoUrl = await uploadToCloudinary(studentPhotoFile);
      }
      if (guardian1PhotoFile) {
        guardian1PhotoUrl = await uploadToCloudinary(guardian1PhotoFile);
      }
      if (guardian2PhotoFile) {
        guardian2PhotoUrl = await uploadToCloudinary(guardian2PhotoFile);
      }

      // Update student
      const studentPayload: any = {
        name: {
          first_name: studentData.name.first_name.trim(),
          last_name: studentData.name.last_name.trim(),
          ...(studentData.name.other_names?.trim() && { other_names: studentData.name.other_names.trim() }),
        },
        class: {
          name: studentData.class.name,
          ...(studentData.class.stream && { stream: studentData.class.stream }),
        },
        gender: studentData.gender,
        date_of_birth: studentData.date_of_birth,
        section: studentData.section,
        ...(studentData.religion && { religion: studentData.religion }),
        house: studentData.house ?? null,
        ...(studentData.club && { club: studentData.club.trim() }),
        ...(studentPhotoUrl && { photo: studentPhotoUrl }),
        ...(studentData.LIN && { LIN: studentData.LIN.trim() }),
        ...(studentData.payment_code && { payment_code: studentData.payment_code.trim() }),
      };

      if (studentData.residence.region || studentData.residence.district || studentData.residence.village) {
        studentPayload.residence = {};
        if (studentData.residence.region?.trim()) studentPayload.residence.region = studentData.residence.region.trim();
        if (studentData.residence.district?.trim()) studentPayload.residence.district = studentData.residence.district.trim();
        if (studentData.residence.village?.trim()) studentPayload.residence.village = studentData.residence.village.trim();
      }

      const studentResponse = await fetch(
        `https://mjs-backend-server.onrender.com/students/update/${studentData.registration_id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentPayload),
        }
      );

      if (!studentResponse.ok) throw new Error('Failed to update student');

      // Update guardians
      if (studentData.guardian1?.guardian_id) {
        const g1Payload: any = {
          full_name: studentData.guardian1.full_name.trim(),
          contact: studentData.guardian1.contact.trim(),
          nin: studentData.guardian1.nin.trim(),
          ...(studentData.guardian1.email?.trim() && { email: studentData.guardian1.email.trim() }),
          ...(guardian1PhotoUrl && { photo: guardian1PhotoUrl }),
        };

        await fetch(
          `https://mjs-backend-server.onrender.com/guardians/update/${studentData.guardian1.guardian_id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(g1Payload),
          }
        );
      }

      if (studentData.guardian2?.guardian_id) {
        const g2Payload: any = {
          full_name: studentData.guardian2.full_name.trim(),
          contact: studentData.guardian2.contact.trim(),
          nin: studentData.guardian2.nin.trim(),
          ...(studentData.guardian2.email?.trim() && { email: studentData.guardian2.email.trim() }),
          ...(guardian2PhotoUrl && { photo: guardian2PhotoUrl }),
        };

        await fetch(
          `https://mjs-backend-server.onrender.com/guardians/update/${studentData.guardian2.guardian_id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(g2Payload),
          }
        );
      }

      setUpdateStatus('success');
      setUpdateMessage('Student and guardian information updated successfully!');
      
      // Reset photo files
      setStudentPhotoFile(null);
      setGuardian1PhotoFile(null);
      setGuardian2PhotoFile(null);

    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setStudentFound(false);
    setSearchError('');
    setUpdateStatus('idle');
    setUpdateMessage('');
    setStudentPhotoFile(null);
    setStudentPhotoPreview('');
    setGuardian1PhotoFile(null);
    setGuardian1PhotoPreview('');
    setGuardian2PhotoFile(null);
    setGuardian2PhotoPreview('');
    setStudentData({
      name: { first_name: '', last_name: '', other_names: '' },
      class: { name: '', stream: '' },
      gender: '',
      date_of_birth: '',
      religion: '',
      section: '',
      house: '',
      club: '',
      residence: { region: '', district: '', village: '' },
      guardian1: { full_name: '', contact: '', nin: '', email: '', relationship: '' },
      guardian2: { full_name: '', contact: '', nin: '', email: '', relationship: '' },
      photo: '',
    });
  };

  const currentClassOptions = studentData.section ? CLASS_OPTIONS_MAP[studentData.section] : [];
  const currentStreamOptions = studentData.section ? STREAM_OPTIONS_MAP[studentData.section] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary dark:from-secondary dark:to-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-primary dark:bg-secondary rounded-xl shadow-lg border border-primary dark:border-secondary p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-cta" />
            <h2 className="text-lg font-semibold text-secondary dark:text-primary">Search Student</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
            >
              <option value="registration_id">Registration ID</option>
              <option value="LIN">LIN</option>
              <option value="payment_code">Payment Code</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`Enter ${searchType.replace('_', ' ')}`}
              className="px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
            />

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-cta text-primary dark:text-secondary rounded-lg hover:bg-cta-midtone transition flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {searchError && (
            <div className="mt-4 bg-cta-low border border-cta rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cta" />
              <p className="text-sm text-cta">{searchError}</p>
            </div>
          )}
        </div>

        {/* Update Status Messages */}
        {updateStatus === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300">{updateMessage}</p>
          </div>
        )}

        {updateStatus === 'error' && (
          <div className="mb-6 bg-cta-low border border-cta rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-cta" />
            <p className="text-cta">{updateMessage}</p>
          </div>
        )}

        {/* Student Update Form */}
        {studentFound && (
          <div className="bg-primary dark:bg-secondary rounded-xl shadow-lg border border-primary dark:border-secondary">
            {/* Personal Information */}
            <div className="p-8 border-b border-primary dark:border-secondary">
              <div className="flex items-center gap-2 mb-6">
                <Edit className="w-5 h-5 text-cta" />
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Registration ID
                    </label>
                    <input
                      type="text"
                      value={studentData.registration_id}
                      disabled
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary-plus/50 dark:bg-secondary/50 text-secondary dark:text-primary cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name.first_name"
                      value={studentData.name.first_name}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="name.last_name"
                      value={studentData.name.last_name}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Other Names
                    </label>
                    <input
                      type="text"
                      name="name.other_names"
                      value={studentData.name.other_names}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={studentData.gender}
                      onChange={handleSelectChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={studentData.date_of_birth}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Religion
                    </label>
                    <select
                      name="religion"
                      value={studentData.religion}
                      onChange={handleSelectChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    >
                      <option value="">-- Select Religion --</option>
                      {RELIGION_OPTIONS.map(religion => (
                        <option key={religion} value={religion}>{religion}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      LIN
                    </label>
                    <input
                      type="text"
                      name="LIN"
                      value={studentData.LIN || ''}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                      Payment Code
                    </label>
                    <input
                      type="text"
                      name="payment_code"
                      value={studentData.payment_code || ''}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-primary-plus dark:border-secondary rounded-lg flex items-center justify-center bg-primary dark:bg-secondary overflow-hidden relative">
                    {studentPhotoPreview ? (
                      <>
                        <img src={studentPhotoPreview} alt="Student" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setStudentPhotoFile(null);
                            setStudentPhotoPreview(studentData.photo || '');
                          }}
                          className="absolute top-2 right-2 bg-cta text-primary p-1 rounded-full hover:bg-cta-midtone"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-secondary-minus dark:text-secondary mx-auto mb-2" />
                        <p className="text-sm text-secondary-minus dark:text-secondary">No Photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStudentPhotoChange}
                    className="hidden"
                    id="student-photo-upload"
                  />
                  <label
                    htmlFor="student-photo-upload"
                    className="mt-4 px-4 py-2 bg-cta text-primary rounded-lg cursor-pointer hover:bg-cta-midtone transition flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {studentPhotoPreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="p-8 border-b border-primary dark:border-secondary">
              <div className="flex items-center gap-2 mb-6">
                <Book className="w-5 h-5 text-cta" />
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Academic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    Academic Section
                  </label>
                  <select
                    name="section"
                    value={studentData.section}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                  >
                    <option value="">-- Select Section --</option>
                    <option value="Day Care">Day Care</option>
                    <option value="Pre-Primary">Pre-Primary</option>
                    <option value="Primary">Primary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    Class
                  </label>
                  <select
                    name="class.name"
                    value={studentData.class.name}
                    onChange={handleSelectChange}
                    disabled={!studentData.section}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary disabled:bg-primary-plus/50 dark:disabled:bg-secondary/50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Class --</option>
                    {currentClassOptions.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    Stream
                  </label>
                  <select
                    name="class.stream"
                    value={studentData.class.stream}
                    onChange={handleSelectChange}
                    disabled={!studentData.section || currentStreamOptions.length === 0}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary disabled:bg-primary-plus/50 dark:disabled:bg-secondary/50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Stream --</option>
                    {currentStreamOptions.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    School Section
                  </label>
                  <select
                    name="house"
                    value={studentData.house}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                  >
                    <option value="">-- Select House --</option>
                    {HOUSE_OPTIONS.map(house => (
                      <option key={house} value={house}>{house}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                  Club
                </label>
                <input
                  type="text"
                  name="club"
                  value={studentData.club}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                  placeholder="Enter club name"
                />
              </div>
            </div>

            {/* Residence Information */}
            <div className="p-8 border-b border-primary dark:border-secondary">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-cta" />
                <h2 className="text-lg font-semibold text-secondary dark:text-primary">Residence Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    Region
                  </label>
                  <select
                    name="residence.region"
                    value={studentData.residence.region}
                    onChange={(e) => {
                      const selectedRegion = e.target.value as Region;
                      handleSelectChange(e);
                      if (selectedRegion) {
                        getDistricts(selectedRegion);
                      }
                    }}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                  >
                    <option value=''>-- Select Region --</option>
                    <option value='Central'>Central</option>
                    <option value='Eastern'>Eastern</option>
                    <option value='Western'>Western</option>
                    <option value='Northern'>North</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    District
                  </label>
                  <select
                    name="residence.district"
                    value={studentData.residence.district}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                  >
                    <option value=''>-- Select District --</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="residence.village"
                    value={studentData.residence.village}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                    placeholder="Nakawa"
                  />
                </div>
              </div>
            </div>

            {/* Guardian 1 Information */}
            {studentData.guardian1?.guardian_id && (
              <div className="p-8 border-b border-primary-plus dark:border-secondary bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-cta" />
                  <h2 className="text-lg font-semibold text-secondary dark:text-primary">Primary Guardian Information</h2>
                  <span className="text-xs bg-cta-low text-cta px-2 py-1 rounded">ID: {studentData.guardian1.guardian_id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="guardian1.full_name"
                        value={studentData.guardian1.full_name}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Contact
                      </label>
                      <input
                        type="tel"
                        name="guardian1.contact"
                        value={studentData.guardian1.contact}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        NIN
                      </label>
                      <input
                        type="text"
                        name="guardian1.nin"
                        value={studentData.guardian1.nin}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="guardian1.email"
                        value={studentData.guardian1.email}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Relationship
                      </label>
                      <select
                        name="guardian1.relationship"
                        value={studentData.guardian1.relationship}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      >
                        <option value="">-- Select Relationship --</option>
                        {RELATIONSHIP_OPTIONS.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-40 h-40 border-2 border-dashed border-primary-plus dark:border-secondary rounded-lg flex items-center justify-center bg-primary dark:bg-secondary overflow-hidden relative">
                      {guardian1PhotoPreview ? (
                        <>
                          <img src={guardian1PhotoPreview} alt="Guardian 1" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setGuardian1PhotoFile(null);
                              setGuardian1PhotoPreview(studentData.guardian1?.photo || '');
                            }}
                            className="absolute top-1 right-1 bg-cta text-primary p-1 rounded-full hover:bg-cta-midtone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-10 h-10 text-secondary-minus dark:text-secondary mx-auto mb-2" />
                          <p className="text-xs text-secondary-minus dark:text-secondary">No Photo</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGuardian1PhotoChange}
                      className="hidden"
                      id="guardian1-photo-upload"
                    />
                    <label
                      htmlFor="guardian1-photo-upload"
                      className="mt-3 px-3 py-1.5 text-sm bg-cta text-primary rounded-lg cursor-pointer hover:bg-cta-midtone transition flex items-center gap-2"
                    >
                      <Upload className="w-3 h-3" />
                      {guardian1PhotoPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Guardian 2 Information */}
            {studentData.guardian2?.guardian_id && (
              <div className="p-8 border-b border-primary-plus dark:border-secondary bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-cta" />
                  <h2 className="text-lg font-semibold text-secondary dark:text-primary">Secondary Guardian Information</h2>
                  <span className="text-xs bg-cta-low text-cta px-2 py-1 rounded">ID: {studentData.guardian2.guardian_id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="guardian2.full_name"
                        value={studentData.guardian2.full_name}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Contact
                      </label>
                      <input
                        type="tel"
                        name="guardian2.contact"
                        value={studentData.guardian2.contact}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        NIN
                      </label>
                      <input
                        type="text"
                        name="guardian2.nin"
                        value={studentData.guardian2.nin}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="guardian2.email"
                        value={studentData.guardian2.email}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-primary-plus mb-1">
                        Relationship
                      </label>
                      <select
                        name="guardian2.relationship"
                        value={studentData.guardian2.relationship}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 border border-primary-plus dark:border-secondary rounded-lg bg-primary dark:bg-secondary text-secondary dark:text-primary"
                      >
                        <option value="">-- Select Relationship --</option>
                        {RELATIONSHIP_OPTIONS.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-40 h-40 border-2 border-dashed border-primary-plus dark:border-secondary rounded-lg flex items-center justify-center bg-primary dark:bg-secondary overflow-hidden relative">
                      {guardian2PhotoPreview ? (
                        <>
                          <img src={guardian2PhotoPreview} alt="Guardian 2" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setGuardian2PhotoFile(null);
                              setGuardian2PhotoPreview(studentData.guardian2?.photo || '');
                            }}
                            className="absolute top-1 right-1 bg-cta text-primary p-1 rounded-full hover:bg-cta-midtone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-10 h-10 text-secondary-minus dark:text-secondary mx-auto mb-2" />
                          <p className="text-xs text-secondary-minus dark:text-secondary">No Photo</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGuardian2PhotoChange}
                      className="hidden"
                      id="guardian2-photo-upload"
                    />
                    <label
                      htmlFor="guardian2-photo-upload"
                      className="mt-3 px-3 py-1.5 text-sm bg-cta text-primary rounded-lg cursor-pointer hover:bg-cta-midtone transition flex items-center gap-2"
                    >
                      <Upload className="w-3 h-3" />
                      {guardian2PhotoPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="px-8 py-6 bg-primary-plus/10 dark:bg-secondary/50 rounded-b-xl flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 border border-primary-plus dark:border-secondary text-secondary dark:text-primary-plus rounded-lg hover:bg-primary-plus/20 dark:hover:bg-secondary/70 transition font-medium"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-6 py-2.5 bg-cta text-primary rounded-lg hover:bg-cta-midtone transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Update Student
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-secondary-minus dark:text-primary-plus">
          <p>Search for a student using their Registration ID, LIN, or Payment Code</p>
          <p className="mt-2">All changes will be saved to both student and guardian records</p>
        </div>
      </div>
    </div>
  );
}