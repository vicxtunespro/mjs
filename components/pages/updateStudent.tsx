'use client'
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserPlus, MapPin, Users, Book, Camera, X, Upload, FileWarning, OctagonX, Verified, Edit } from 'lucide-react';
import clsx from 'clsx';
import { getDistrictByRegion, Region } from '@/types/residence.type';
import { toast } from 'react-toastify'
import { useRouter, useParams } from 'next/navigation';
import { getStudent } from '@/src/modules/students/students.services';

// Type definitions
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

// Constants
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

const HOUSE_OPTIONS = ['Day', 'Boarding'];
const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hindu', 'Other'];
const RELATIONSHIP_OPTIONS: Relationship[] = ['Mother', 'Father', 'Guardian', 'Sibling', 'Relative', 'Other'];

const CLOUDINARY_UPLOAD_PRESET = 'mjs-admission-photos';
const CLOUDINARY_CLOUD_NAME = 'dzidperyt';

export default function StudentUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [region, setRegion] = useState<Region>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Existing data states
  const [existingStudentData, setExistingStudentData] = useState<StudentData | null>(null);
  const [existingGuardian1Data, setExistingGuardian1Data] = useState<GuardianData | null>(null);
  const [existingGuardian2Data, setExistingGuardian2Data] = useState<GuardianData | null>(null);

  // Photo states
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string>('');

  const [guardian1PhotoFile, setGuardian1PhotoFile] = useState<File | null>(null);
  const [guardian1PhotoPreview, setGuardian1PhotoPreview] = useState<string>('');

  const [guardian2PhotoFile, setGuardian2PhotoFile] = useState<File | null>(null);
  const [guardian2PhotoPreview, setGuardian2PhotoPreview] = useState<string>('');

  const [continuingGuardian1PhotoFile, setContinuingGuardian1PhotoFile] = useState<File | null>(null);
  const [contuinuingGuardian1PhotoPreview, setContinuingGuardian1PhotoPreview] = useState<string>('');

  const [continuingGuardian2PhotoFile, setContinuingGuardian2PhotoFile] = useState<File | null>(null);
  const [contuinuingGuardian2PhotoPreview, setContinuingGuardian2PhotoPreview] = useState<string>('');

  const [contuinuingGuardian1PhotoLink, setContinuingGuardian1PhotoLink] = useState<string>('');
  const [contuinuingGuardian2PhotoLink, setContinuingGuardian2PhotoLink] = useState<string>('');

  // Guardian states
  const [guardian1_not_saved, setGuardian1_not_saved] = useState<boolean>(true);
  const [guardian2_not_saved, setGuardian2_not_saved] = useState<boolean>(true);
  const [isContinuingGuardian1, setIsContinuingGuardian1] = useState<boolean>(false);
  const [isContinuingGuardian2, setIsContinuingGuardian2] = useState<boolean>(false);
  const [verifyState1, setVerifyState1] = useState<VerifyState>("idle");
  const [verifyState2, setVerifyState2] = useState<VerifyState>("idle");

  // Guardian IDs
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

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        toast.error('No student ID provided');
        router.push('/admin/students');
        return;
      }

      setIsLoadingData(true);
      try {
        
        const student = await getStudent(studentId);
        
        setExistingStudentData(student);
        
        // Populate form with existing data
        setStudentData({
          registration_id: student.registration_id,
          LIN: student.LIN || '',
          payment_code: student.payment_code || '',
          name: {
            first_name: student?.name?.first_name || '',
            last_name: student?.name?.last_name || '',
            other_names: student?.name?.other_names || '',
          },
          class: {
            name: student?.class?.name || '',
            stream: student?.class?.stream || '',
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
        });

        // Set existing photo preview
        if (student.photo) {
          setStudentPhotoPreview(student.photo);
        }

        // Set region and districts if residence exists
        if (student.residence?.region) {
          setRegion(student.residence.region as Region);
          getDistricts(student.residence.region as Region);
        }

        // Fetch guardian data if guardian IDs exist
        if (student.guardian1?.guardian_id) {
          await fetchGuardianData(student.guardian1.guardian_id, 'guardian1', student.guardian1.relationship);
        }
        
        if (student.guardian2?.guardian_id) {
          await fetchGuardianData(student.guardian2.guardian_id, 'guardian2', student.guardian2.relationship);
        }

      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student data');
        router.push('/admin/students');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchStudentData();
  }, [studentId, router]);

  // Fetch guardian data
  const fetchGuardianData = async (guardianId: string, guardianType: 'guardian1' | 'guardian2', relationship: string = '') => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guardians/view/${guardianId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        const guardian = result.data;
        
        if (guardianType === 'guardian1') {
          setExistingGuardian1Data(guardian);
          setContinuingGuardian1ID(guardianId);
          setIsContinuingGuardian1(true);
          setVerifyState1("success");
          
          // Set guardian 1 data
          setStudentData(prev => ({
            ...prev,
            guardian1: {
              full_name: guardian.full_name || '',
              contact: guardian.contact || '',
              nin: guardian.nin || '',
              email: guardian.email || '',
              relationship: relationship || guardian.relationship || '',
            }
          }));
          
          // Set photo previews
          if (guardian.photo) {
            setContinuingGuardian1PhotoLink(guardian.photo);
            setContinuingGuardian1PhotoPreview(guardian.photo);
          }
          
          setGuardian1_not_saved(false);
        } else {
          setExistingGuardian2Data(guardian);
          setContinuingGuardian2ID(guardianId);
          setIsContinuingGuardian2(true);
          setShowGuardian2(true);
          setVerifyState2("success");
          
          // Set guardian 2 data
          setStudentData(prev => ({
            ...prev,
            guardian2: {
              full_name: guardian.full_name || '',
              contact: guardian.contact || '',
              nin: guardian.nin || '',
              email: guardian.email || '',
              relationship: relationship || guardian.relationship || '',
            }
          }));
          
          // Set photo previews
          if (guardian.photo) {
            setContinuingGuardian2PhotoLink(guardian.photo);
            setContinuingGuardian2PhotoPreview(guardian.photo);
          }
          
          setGuardian2_not_saved(false);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${guardianType} data:`, error);
    }
  };

  // Reset class and stream when section changes
  useEffect(() => {
    if (studentData.section && existingStudentData?.section !== studentData.section) {
      setStudentData(prev => ({
        ...prev,
        class: { name: '', stream: '' }
      }));
    }
  }, [studentData.section, existingStudentData]);

  // Validate form in real-time
  useEffect(() => {
    const validateForm = () => {
      const errors: Record<string, string> = {};

      // Required student fields
      if (!studentData.name?.first_name?.trim()) {
        errors['name.first_name'] = 'First name is required';
      }
      if (!studentData.name?.last_name?.trim()) {
        errors['name.last_name'] = 'Last name is required';
      }
      if (!studentData.section) {
        errors['section'] = 'Section is required';
      }
      if (!studentData.class.name) {
        errors['class.name'] = 'Class is required';
      }
      if (!studentData.gender) {
        errors['gender'] = 'Gender is required';
      }
      if (!studentData.date_of_birth) {
        errors['date_of_birth'] = 'Date of birth is required';
      }

      // Guardian 1 validation
      if (!isContinuingGuardian1) {
        if (!studentData.guardian1?.full_name?.trim()) {
          errors['guardian1.full_name'] = 'Primary guardian full name is required';
        }
        if (!studentData.guardian1?.contact?.trim()) {
          errors['guardian1.contact'] = 'Primary guardian contact is required';
        }
        if (!studentData.guardian1?.nin?.trim()) {
          errors['guardian1.nin'] = 'Primary guardian NIN is required';
        }
        if (!studentData.guardian1?.relationship) {
          errors['guardian1.relationship'] = 'Primary guardian relationship is required';
        }
      }

      // Guardian 2 validation (if visible)
      if (showGuardian2 && !isContinuingGuardian2) {
        if (!studentData.guardian2?.full_name?.trim()) {
          errors['guardian2.full_name'] = 'Secondary guardian full name is required';
        }
        if (!studentData.guardian2?.contact?.trim()) {
          errors['guardian2.contact'] = 'Secondary guardian contact is required';
        }
        if (!studentData.guardian2?.nin?.trim()) {
          errors['guardian2.nin'] = 'Secondary guardian NIN is required';
        }
        if (!studentData.guardian2?.relationship) {
          errors['guardian2.relationship'] = 'Secondary guardian relationship is required';
        }
      }

      // Phone number validation
      const validateUgandaPhone = (phone: any): boolean => {
        if (!phone) return false;
        const phoneStr = String(phone).trim();
        const cleaned = phoneStr.replace(/\D/g, '');

        const patterns = [
          /^256[7|3|2]\d{8}$/,
          /^0[7|3|2]\d{8}$/,
          /^[7|3|2]\d{8}$/,
          /^\+256[7|3|2]\d{8}$/
        ];

        return patterns.some(pattern => pattern.test(cleaned));
      };

      if (studentData.guardian1?.contact && !validateUgandaPhone(studentData.guardian1?.contact)) {
        errors['guardian1.contact'] = 'Please enter a valid phone number';
      }
      if (studentData.guardian2?.contact && !validateUgandaPhone(studentData.guardian2?.contact)) {
        errors['guardian2.contact'] = 'Please enter a valid phone number';
      }

      // NIN validation
      if (studentData.guardian1?.nin && studentData.guardian1.nin.length < 10) {
        errors['guardian1.nin'] = 'NIN should be at least 10 characters';
      }
      if (studentData.guardian2?.nin && studentData.guardian2.nin.length < 10) {
        errors['guardian2.nin'] = 'NIN should be at least 10 characters';
      }

      setFieldErrors(errors);
      setIsFormValid(Object.keys(errors).length === 0);
    };

    validateForm();
  }, [studentData, isContinuingGuardian1, isContinuingGuardian2, showGuardian2]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name?.startsWith('guardian1.')) {
      const field = name?.replace('guardian1.', '');
      setStudentData(prev => ({
        ...prev,
        guardian1: { ...prev.guardian1!, [field]: value }
      }));
    } else if (name?.startsWith('guardian2.')) {
      const field = name?.replace('guardian2.', '');
      setStudentData(prev => ({
        ...prev,
        guardian2: { ...prev.guardian2!, [field]: value }
      }));
    } else if (name?.includes('.')) {
      const [parent, child] = name?.split('.');
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

    if (name?.startsWith('guardian1.')) {
      const field = name?.replace('guardian1.', '');
      setStudentData(prev => ({
        ...prev,
        guardian1: { ...prev.guardian1!, [field]: value }
      }));
    } else if (name?.startsWith('guardian2.')) {
      const field = name?.replace('guardian2.', '');
      setStudentData(prev => ({
        ...prev,
        guardian2: { ...prev.guardian2!, [field]: value }
      }));
    } else if (name?.includes('.')) {
      const [parent, child] = name?.split('.');
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

  // Cloudinary upload function
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

  // Handle photo changes
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
      setGuardian2PhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuardian2PhotoPreview(reader.result as string);
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

  // Handle Regions and Districts
  const getDistricts = (selectedRegion: Region) => {
    const availableDistricts = getDistrictByRegion(selectedRegion);
    setDistricts([...availableDistricts]);
  }

  const validateForm = (): boolean => {
    if (!isFormValid) {
      toast.error('Please fill all required fields correctly', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  // Generate Guardian ID (for new guardians)
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

  // Get continuing guardian information
  const getContinuingGuardian1Info = async (guardianID: string) => {
    setVerifyState1("loading");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guardians/view/${guardianID}`
      );

      if (!response.ok) {
        setVerifyState1("error");
        toast.error('Invalid guardian ID');
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
          email: guardian.email ?? "",
          relationship: guardian.relationship ?? "",
        },
      }));

      setContinuingGuardian1PhotoPreview(guardian?.photo)
      setContinuingGuardian1PhotoLink(guardian?.photo)

      setVerifyState1("success");
      toast.success('Guardian verified successfully');
    } catch (error) {
      console.error(error);
      setVerifyState1("error");
      toast.error('Failed to verify guardian');
    }
  };

  const getContinuingGuardian2Info = async (guardianID: string) => {
    setVerifyState2("loading");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guardians/view/${guardianID}`
      );

      if (!response.ok) {
        setVerifyState2("error");
        toast.error('Invalid guardian ID');
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
          email: guardian.email ?? "",
          relationship: guardian.relationship ?? "",
        },
      }));

      setContinuingGuardian2PhotoPreview(guardian?.photo)
      setContinuingGuardian2PhotoLink(guardian?.photo)

      setVerifyState2("success");
      toast.success('Guardian verified successfully');
    } catch (error) {
      console.error(error);
      setVerifyState2("error");
      toast.error('Failed to verify guardian');
    }
  };

  // Update guardian photo
  const patchGuardianPhoto = async (guardianId: string, photoUrl: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guardians/update/${guardianId}`,
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

  // Update guardian relationship
  const updateGuardianRelationship = async (guardianId: string, relationship: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guardians/update/${guardianId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relationship }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update guardian relationship");
      }

      return response.json();
    } catch (error) {
      throw new Error("Something went wrong!")
    }
  };

  // Create new guardian
  const createGuardian = async (guardianData: any): Promise<string> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guardians`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guardianData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create guardian');
    }

    const result = await response.json();
    return result.data.guardian_id;
  };

  // Handle form submission (UPDATE)
  const handleSubmit = async () => {
    setErrorMessage('');

    // Step 1: Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Updating student information...', {
      position: "top-right",
    });

    try {
      // Step 2: Upload new photos if changed
      let studentPhotoUrl = studentData.photo;
      let guardian1PhotoUrl = existingGuardian1Data?.photo;
      let guardian2PhotoUrl = existingGuardian2Data?.photo;

      if (studentPhotoFile) {
        toast.update(toastId, {
          render: 'Uploading student photo...',
          isLoading: true,
        });
        studentPhotoUrl = await uploadToCloudinary(studentPhotoFile);
      }

      if (guardian1PhotoFile) {
        toast.update(toastId, {
          render: 'Uploading primary guardian photo...',
          isLoading: true,
        });
        guardian1PhotoUrl = await uploadToCloudinary(guardian1PhotoFile);
      } else if (continuingGuardian1PhotoFile && isContinuingGuardian1) {
        toast.update(toastId, {
          render: 'Uploading continuing guardian photo...',
          isLoading: true,
        });
        guardian1PhotoUrl = await uploadToCloudinary(continuingGuardian1PhotoFile);
      }

      if (guardian2PhotoFile && showGuardian2) {
        toast.update(toastId, {
          render: 'Uploading secondary guardian photo...',
          isLoading: true,
        });
        guardian2PhotoUrl = await uploadToCloudinary(guardian2PhotoFile);
      } else if (continuingGuardian2PhotoFile && isContinuingGuardian2) {
        toast.update(toastId, {
          render: 'Uploading continuing guardian photo...',
          isLoading: true,
        });
        guardian2PhotoUrl = await uploadToCloudinary(continuingGuardian2PhotoFile);
      }

      // Step 3: Handle Guardian 1 updates
      let guardian1_id = continuingGuardian1ID;
      
      if (isContinuingGuardian1 && continuingGuardian1ID) {
        // Update existing guardian
        if (guardian1PhotoUrl && guardian1PhotoUrl !== existingGuardian1Data?.photo) {
          await patchGuardianPhoto(continuingGuardian1ID, guardian1PhotoUrl);
        }
        
        // Update relationship if changed
        const currentRelationship = existingGuardian1Data?.relationship;
        const newRelationship = studentData.guardian1?.relationship;
        
        if (newRelationship && newRelationship !== currentRelationship) {
          await updateGuardianRelationship(continuingGuardian1ID, newRelationship);
        }
      } else if (!isContinuingGuardian1 && guardian1_not_saved) {
        // Create new guardian
        toast.update(toastId, {
          render: 'Creating primary guardian...',
          isLoading: true,
        });
        
        guardian1_id = generateGuardianID();
        const guardian1Payload = {
          guardian_id: guardian1_id,
          full_name: studentData.guardian1!.full_name.trim(),
          contact: studentData.guardian1!.contact.trim(),
          nin: studentData.guardian1!.nin.trim(),
          ...(studentData.guardian1!.email?.trim() && { email: studentData.guardian1!.email.trim() }),
          ...(guardian1PhotoUrl && { photo: guardian1PhotoUrl }),
        };

        await createGuardian(guardian1Payload);
        setGuardian1_not_saved(false);
      }

      // Step 4: Handle Guardian 2 updates
      let guardian2_id = continuingGuardian2ID;

      if (showGuardian2) {
        if (isContinuingGuardian2 && continuingGuardian2ID) {
          // Update existing guardian
          if (guardian2PhotoUrl && guardian2PhotoUrl !== existingGuardian2Data?.photo) {
            await patchGuardianPhoto(continuingGuardian2ID, guardian2PhotoUrl);
          }
          
          // Update relationship if changed
          const currentRelationship = existingGuardian2Data?.relationship;
          const newRelationship = studentData.guardian2?.relationship;
          
          if (newRelationship && newRelationship !== currentRelationship) {
            await updateGuardianRelationship(continuingGuardian2ID, newRelationship);
          }
        } else if (!isContinuingGuardian2 && guardian2_not_saved && studentData.guardian2?.full_name.trim()) {
          // Create new guardian
          toast.update(toastId, {
            render: 'Creating secondary guardian...',
            isLoading: true,
          });
          
          guardian2_id = generateGuardianID();
          const guardian2Payload = {
            guardian_id: guardian2_id,
            full_name: studentData.guardian2.full_name.trim(),
            contact: studentData.guardian2.contact.trim(),
            nin: studentData.guardian2.nin.trim(),
            ...(studentData.guardian2.email?.trim() && { email: studentData.guardian2.email.trim() }),
            ...(guardian2PhotoUrl && { photo: guardian2PhotoUrl }),
          };

          await createGuardian(guardian2Payload);
          setGuardian2_not_saved(false);
        }
      }

      // Step 5: Update Student
      toast.update(toastId, {
        render: 'Updating student record...',
        isLoading: true,
      });

      const studentPayload: any = {
        name: {
          first_name: studentData.name?.first_name.trim(),
          last_name: studentData.name?.last_name.trim(),
          ...(studentData.name.other_names?.trim() && { other_names: studentData.name.other_names.trim() }),
        },
        class: {
          name: studentData.class.name,
          ...(studentData.class.stream && { stream: studentData.class.stream }),
        },
        gender: studentData.gender,
        date_of_birth: studentData.date_of_birth,
        section: studentData.section,
        ...(guardian1_id && {
          guardian1: {
            guardian_id: guardian1_id,
            relationship: studentData.guardian1?.relationship || ''
          }
        }),
        ...(guardian2_id && showGuardian2 && {
          guardian2: {
            guardian_id: guardian2_id,
            relationship: studentData.guardian2?.relationship || ''
          }
        }),
        ...(studentData?.religion && { religion: studentData.religion }),
        house: studentData?.house ?? null,
        ...(studentData?.club && { club: studentData?.club.trim() }),
        ...(studentPhotoUrl && { photo: studentPhotoUrl }),
        ...(studentData?.LIN && { LIN: studentData?.LIN.trim() }),
        ...(studentData?.payment_code && { payment_code: studentData?.payment_code.trim() }),
      };

      // Add residence if any field is filled
      if (studentData.residence.region || studentData.residence.district || studentData.residence.village) {
        studentPayload.residence = {};
        if (studentData.residence.region?.trim()) studentPayload.residence.region = studentData.residence.region.trim();
        if (studentData.residence.district?.trim()) studentPayload.residence.district = studentData.residence.district.trim();
        if (studentData.residence.village?.trim()) studentPayload.residence.village = studentData.residence.village.trim();
      }

      const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/update/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload),
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      // Success
      toast.update(toastId, {
        render: (
          <div>
            <div className="font-bold">✅ Update Successful!</div>
            <div className="text-sm">Student information has been updated</div>
          </div>
        ),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      setTimeout(() => {
        router.push('/admin/students');
      }, 2000);

    } catch (error) {
      console.error("❌ Error updating student:", error);

      // Error toast
      toast.update(toastId, {
        render: (
          <div>
            <div className="font-bold">❌ Update Failed</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'An error occurred while updating'}</div>
          </div>
        ),
        type: "error",
        isLoading: false,
        autoClose: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original data
    if (existingStudentData) {
      setStudentData({
        registration_id: existingStudentData.registration_id,
        LIN: existingStudentData.LIN || '',
        payment_code: existingStudentData.payment_code || '',
        name: {
          first_name: existingStudentData.name?.first_name,
          last_name: existingStudentData.name?.last_name,
          other_names: existingStudentData.name.other_names || '',
        },
        class: {
          name: existingStudentData.class.name,
          stream: existingStudentData.class.stream || '',
        },
        gender: existingStudentData.gender,
        date_of_birth: existingStudentData.date_of_birth,
        religion: existingStudentData.religion || '',
        section: existingStudentData.section,
        house: existingStudentData.house || '',
        club: existingStudentData.club || '',
        residence: {
          region: existingStudentData.residence?.region || '',
          district: existingStudentData.residence?.district || '',
          village: existingStudentData.residence?.village || '',
        },
        photo: existingStudentData.photo || '',
        guardian1: studentData.guardian1, // Keep current guardian data
        guardian2: studentData.guardian2, // Keep current guardian data
      });
    }

    // Reset photo files (keep previews)
    setStudentPhotoFile(null);
    setGuardian1PhotoFile(null);
    setGuardian2PhotoFile(null);
    setContinuingGuardian1PhotoFile(null);
    setContinuingGuardian2PhotoFile(null);
    
    setFieldErrors({});
    toast.info('Form reset to original values', { position: "top-right" });
  };

  const handleCancel = () => {
    router.push('/admin/students');
  };

  const currentClassOptions = studentData.section ? CLASS_OPTIONS_MAP[studentData.section] : [];
  const currentStreamOptions = studentData.section ? STREAM_OPTIONS_MAP[studentData.section] : [];

  // Loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary dark:from-secondary dark:to-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-cta" />
          <p className="mt-4 text-secondary dark:text-primary">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary dark:from-secondary dark:to-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary dark:text-primary flex items-center gap-2">
            <Edit className="w-6 h-6 text-cta" />
            Edit Student Profile
          </h1>
          <p className="text-secondary-midtone dark:text-primary-plus mt-2">
            Update information for {existingStudentData?.name?.first_name} {existingStudentData?.name?.last_name}
            {existingStudentData?.registration_id && ` (${existingStudentData.registration_id})`}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl shadow-lg border border-primary dark:border-secondary bg-white dark:bg-gray-900">
          {/* Personal Information Section */}
          <div className="p-8 border-b border-primary dark:border-secondary">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-cta dark:text-cta-low" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    First Name <span className="text-cta">*</span>
                  </label>
                  <input
                    type="text"
                    name="name.first_name"
                    value={studentData.name?.first_name}
                    onChange={handleTextChange}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                      fieldErrors['name.first_name']
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    placeholder="John"
                  />
                  {fieldErrors['name.first_name'] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                      <AlertCircle className="size-3" />
                      {fieldErrors['name.first_name']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Last Name <span className="text-cta">*</span>
                  </label>
                  <input
                    type="text"
                    name="name.last_name"
                    value={studentData.name?.last_name}
                    onChange={handleTextChange}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                      fieldErrors['name.last_name']
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    placeholder="Doe"
                  />
                  {fieldErrors['name.last_name'] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                      <AlertCircle className="size-3" />
                      {fieldErrors['name.last_name']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Other Names
                  </label>
                  <input
                    type="text"
                    name="name.other_names"
                    value={studentData.name.other_names}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Gender <span className="text-cta">*</span>
                  </label>
                  <select
                    name="gender"
                    value={studentData.gender}
                    onChange={handleSelectChange}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      fieldErrors['gender']
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors['gender'] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                      <AlertCircle className="size-3" />
                      {fieldErrors['gender']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Date of Birth <span className="text-cta">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={studentData.date_of_birth}
                    onChange={handleTextChange}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      fieldErrors['date_of_birth']
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  />
                  {fieldErrors['date_of_birth'] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                      <AlertCircle className="size-3" />
                      {fieldErrors['date_of_birth']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Religion
                  </label>
                  <select
                    name="religion"
                    value={studentData.religion}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
                  {studentPhotoPreview ? (
                    <>
                      <img src={studentPhotoPreview} alt="Student" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setStudentPhotoFile(null);
                          setStudentPhotoPreview(existingStudentData?.photo || '');
                        }}
                        className="absolute top-2 right-2 bg-cta text-white p-1 rounded-full hover:bg-cta/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Student Photo</p>
                      {existingStudentData?.photo && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current photo is set</p>
                      )}
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
                  className="mt-4 px-4 py-2 bg-cta text-white rounded-lg cursor-pointer hover:bg-cta/90 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {existingStudentData?.photo ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>

            {/* Optional IDs Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Optional Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    LIN (Learner Identification Number)
                  </label>
                  <input
                    type="text"
                    name="LIN"
                    value={studentData.LIN || ''}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                    Payment Code
                  </label>
                  <input
                    type="text"
                    name="payment_code"
                    value={studentData.payment_code || ''}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="p-8 border-b border-primary dark:border-secondary">
            <div className="flex items-center gap-2 mb-6">
              <Book className="w-5 h-5 text-cta dark:text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Academic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  Academic Section <span className="text-cta">*</span>
                </label>
                <select
                  name="section"
                  value={studentData.section}
                  onChange={handleSelectChange}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    fieldErrors['section']
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  <option value="">-- Select Section --</option>
                  <option value="Day Care">Day Care</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                </select>
                {fieldErrors['section'] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                    <AlertCircle className="size-3" />
                    {fieldErrors['section']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  Class <span className="text-cta">*</span>
                </label>
                <select
                  name="class.name"
                  value={studentData.class.name}
                  onChange={handleSelectChange}
                  disabled={!studentData.section}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
                    fieldErrors['class.name']
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  <option value="">-- Select Class --</option>
                  {currentClassOptions.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
                {fieldErrors['class.name'] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                    <AlertCircle className="size-3" />
                    {fieldErrors['class.name']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  Stream
                </label>
                <select
                  name="class.stream"
                  value={studentData.class.stream}
                  onChange={handleSelectChange}
                  disabled={!studentData.section || currentStreamOptions.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select Stream --</option>
                  {currentStreamOptions.map(stream => (
                    <option key={stream} value={stream}>{stream}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  School Section
                </label>
                <select
                  name="house"
                  value={studentData.house}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select House --</option>
                  {HOUSE_OPTIONS.map(house => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                Club
              </label>
              <input
                type="text"
                name="club"
                value={studentData.club}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter club name"
              />
            </div>
          </div>

          {/* Residence Information */}
          <div className="p-8 border-b border-primary dark:border-secondary">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-cta dark:text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Residence Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  Region
                </label>
                <select
                  name="residence.region"
                  value={studentData?.residence?.region}
                  onChange={(e) => {
                    const selectedRegion = e.target.value as Region;
                    handleSelectChange(e);
                    setRegion(selectedRegion);
                    getDistricts(selectedRegion)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value=''>-- Select Region --</option>
                  <option value='Central' >Central</option>
                  <option value='Eastern' >Eastern</option>
                  <option value='Western' >Western</option>
                  <option value='Northern' >North</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  District
                </label>
                <select
                  name="residence.district"
                  value={studentData?.residence?.district}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value=''>-- Select District --</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                  Village
                </label>
                <input
                  type="text"
                  name="residence.village"
                  value={studentData?.residence?.village}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter village name"
                />
              </div>
            </div>
          </div>

          {/* Guardian 1 Information */}
          <div className="p-8 border-b border-primary-plus dark:border-secondary bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cta dark:text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Primary Guardian Information</h2>
              {existingGuardian1Data && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                  Existing Guardian
                </span>
              )}
            </div>

            {!guardian1_not_saved && existingGuardian1Data ? (
              <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Verified className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-green-800 dark:text-green-300 font-medium">Existing guardian data loaded</p>
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      You can update the relationship or upload a new photo
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Tabs - Only show if no existing guardian */}
                {!existingGuardian1Data && (
                  <div className='flex gap-4 mb-8 text-secondary dark:text-primary'>
                    <span
                      onClick={() => setIsContinuingGuardian1(false)}
                      className={clsx('cursor-pointer border py-1 px-2 text-sm rounded-md', !isContinuingGuardian1 && 'bg-cta text-white border-none')}>
                      New Guardian
                    </span>
                    <span
                      onClick={() => setIsContinuingGuardian1(true)}
                      className={clsx('cursor-pointer border py-1 px-2 text-sm rounded-md', isContinuingGuardian1 && 'bg-cta text-white border-none')}>
                      Existing Parent
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Check If Guardian is continuing or new */}
                  {!isContinuingGuardian1 || existingGuardian1Data ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          Full Name <span className="text-cta">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian1.full_name"
                          value={studentData.guardian1?.full_name}
                          onChange={handleTextChange}
                          disabled={!!existingGuardian1Data}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                            fieldErrors['guardian1.full_name']
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600",
                            existingGuardian1Data 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          )}
                          placeholder="Jane Doe"
                        />
                        {fieldErrors['guardian1.full_name'] && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                            <AlertCircle className="size-3" />
                            {fieldErrors['guardian1.full_name']}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          Contact <span className="text-cta">*</span>
                        </label>
                        <input
                          type="tel"
                          name="guardian1.contact"
                          value={studentData.guardian1?.contact}
                          onChange={handleTextChange}
                          disabled={!!existingGuardian1Data}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                            fieldErrors['guardian1.contact']
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600",
                            existingGuardian1Data 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          )}
                          placeholder="+256700000000"
                        />
                        {fieldErrors['guardian1.contact'] && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                            <AlertCircle className="size-3" />
                            {fieldErrors['guardian1.contact']}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          NIN <span className="text-cta">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardian1.nin"
                          value={studentData.guardian1?.nin}
                          onChange={handleTextChange}
                          disabled={!!existingGuardian1Data}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                            fieldErrors['guardian1.nin']
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600",
                            existingGuardian1Data 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          )}
                          placeholder="CM00000000000AA"
                        />
                        {fieldErrors['guardian1.nin'] && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                            <AlertCircle className="size-3" />
                            {fieldErrors['guardian1.nin']}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="guardian1.email"
                          value={studentData.guardian1?.email}
                          onChange={handleTextChange}
                          disabled={!!existingGuardian1Data}
                          className={clsx(
                            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                            existingGuardian1Data 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          )}
                          placeholder="jane@example.com (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          Relationship <span className="text-cta">*</span>
                        </label>
                        <select
                          name="guardian1.relationship"
                          value={studentData.guardian1?.relationship}
                          onChange={handleSelectChange}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            fieldErrors['guardian1.relationship']
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          <option value="">-- Select Relationship --</option>
                          {RELATIONSHIP_OPTIONS.map(rel => (
                            <option key={rel} value={rel}>{rel}</option>
                          ))}
                        </select>
                        {fieldErrors['guardian1.relationship'] && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                            <AlertCircle className="size-3" />
                            {fieldErrors['guardian1.relationship']}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='text-secondary dark:text-primary'>
                      <p className='text-sm mb-4'>* For existing parents please provide the GuardianID</p>
                      <div>
                        <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                          Guardian ID: <span className="text-cta">*</span>
                        </label>
                        <input
                          type="text"
                          value={continuingGuardian1ID}
                          onChange={(e) => { 
                            setContinuingGuardian1ID(e.target.value); 
                            setVerifyState1('idle'); 
                          }}
                          className={clsx(
                            "w-72 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                            fieldErrors['continuingGuardian1ID']
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          )}
                          placeholder="Gxxxx--xxxx-xxxx-xxx"
                        />
                      </div>
                      <button
                        disabled={verifyState1 === "loading"}
                        onClick={() => getContinuingGuardian1Info(continuingGuardian1ID)}
                        className={`
                          py-2 px-4 rounded-md my-4 text-sm text-white flex items-center justify-center gap-2
                          transition-all duration-200
                          ${verifyState1 === "idle" && "bg-red-600 hover:bg-red-700"}
                          ${verifyState1 === "loading" && "bg-red-400 cursor-not-allowed"}
                          ${verifyState1 === "success" && "bg-green-600"}
                          ${verifyState1 === "error" && "bg-red-600"}
                        `}
                      >
                        {verifyState1 === "loading" && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {verifyState1 === "success" && <Verified />}
                        {verifyState1 === "error" && <OctagonX />}

                        <span>
                          {verifyState1 === "idle" && "Verify Guardian"}
                          {verifyState1 === "loading" && "Verifying..."}
                          {verifyState1 === "success" && "Verified"}
                          {verifyState1 === "error" && "Invalid"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Guardian 1 Photo Upload */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden relative">
                      {guardian1PhotoPreview ? (
                        <>
                          <img src={guardian1PhotoPreview} alt="Guardian 1" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setGuardian1PhotoFile(null);
                              setGuardian1PhotoPreview('');
                            }}
                            className="absolute top-1 right-1 bg-cta text-white p-1 rounded-full hover:bg-cta/90"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : contuinuingGuardian1PhotoPreview ? (
                        <>
                          <img src={contuinuingGuardian1PhotoPreview} alt="Existing Guardian" className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                            Current
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Guardian Photo</p>
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
                      className="mt-3 px-3 py-1.5 text-sm bg-cta text-white rounded-lg cursor-pointer hover:bg-cta/90 transition flex items-center gap-2"
                    >
                      <Upload className="w-3 h-3" />
                      {existingGuardian1Data ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Optional</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Guardian 2 Button */}
          {!showGuardian2 && !existingGuardian2Data && (
            <div className="p-6 border-b border-primary dark:border-secondary">
              <button
                type="button"
                onClick={() => setShowGuardian2(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-cta hover:text-cta transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Secondary Guardian (Optional)
              </button>
            </div>
          )}

          {/* Guardian 2 Information */}
          {(showGuardian2 || existingGuardian2Data) && (
            <div className="p-8 border-b border-primary-plus dark:border-secondary bg-green-50 dark:bg-green-900/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cta dark:text-cta" />
                  <h2 className="text-lg font-semibold text-secondary dark:text-primary">Secondary Guardian Information</h2>
                  {existingGuardian2Data && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                      Existing Guardian
                    </span>
                  )}
                </div>
                {!existingGuardian2Data && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuardian2(false);
                      setIsContinuingGuardian2(false);
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
                      setContinuingGuardian2PhotoFile(null);
                      setContinuingGuardian2PhotoPreview('');
                      setContinuingGuardian2ID('');
                      setVerifyState2('idle');
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {existingGuardian2Data ? (
                <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Verified className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-green-800 dark:text-green-300 font-medium">Existing guardian data loaded</p>
                      <p className="text-green-700 dark:text-green-400 text-sm">
                        You can update the relationship or upload a new photo
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guardian 2 Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                      Full Name <span className="text-cta">*</span>
                    </label>
                    <input
                      type="text"
                      name="guardian2.full_name"
                      value={studentData.guardian2?.full_name}
                      onChange={handleTextChange}
                      disabled={!!existingGuardian2Data}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                        fieldErrors['guardian2.full_name']
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600",
                        existingGuardian2Data 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                      placeholder="Jane Doe"
                    />
                    {fieldErrors['guardian2.full_name'] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                        <AlertCircle className="size-3" />
                        {fieldErrors['guardian2.full_name']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                      Contact <span className="text-cta">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guardian2.contact"
                      value={studentData.guardian2?.contact}
                      onChange={handleTextChange}
                      disabled={!!existingGuardian2Data}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                        fieldErrors['guardian2.contact']
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600",
                        existingGuardian2Data 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                      placeholder="+256700000000"
                    />
                    {fieldErrors['guardian2.contact'] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                        <AlertCircle className="size-3" />
                        {fieldErrors['guardian2.contact']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                      NIN <span className="text-cta">*</span>
                    </label>
                    <input
                      type="text"
                      name="guardian2.nin"
                      value={studentData.guardian2?.nin}
                      onChange={handleTextChange}
                      disabled={!!existingGuardian2Data}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                        fieldErrors['guardian2.nin']
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600",
                        existingGuardian2Data 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                      placeholder="CM00000000000AA"
                    />
                    {fieldErrors['guardian2.nin'] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                        <AlertCircle className="size-3" />
                        {fieldErrors['guardian2.nin']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="guardian2.email"
                      value={studentData.guardian2?.email}
                      onChange={handleTextChange}
                      disabled={!!existingGuardian2Data}
                      className={clsx(
                        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition",
                        existingGuardian2Data 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                      placeholder="jane@example.com (Optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary dark:text-primary mb-1">
                      Relationship <span className="text-cta">*</span>
                    </label>
                    <select
                      name="guardian2.relationship"
                      value={studentData.guardian2?.relationship}
                      onChange={handleSelectChange}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                        fieldErrors['guardian2.relationship']
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      <option value="">-- Select Relationship --</option>
                      {RELATIONSHIP_OPTIONS.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                    {fieldErrors['guardian2.relationship'] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex gap-1 items-center">
                        <AlertCircle className="size-3" />
                        {fieldErrors['guardian2.relationship']}
                      </p>
                    )}
                  </div>
                </div>

                {/* Guardian 2 Photo Upload */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden relative">
                    {guardian2PhotoPreview ? (
                      <>
                        <img src={guardian2PhotoPreview} alt="Guardian 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setGuardian2PhotoFile(null);
                            setGuardian2PhotoPreview('');
                          }}
                          className="absolute top-1 right-1 bg-cta text-white p-1 rounded-full hover:bg-cta/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : contuinuingGuardian2PhotoPreview ? (
                      <>
                        <img src={contuinuingGuardian2PhotoPreview} alt="Existing Guardian" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                          Current
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Guardian Photo</p>
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
                    className="mt-3 px-3 py-1.5 text-sm bg-cta text-white rounded-lg cursor-pointer hover:bg-cta/90 transition flex items-center gap-2"
                  >
                    <Upload className="w-3 h-3" />
                    {existingGuardian2Data ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Optional</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className={clsx(
                "px-6 py-2.5 text-white rounded-lg transition font-medium flex items-center gap-2",
                isLoading || !isFormValid
                  ? "bg-cta/50 cursor-not-allowed"
                  : "bg-cta hover:bg-cta/90"
              )}
            >
              {isLoading ? (
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

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>All fields marked with <span className="text-cta">*</span> are required</p>
          <p className="mt-2">Changes will be saved immediately upon submission</p>
        </div>
      </div>
    </div>
  );
}