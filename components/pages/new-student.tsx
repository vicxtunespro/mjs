'use client'
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserPlus, MapPin, Users, Book, Camera, X, Upload, FileWarning, OctagonX, Verified, SplineIcon } from 'lucide-react';
import clsx from 'clsx';

// Type definitions (keep the same)
type Gender = 'Male' | 'Female' | 'Other';
type Section = 'Day Care' | 'Pre-Primary' | 'Primary';
type Relationship = 'Mother' | 'Father' | 'Guardian' | 'Sibling' | 'Relative' | 'Other';
type VerifyState = "idle" | "loading" | "success" | "error";




interface GuardianData {
  full_name: string;
  contact: string;
  nin: string;
  email?: string;
  relationship: Relationship | '';
  guardian_id?: string;
  photo?: string;
}

interface continuingGuardianData {
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
  guardian1?: GuardianData | continuingGuardianData;
  guardian2?: GuardianData | continuingGuardianData;
  photo?: string;
}

// Constants (keep the same)
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

const HOUSE_OPTIONS = ['Red House', 'Blue House', 'Green House', 'Yellow House'];
const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hindu', 'Other'];
const RELATIONSHIP_OPTIONS: Relationship[] = ['Mother', 'Father', 'Guardian', 'Sibling', 'Relative', 'Other'];

const CLOUDINARY_UPLOAD_PRESET = 'mjs-admission-photos';
const CLOUDINARY_CLOUD_NAME = 'dzidperyt';

export default function StudentRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus1, setSubmitStatus1] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitStatus2, setSubmitStatus2] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Photo states - store files and previews only, not uploaded URLs
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string>('');

  const [guardian1PhotoFile, setGuardian1PhotoFile] = useState<File | null>(null);
  const [guardian1PhotoPreview, setGuardian1PhotoPreview] = useState<string>('');

  const [guardian2PhotoFile, setGuardian2PhotoFile] = useState<File | null>(null);
  const [guardian2PhotoPreview, setGuardian2PhotoPreview] = useState<string>('');

  const [continuingGuardian1PhotoFile, setContinuingGuardian1PhotoFile] = useState<File | null>(null);
  const [contuinuingGuardian1PhotoPreview, setContinuingGuardian1PhotoPreview] = useState<string>('');

  const [contuinuingGuardian2PhotoFile, setContinuingGuardian2PhotoFile] = useState<File | null>(null);
  const [contuinuingGuardian2PhotoPreview, setContinuingGuardian2PhotoPreview] = useState<string>('');

  const [contuinuingGuardian1PhotoLink, setContinuingGuardian1PhotoLink] = useState<string>('');
  const [contuinuingGuardian2PhotoLink, setContinuingGuardian2PhotoLink] = useState<string>(''); 

  // check for data uploads
  const [guardian1_not_saved, setGuardian1_not_saved] = useState<boolean>(true);
  const [guardian2_not_saved, setguardian2_not_saved] = useState<boolean>(true);
  const [isContinuingGuardian1, setIsContinuingGuardian1] = useState<boolean>(false);
  const [isContinuingGuardian2, setIsContinuingGuardian2] = useState<boolean>(false);
  const [verifyState1, setVerifyState1] = useState<VerifyState>("idle");
  const [verifyState2, setVerifyState2] = useState<VerifyState>("idle");

  //Temperary storage for contuinuing guardian ID
  const [continuingGuardian1ID, setContinuingGuardian1ID] = useState<string>('')
  const [continuingGuardian2ID, setContinuingGuardian2ID] = useState<string>('')


  const [studentData, setStudentData] = useState<StudentData>({
    name: {
      first_name: '',
      last_name: '',
      other_names: '',
    },
    class: {
      name: '',
      stream: '',
    },
    gender: '',
    date_of_birth: '',
    religion: '',
    section: '',
    house: '',
    club: '',
    residence: {
      region: '',
      district: '',
      village: '',
    },
    guardian1: {
      full_name: '',
      contact: '',
      nin: '',
      email: '',
      relationship: '',
    },
    guardian2: {
      full_name: '',
      contact: '',
      nin: '',
      email: '',
      relationship: '',
    },
    photo: '',
  });

  const [showGuardian2, setShowGuardian2] = useState(false);

  // Reset class and stream when section changes
  useEffect(() => {
    if (studentData.section) {
      setStudentData(prev => ({
        ...prev,
        class: { name: '', stream: '' }
      }));
    }
  }, [studentData.section]);

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

  // Cloudinary upload function - only called during final submission
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle photo changes - only store preview, not upload
  const handleStudentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardian1PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuardian1PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuardian1PhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardian2PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuardian1PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuardian1PhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinuingGuardian1PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContinuingGuardian1PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setContinuingGuardian1PhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinuingGuardian2PhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContinuingGuardian2PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setContinuingGuardian2PhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!studentData.name.first_name.trim()) {
      setErrorMessage('First name is required');
      return false;
    }
    if (!studentData.name.last_name.trim()) {
      setErrorMessage('Last name is required');
      return false;
    }
    if (!studentData.section) {
      setErrorMessage('Section is required');
      return false;
    }
    if (!studentData.class.name) {
      setErrorMessage('Class is required');
      return false;
    }
    if (!studentData.gender) {
      setErrorMessage('Gender is required');
      return false;
    }
    if (!studentData.date_of_birth) {
      setErrorMessage('Date of birth is required');
      return false;
    }

    // Guardian 1 validation
    if (!isContinuingGuardian1) {
      if (!studentData.guardian1?.full_name.trim()) {
        setErrorMessage('Primary guardian full name is required');
        return false;
      }
      if (!studentData.guardian1?.contact.trim()) {
        setErrorMessage('Primary guardian contact is required');
        return false;
      }
      if (!studentData.guardian1?.nin.trim()) {
        setErrorMessage('Primary guardian NIN is required');
        return false;
      }
      if (!studentData.guardian1?.relationship) {
        setErrorMessage('Primary guardian relationship is required');
        return false;
      }
    }

    // Guardian 2 validation (if visible)
    if (showGuardian2 && !isContinuingGuardian2) {
      if (!studentData.guardian2?.full_name.trim()) {
        setErrorMessage('Secondary guardian full name is required');
        return false;
      }
      if (!studentData.guardian2?.contact.trim()) {
        setErrorMessage('Secondary guardian contact is required');
        return false;
      }
      if (!studentData.guardian2?.nin.trim()) {
        setErrorMessage('Secondary guardian NIN is required');
        return false;
      }
      if (!studentData.guardian2?.relationship) {
        setErrorMessage('Secondary guardian relationship is required');
        return false;
      }
    }

    return true;
  };

  // Generate Registration ID
  const generateRegistrationID = (): string => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `MJS-${yy}${mm}${dd}-${hh}${min}${ss}-${suffix}`;
  };

  // Generate Guardian ID
  const generateGuardianID = (): string => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `G${yy}${mm}${dd}${hh}${min}${ss}${suffix}`;
  };

  // Get continuing parent infomation
  const getContinuingGuardian1Info = async (guardianID: string) => {
    setVerifyState1("loading");

    try {
      const response = await fetch(
        `https://mjs-backend-server.onrender.com/guardians/view/${guardianID}`
      );

      if (!response.ok) {
        setVerifyState1("error");
        return;
      }

      const result = await response.json();
      const guardian = result.data;

      setStudentData(prev => ({
        ...prev,
        guardian1: {
          ...prev.guardian1,
          full_name: guardian.full_name ?? "",
          contact: guardian.contact ?? "",
          nin: guardian.nin ?? "",
          email: guardian.email ?? "Not Provided",
          relationship: guardian.relationship ?? "",
        },
      }));

      setContinuingGuardian1PhotoPreview(guardian?.photo)
      setContinuingGuardian1PhotoLink(guardian?.photo)

      setVerifyState1("success");
    } catch (error) {
      console.error(error);
      setVerifyState1("error");
    }
  };

  // Get continuing parent 2 infomation
  // TODO: Copy Guardian 1 funtionality to Guardian2
  const getContinuingGuardian2Info = async (guardianID: string) => {
    setVerifyState2("loading");

    try {
      const response = await fetch(
        `https://mjs-backend-server.onrender.com/guardians/view/${guardianID}`
      );

      if (!response.ok) {
        setVerifyState2("error");
        return;
      }

      const result = await response.json();
      const guardian = result.data;

      setStudentData(prev => ({
        ...prev,
        guardian2: {
          ...prev.guardian2,
          full_name: guardian.full_name ?? "",
          contact: guardian.contact ?? "",
          nin: guardian.nin ?? "",
          email: guardian.email ?? "Not Provided",
          relationship: guardian.relationship ?? "",
        },
      }));

      setContinuingGuardian2PhotoPreview(guardian?.photo)
      setContinuingGuardian2PhotoLink(guardian?.photo)

      setVerifyState2("success");
    } catch (error) {
      console.error(error);
      setVerifyState2("error");
    }
  };

  
  

  // Update guardian photo if was in existance before
  const patchGuardianPhoto = async (guardianId: string, photoUrl: string) => {
    try {
      const response = await fetch(
        `https://mjs-backend-server.onrender.com/guardians/update/${guardianId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: photoUrl }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update guardian photo");
      }
  
      return response.json();
    } catch (error) {
      throw new Error("Something went wrong!")
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setErrorMessage('');
    setSubmitStatus1('idle');

    // Step 1: Validate form before doing anything
    if (!validateForm()) {
      setSubmitStatus1('error');
      return;
    }

    setIsLoading(true);

    try {
      // Step 2: Upload photos only if they exist
      let studentPhotoUrl = '';
      let guardian1PhotoUrl = '';
      let guardian2PhotoUrl = '';

      if (studentPhotoFile) {
        studentPhotoUrl = await uploadToCloudinary(studentPhotoFile);
      }

      if (guardian1PhotoFile) {
        guardian1PhotoUrl = await uploadToCloudinary(guardian1PhotoFile);
      } else if (continuingGuardian1PhotoFile && isContinuingGuardian1) {
        guardian1PhotoUrl = await uploadToCloudinary(continuingGuardian1PhotoFile);
        console.log(`Continuing Guardian One Photo Uploaded`)
      }

      if (guardian2PhotoFile && showGuardian2) {
        guardian2PhotoUrl = await uploadToCloudinary(guardian2PhotoFile);
      }



      // Step 3: Create Guardian 1
      let guardian1_id = undefined;
      if (!isContinuingGuardian1) {
        if (guardian1_not_saved) {

          guardian1_id = generateGuardianID();
          const guardian1Payload = {
            guardian_id: guardian1_id,
            full_name: studentData.guardian1!.full_name.trim(),
            contact: studentData.guardian1!.contact.trim(),
            nin: studentData.guardian1!.nin.trim(),
            ...(studentData.guardian1!.email?.trim() && { email: studentData.guardian1!.email.trim() }),
            ...(guardian1PhotoUrl && { photo: guardian1PhotoUrl }),
          };

          const guardian1Response = await fetch("https://mjs-backend-server.onrender.com/guardians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(guardian1Payload),
          });

          if (!guardian1Response.ok) {
            const errorData = await guardian1Response.json();
            throw new Error(errorData.message || 'Failed to register primary guardian');

          }

          setGuardian1_not_saved(false);
        }
      } else {
        if (guardian1PhotoUrl) {
            patchGuardianPhoto(continuingGuardian1ID ,guardian1PhotoUrl)
        }
      }

      // Step 4: Create Guardian 2 (if provided)
      let guardian2_id = undefined;

      if(!isContinuingGuardian2){if (guardian2_not_saved) {
        if (showGuardian2 && studentData.guardian2?.full_name.trim()) {
          guardian2_id = generateGuardianID();
          const guardian2Payload = {
            guardian_id: guardian2_id,
            full_name: studentData.guardian2.full_name.trim(),
            contact: studentData.guardian2.contact.trim(),
            nin: studentData.guardian2.nin.trim(),
            ...(studentData.guardian2.email?.trim() && { email: studentData.guardian2.email.trim() }),
            ...(guardian2PhotoUrl && { photo: guardian2PhotoUrl }),
          };


          const guardian2Response = await fetch("https://mjs-backend-server.onrender.com/guardians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(guardian2Payload),
          });

          if (!guardian2Response.ok) {
            const errorData = await guardian2Response.json();
            throw new Error(errorData.message || 'Failed to register secondary guardian');
          }

          setguardian2_not_saved(false);
        }
      }}else{
        if (guardian2PhotoUrl) {
            patchGuardianPhoto(continuingGuardian2ID ,guardian2PhotoUrl)
        }
      }

      // Step 5: Create Student
      const studentPayload: any = {
        registration_id: generateRegistrationID(),
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
        guardian1: {
          guardian_id: guardian1_id || continuingGuardian1ID,
          relationship: studentData.guardian1?.relationship
        },
        guardian2: {
          guardian_id: guardian2_id,
          relationship: studentData.guardian2?.relationship
        },
        ...(studentData?.religion && {religion: studentData.religion}),
        house: studentData?.house ?? null,
        ...(studentData?.club && {club: studentData?.club.trim()}),
        photo: studentPhotoUrl ?? null,
        ...(studentData?.LIN && {LIN: studentData?.LIN.trim()}),
        ...(studentData?.payment_code && {payment_code: studentData?.payment_code.trim()}),
      };

      // Add residence if any field is filled
      if (studentData.residence.region || studentData.residence.district || studentData.residence.village) {
        studentPayload.residence = {};
        if (studentData.residence.region?.trim()) studentPayload.residence.region = studentData.residence.region.trim();
        if (studentData.residence.district?.trim()) studentPayload.residence.district = studentData.residence.district.trim();
        if (studentData.residence.village?.trim()) studentPayload.residence.village = studentData.residence.village.trim();
      }

      const studentResponse = await fetch("https://mjs-backend-server.onrender.com/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload),
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        throw new Error(errorData.message || 'Failed to register student');
      }

      const studentResponseData = await studentResponse.json();
      console.log("✅ Student successfully registered:", studentResponseData);

      setSubmitStatus1('success');

      setTimeout(() => {
        handleReset();
      }, 3000);

    } catch (error) {
      console.error("❌ Error registering student:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while submitting');
      setSubmitStatus1('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStudentData({
      name: {
        first_name: '',
        last_name: '',
        other_names: '',
      },
      class: {
        name: '',
        stream: '',
      },
      gender: '',
      date_of_birth: '',
      religion: '',
      section: '',
      house: '',
      club: '',
      residence: {
        region: '',
        district: '',
        village: '',
      },
      guardian1: {
        full_name: '',
        contact: '',
        nin: '',
        email: '',
        relationship: '',
      },
      guardian2: {
        full_name: '',
        contact: '',
        nin: '',
        email: '',
        relationship: '',
      },
      photo: '',
    });
    setStudentPhotoFile(null);
    setStudentPhotoPreview('');
    setGuardian1PhotoFile(null);
    setGuardian1PhotoPreview('');
    setGuardian2PhotoFile(null);
    setGuardian2PhotoPreview('');
    setShowGuardian2(false);
    setSubmitStatus1('idle');
    setErrorMessage('');
    setContinuingGuardian1ID('');
    setContinuingGuardian2ID('');
    setIsContinuingGuardian1(false);
    setContinuingGuardian1PhotoPreview('')
    setVerifyState1('idle');
    setVerifyState2('idle');
  };

  const currentClassOptions = studentData.section ? CLASS_OPTIONS_MAP[studentData.section] : [];
  const currentStreamOptions = studentData.section ? STREAM_OPTIONS_MAP[studentData.section] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success/Error Alerts */}
        {submitStatus1 === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-800 dark:text-green-300 font-medium">Student and guardians registered successfully!</p>
              <p className="text-green-700 dark:text-green-400 text-sm">Form will reset in a moment...</p>
            </div>
          </div>
        )}

        {submitStatus1 === 'error' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">Failed to register</p>
              <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

          {/* Personal Information Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-red-700 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name.first_name"
                    value={studentData.name.first_name}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name.last_name"
                    value={studentData.name.last_name}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Other Names
                  </label>
                  <input
                    type="text"
                    name="name.other_names"
                    value={studentData.name.other_names}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={studentData.gender}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={studentData.date_of_birth}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Religion
                  </label>
                  <select
                    name="religion"
                    value={studentData.religion}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Religion --</option>
                    {RELIGION_OPTIONS.map(religion => (
                      <option key={religion} value={religion}>{religion}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
                  {studentPhotoPreview ? (
                    <>
                      <img src={studentPhotoPreview} alt="Student" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setStudentPhotoFile(null);
                          setStudentPhotoPreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student Photo</p>
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
                  className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-800 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo (Optional)
                </label>
              </div>
            </div>

            {/* Optional IDs Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Optional: Can be added later during updates</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LIN (Learner Identification Number)
                  </label>
                  <input
                    type="text"
                    name="LIN"
                    value={studentData.LIN || ''}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional - Can add later"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Code
                  </label>
                  <input
                    type="text"
                    name="payment_code"
                    value={studentData.payment_code || ''}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional - Can add later"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Book className="w-5 h-5 text-red-700 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="section"
                  value={studentData.section}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select Section --</option>
                  <option value="Day Care">Day Care</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class.name"
                  value={studentData.class.name}
                  onChange={handleSelectChange}
                  disabled={!studentData.section}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select Class --</option>
                  {currentClassOptions.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream
                </label>
                <select
                  name="class.stream"
                  value={studentData.class.stream}
                  onChange={handleSelectChange}
                  disabled={!studentData.section || currentStreamOptions.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select Stream --</option>
                  {currentStreamOptions.map(stream => (
                    <option key={stream} value={stream}>{stream}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  House
                </label>
                <select
                  name="house"
                  value={studentData.house}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select House --</option>
                  {HOUSE_OPTIONS.map(house => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Club
              </label>
              <input
                type="text"
                name="club"
                value={studentData.club}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter club name"
              />
            </div>
          </div>

          {/* Residence Information */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-red-700 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Residence Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  name="residence.region"
                  value={studentData.residence.region}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="residence.district"
                  value={studentData.residence.district}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Kampala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  name="residence.village"
                  value={studentData.residence.village}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Nakawa"
                />
              </div>
            </div>
          </div>

          {/* Guardian 1 Information */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-red-700 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Primary Guardian Information</h2>
            </div>

            {!guardian1_not_saved ? (
              <div className="w-full bg-red-100 border-red-500 border-1 text-slate-950 font-light text-sm rounded-md p-6 flex gap-4 items-center">
                <FileWarning className='size-12 md:size-6 text-red-800' />
                <p>Guadian data has been collected if your seeing this it means you have unfill fields which are are required on students data</p>
              </div>
            ) : (
              <div>
                {/* Tabs */}
                <div className='flex gap-4 mb-8'>
                  <span
                    onClick={() => setIsContinuingGuardian1(false)}
                    className={clsx('cursor-pointer border-1 border-slate-700 py-1 px-2 text-sm rounded-md', !isContinuingGuardian1 && 'bg-slate-700 dark:bg-red-700 text-slate-50 border-none')}>New Guardian</span>
                  <span
                    onClick={() => setIsContinuingGuardian1(true)}
                    className={clsx('cursor-pointer border-1 border-slate-500  py-1 px-2 text-sm rounded-md', isContinuingGuardian1 && 'bg-slate-700 dark:bg-red-700 text-slate-50 border-none')}>Continuing Parent</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Check If Guardian is continuing or new  */}
                  {!isContinuingGuardian1 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian1.full_name"
                          value={studentData.guardian1?.full_name}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="guardian1.contact"
                          value={studentData.guardian1?.contact}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="+256700000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          NIN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian1.nin"
                          value={studentData.guardian1?.nin}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="CM00000000000AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="guardian1.email"
                          value={studentData.guardian1?.email}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="jane@example.com (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="guardian1.relationship"
                          value={studentData.guardian1?.relationship}
                          onChange={handleSelectChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select Relationship --</option>
                          {RELATIONSHIP_OPTIONS.map(rel => (
                            <option key={rel} value={rel}>{rel}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className='text-sm mb-4'>* For continuing parents please provide the GuardianID</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Guardian ID: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={continuingGuardian1ID}
                          onChange={(e) => {setContinuingGuardian1ID(e.target.value), setVerifyState1('idle')}}
                          className="w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Gxxxx--xxxx-xxxx-xxx"
                        />
                      </div>
                      <button
                        disabled={verifyState1 === "loading"}
                        onClick={() => getContinuingGuardian1Info(continuingGuardian1ID)}
                        className={`
                          py-2 px-4 rounded-md my-4 text-sm text-white flex items-center justify-center gap-2
                          transition-all duration-200
                          ${verifyState1 === "idle" && "bg-green-800 hover:bg-green-800"
                          }
                          ${verifyState1 === "loading" && "bg-green-400 cursor-not-allowed"
                          }
                          ${verifyState1 === "success" && "bg-green-600"
                          }
                          ${verifyState1 === "error" && "bg-red-600"
                          }
                        `}
                      >
                        {verifyState1 === "loading" && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {verifyState1 === "success" && <Verified />}
                        {verifyState1 === "error" && <OctagonX />}

                        <span>
                          {verifyState1 === "idle" && "Verify Guardian Data"}
                          {verifyState1 === "loading" && "Verifying..."}
                          {verifyState1 === "success" && "Verified"}
                          {verifyState1 === "error" && "Invalid Guardian"}
                        </span>
                      </button>

                      {/* if verfied show data */}
                      {verifyState1 === "success" && (<div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="guardian1.full_name"
                            value={studentData.guardian1?.full_name}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contact <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="guardian1.contact"
                            value={studentData.guardian1?.contact}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="+256700000000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            NIN <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="guardian1.nin"
                            value={studentData.guardian1?.nin}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="CM00000000000AA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="guardian1.email"
                            value={studentData.guardian1?.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="jane@example.com (Optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Relationship (Change this field if needed) <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="guardian1.relationship"
                            value={studentData.guardian1?.relationship}
                            onChange={handleSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">-- Select Relationship --</option>
                            {RELATIONSHIP_OPTIONS.map(rel => (
                              <option key={rel} value={rel}>{rel}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      )}
                    </div>
                  )}


                  {/* Guardian 1 Photo Upload OR Show collected guardian photo */}
                  {!isContinuingGuardian1 ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 overflow-hidden relative">
                        {guardian1PhotoPreview ? (
                          <>
                            <img src={guardian1PhotoPreview} alt="Guardian 1" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setGuardian1PhotoFile(null);
                                setGuardian1PhotoPreview('');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Guardian Photo</p>
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
                        className="mt-3 px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-800 transition flex items-center gap-2"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Photo
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Optional</p>
                    </div>
                  ) : (
                    <div className={clsx(
                      "flex flex-col items-center justify-center",
                      verifyState1 !== "success" && "hidden"
                    )}>
                      <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 overflow-hidden relative">
                        {contuinuingGuardian1PhotoPreview ? (
                          <>
                            <img src={contuinuingGuardian1PhotoPreview || 'https://res.cloudinary.com/dzidperyt/image/upload/v1767464743/397057724_11539820_lrfqg3.png'} alt="Conttinuing Guardian 1" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setContinuingGuardian1PhotoFile(null);
                                setContinuingGuardian1PhotoPreview('');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <img src={contuinuingGuardian1PhotoLink || 'https://res.cloudinary.com/dzidperyt/image/upload/v1767464743/397057724_11539820_lrfqg3.png'} alt="Conttinuing Guardian 1" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      {!contuinuingGuardian1PhotoLink ? (
                        <div className='flex flex-col justify-center items-center'>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleContinuingGuardian1PhotoChange}
                            className="hidden"
                            id="guardian1-photo-upload"
                          />
                          <label
                            htmlFor="guardian1-photo-upload"
                            className="w-48 mt-3 px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-800 transition flex items-center gap-2"
                          >
                            <Camera className="w-3 h-3" />
                            Upload New Photo
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This action updates the Guardian's photo in the entire system</p>
                        </div>
                      ) : (
                        <div className='flex flex-col justify-center items-center'>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleContinuingGuardian1PhotoChange}
                            className="hidden"
                            id="guardian1-photo-upload"
                            disabled
                          />
                          <label
                            htmlFor="guardian1-photo-upload"
                            className="w-48 mt-3 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg cursor-pointer  flex items-center gap-2 justify-center"
                          >
                            <Verified className="w-3 h-3" />
                            Verified Guardian
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This photo can only be changed on student or guardian update</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Guardian 2 Button */}
          {!showGuardian2 && guardian2_not_saved && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowGuardian2(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-700 dark:hover:text-red-400 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Secondary Guardian (Optional)
              </button>
            </div>
          )}

          {/* Guardian 2 Information */}
          {showGuardian2 && guardian2_not_saved && (
            <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-700 dark:text-red-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Secondary Guardian Information</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGuardian2(false);
                    setIsContinuingGuardian2(false)
                    setStudentData(prev => ({
                      ...prev,
                      guardian2: {
                        full_name: '',
                        contact: '',
                        nin: '',
                        email: '',
                        relationship: '',
                      }
                    }));
                    setGuardian2PhotoFile(null);
                    setGuardian2PhotoPreview('');
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guardian 2 Logic */}
              <div>
                {/* Tabs */}
                <div className='flex gap-4 mb-8'>
                  <span
                    onClick={() => setIsContinuingGuardian2(false)}
                    className={clsx('cursor-pointer border-1 border-slate-700 py-1 px-2 text-sm rounded-md', !isContinuingGuardian2 && 'bg-slate-700 dark:bg-red-700 text-slate-50 border-none')}>New Guardian</span>
                  <span
                    onClick={() => setIsContinuingGuardian2(true)}
                    className={clsx('cursor-pointer border-1 border-slate-500  py-1 px-2 text-sm rounded-md', isContinuingGuardian2 && 'bg-slate-700 dark:bg-red-700 text-slate-50 border-none')}>Continuing Parent</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Check If Guardian is continuing or new  */}
                  {!isContinuingGuardian2 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian2.full_name"
                          value={studentData.guardian2?.full_name}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="guardian2.contact"
                          value={studentData.guardian2?.contact}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="+256700000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          NIN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian2.nin"
                          value={studentData.guardian2?.nin}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="CM00000000000AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="guardian2.email"
                          value={studentData.guardian2?.email}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="jane@example.com (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="guardian2.relationship"
                          value={studentData.guardian2?.relationship}
                          onChange={handleSelectChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select Relationship --</option>
                          {RELATIONSHIP_OPTIONS.map(rel => (
                            <option key={rel} value={rel}>{rel}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className='text-sm mb-4'>* For continuing parents please provide the GuardianID</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Guardian ID: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={continuingGuardian2ID}
                          onChange={(e) => {setContinuingGuardian2ID(e.target.value), setVerifyState2('idle')}}
                          className="w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Gxxxx--xxxx-xxxx-xxx"
                        />
                      </div>
                      <button
                        disabled={verifyState2 === "loading"}
                        onClick={() => getContinuingGuardian2Info(continuingGuardian2ID)}
                        className={`
                          py-2 px-4 rounded-md my-4 text-sm text-white flex items-center justify-center gap-2
                          transition-all duration-200
                          ${verifyState2 === "idle" && "bg-green-800 hover:bg-green-800"
                          }
                          ${verifyState2 === "loading" && "bg-green-400 cursor-not-allowed"
                          }
                          ${verifyState2 === "success" && "bg-green-600"
                          }
                          ${verifyState2 === "error" && "bg-red-600"
                          }
                        `}
                      >
                        {verifyState2 === "loading" && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {verifyState2 === "success" && <Verified />}
                        {verifyState2 === "error" && <OctagonX />}

                        <span>
                          {verifyState2 === "idle" && "Verify Guardian Data"}
                          {verifyState2 === "loading" && "Verifying..."}
                          {verifyState2 === "success" && "Verified"}
                          {verifyState2 === "error" && "Invalid Guardian"}
                        </span>
                      </button>

                      {/* if verfied show data */}
                      {verifyState2 === "success" && (<div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="guardian2.full_name"
                            value={studentData.guardian2?.full_name}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contact <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="guardian2.contact"
                            value={studentData.guardian2?.contact}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="+256700000000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            NIN <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="guardian2.nin"
                            value={studentData.guardian2?.nin}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="CM00000000000AA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="guardian2.email"
                            value={studentData.guardian2?.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="jane@example.com (Optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Relationship (Change this field if needed) <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="guardian2.relationship"
                            value={studentData.guardian2?.relationship}
                            onChange={handleSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">-- Select Relationship --</option>
                            {RELATIONSHIP_OPTIONS.map(rel => (
                              <option key={rel} value={rel}>{rel}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      )}
                    </div>
                  )}


                  {/* Guardian 2 Photo Upload OR Show collected guardian photo */}
                  {!isContinuingGuardian2 ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 overflow-hidden relative">
                        {guardian2PhotoPreview ? (
                          <>
                            <img src={guardian2PhotoPreview} alt="Guardian 2" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setGuardian2PhotoFile(null);
                                setGuardian2PhotoPreview('');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Guardian Photo</p>
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
                        className="mt-3 px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-800 transition flex items-center gap-2"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Photo
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Optional</p>
                    </div>
                  ) : (
                    <div className={clsx(
                      "flex flex-col items-center justify-center",
                      verifyState2 !== "success" && "hidden"
                    )}>
                      <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 overflow-hidden relative">
                        {contuinuingGuardian2PhotoPreview ? (
                          <>
                            <img src={contuinuingGuardian2PhotoPreview || 'https://res.cloudinary.com/dzidperyt/image/upload/v1767464743/397057724_11539820_lrfqg3.png'} alt="Conttinuing Guardian 1" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setContinuingGuardian2PhotoFile(null);
                                setContinuingGuardian2PhotoPreview('');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <img src={contuinuingGuardian2PhotoLink || 'https://res.cloudinary.com/dzidperyt/image/upload/v1767464743/397057724_11539820_lrfqg3.png'} alt="Conttinuing Guardian 1" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      {!contuinuingGuardian2PhotoLink ? (
                        <div className='flex flex-col justify-center items-center'>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleContinuingGuardian2PhotoChange}
                            className="hidden"
                            id="guardian2-photo-upload"
                          />
                          <label
                            htmlFor="guardian2-photo-upload"
                            className="w-48 mt-3 px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-800 transition flex items-center gap-2"
                          >
                            <Camera className="w-3 h-3" />
                            Upload New Photo
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This action updates the Guardian's photo in the entire system {studentData.guardian2?.contact}</p>
                        </div>
                      ) : (
                        <div className='flex flex-col justify-center items-center'>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleContinuingGuardian2PhotoChange}
                            className="hidden"
                            id="guardian2-photo-upload"
                            disabled
                          />
                          <label
                            htmlFor="guardian2-photo-upload"
                            className="w-48 mt-3 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg cursor-pointer  flex items-center gap-2 justify-center"
                          >
                            <Verified className="w-3 h-3" />
                            Verified Guardian
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This photo can only be changed on student or guardian update</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Register Student
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>All fields marked with <span className="text-red-500">*</span> are required</p>
          <p className="mt-2">Registration ID and Guardian IDs will be auto-generated</p>
        </div>
      </div>
    </div>
  );
}