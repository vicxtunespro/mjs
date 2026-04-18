import { useState, useEffect, useCallback } from 'react';
import { StudentData, PhotoState, VerifyState } from '../types';
import {
    generateRegistrationID,
    generateGuardianID,
    saveDraft,
    loadDraft,
    clearDraft,
    toUpperCase
} from '../utils';
import { CLOUDINARY_CONFIG } from '../constants';
import { toast } from 'react-toastify';

const initialStudentData: StudentData = {
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
};

const initialPhotos: PhotoState = {
    student: { file: null, preview: '' },
    guardian1: { file: null, preview: '' },
    guardian2: { file: null, preview: '' },
    continuingGuardian1: { file: null, preview: '', existingUrl: '' },
    continuingGuardian2: { file: null, preview: '', existingUrl: '' },
};

export const useRegistration = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [studentData, setStudentData] = useState<StudentData>(initialStudentData);
    const [photos, setPhotos] = useState<PhotoState>(initialPhotos);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState<any>(null);

    // Guardian states
    const [isContinuingGuardian1, setIsContinuingGuardian1] = useState(false);
    const [isContinuingGuardian2, setIsContinuingGuardian2] = useState(false);
    const [continuingGuardian1ID, setContinuingGuardian1ID] = useState('');
    const [continuingGuardian2ID, setContinuingGuardian2ID] = useState('');
    const [verifyState1, setVerifyState1] = useState<VerifyState>('idle');
    const [verifyState2, setVerifyState2] = useState<VerifyState>('idle');
    const [showGuardian2, setShowGuardian2] = useState(false);

    // Load draft on mount
    useEffect(() => {
        const draft = loadDraft();
        if (draft) {
            setStudentData(draft.studentData || initialStudentData);
            setPhotos(draft.photos || initialPhotos);
            setShowGuardian2(draft.showGuardian2 || false);
        }
    }, []);

    // Auto-save draft
    useEffect(() => {
        const timeout = setTimeout(() => {
            saveDraft({ studentData, photos, showGuardian2 });
        }, 1000);
        return () => clearTimeout(timeout);
    }, [studentData, photos, showGuardian2]);

    const updateStudentData = useCallback((updates: Partial<StudentData>) => {
        setStudentData(prev => {
            const newData = { ...prev, ...updates };

            // Auto-uppercase for text fields
            if (updates.name) {
                newData.name = {
                    first_name: toUpperCase(updates.name.first_name || prev.name.first_name),
                    last_name: toUpperCase(updates.name.last_name || prev.name.last_name),
                    other_names: updates.name.other_names ? toUpperCase(updates.name.other_names) : prev.name.other_names,
                };
            }

            return newData;
        });
    }, []);

    const updatePhoto = useCallback((type: string, file: File | null, preview: string, existingUrl?: string) => {
        setPhotos(prev => ({
            ...prev,
            [type]: {
                ...prev[type as keyof PhotoState],
                file,
                preview,
                ...(existingUrl !== undefined && { existingUrl })
            }
        }));
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        const stepErrors: Record<string, string> = {};

        if (step === 1) {
            // Personal info validation
            if (!studentData.name.first_name) stepErrors['name.first_name'] = 'First name is required';
            if (!studentData.name.last_name) stepErrors['name.last_name'] = 'Last name is required';
            if (!studentData.gender) stepErrors['gender'] = 'Gender is required';
            if (!studentData.date_of_birth) stepErrors['date_of_birth'] = 'Date of birth is required';
        }

        if (step === 2) {
            // Academic info validation
            if (!studentData.section) stepErrors['section'] = 'Section is required';
            if (!studentData.class.name) stepErrors['class.name'] = 'Class is required';
        }

        if (step === 4) {
            // Guardian 1 validation
            if (!isContinuingGuardian1) {
                if (!studentData.guardian1?.full_name) stepErrors['guardian1.full_name'] = 'Full name is required';
                if (!studentData.guardian1?.contact) stepErrors['guardian1.contact'] = 'Contact is required';
                if (!studentData.guardian1?.nin) stepErrors['guardian1.nin'] = 'NIN is required';
                if (!studentData.guardian1?.relationship) stepErrors['guardian1.relationship'] = 'Relationship is required';
            } else if (!continuingGuardian1ID) {
                stepErrors['continuingGuardian1ID'] = 'Guardian ID is required';
            }
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    }, [studentData, isContinuingGuardian1, continuingGuardian1ID]);

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
        formData.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);

        const response = await fetch(CLOUDINARY_CONFIG.URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.secure_url;
    };

    const patchGuardianPhoto = async (guardianId: string, photoUrl: string) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/guardians/update/${guardianId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo: photoUrl }),
            }
        );
        if (!response.ok) throw new Error('Failed to update guardian photo');
        return response.json();
    };

    const getContinuingGuardianInfo = async (id: string, type: 1 | 2) => {
        const setVerifyState = type === 1 ? setVerifyState1 : setVerifyState2;
        setVerifyState('loading');

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/guardians/view/${id}`
            );

            if (!response.ok) {
                setVerifyState('error');
                return;
            }

            const result = await response.json();
            const guardian = result.data;

            if (type === 1) {
                setStudentData(prev => ({
                    ...prev,
                    guardian1: {
                        full_name: guardian.full_name ?? '',
                        contact: guardian.contact ?? '',
                        nin: guardian.nin ?? '',
                        email: guardian.email ?? 'Not Provided',
                        relationship: guardian.relationship ?? '',
                    },
                }));
                setPhotos(prev => ({
                    ...prev,
                    continuingGuardian1: {
                        ...prev.continuingGuardian1,
                        existingUrl: guardian.photo
                    }
                }));
                setVerifyState1('success');
            } else {
                setStudentData(prev => ({
                    ...prev,
                    guardian2: {
                        full_name: guardian.full_name ?? '',
                        contact: guardian.contact ?? '',
                        nin: guardian.nin ?? '',
                        email: guardian.email ?? 'Not Provided',
                        relationship: guardian.relationship ?? '',
                    },
                }));
                setPhotos(prev => ({
                    ...prev,
                    continuingGuardian2: {
                        ...prev.continuingGuardian2,
                        existingUrl: guardian.photo
                    }
                }));
                setVerifyState2('success');
            }
        } catch (error) {
            setVerifyState('error');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Processing registration...');

        try {
            // Upload photos sequentially to avoid type issues and provide better feedback
            const photoUrls: Record<string, string> = {};

            // Upload student photo if exists
            if (photos.student.file) {
                toast.update(toastId, { render: 'Uploading student photo...' });
                photoUrls.student = await uploadToCloudinary(photos.student.file);
            }

            // Upload guardian 1 photo if new guardian and photo exists
            if (!isContinuingGuardian1 && photos.guardian1.file) {
                toast.update(toastId, { render: 'Uploading primary guardian photo...' });
                photoUrls.guardian1 = await uploadToCloudinary(photos.guardian1.file);
            }

            // Upload guardian 2 photo if new guardian and photo exists
            if (showGuardian2 && !isContinuingGuardian2 && photos.guardian2.file) {
                toast.update(toastId, { render: 'Uploading secondary guardian photo...' });
                photoUrls.guardian2 = await uploadToCloudinary(photos.guardian2.file);
            }

            // Register Guardian 1
            let guardian1_id = continuingGuardian1ID;
            if (!isContinuingGuardian1) {
                guardian1_id = generateGuardianID();
                const guardian1Payload = {
                    guardian_id: guardian1_id,
                    full_name: studentData.guardian1!.full_name.trim(),
                    contact: studentData.guardian1!.contact.trim(),
                    nin: studentData.guardian1!.nin.trim(),
                    ...(studentData.guardian1!.email?.trim() && { email: studentData.guardian1!.email.trim() }),
                    ...(photoUrls.guardian1 && { photo: photoUrls.guardian1 }),
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guardians`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(guardian1Payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to register primary guardian');
                }
            } else if (photos.continuingGuardian1.file) {
                // Update continuing guardian photo
                toast.update(toastId, { render: 'Updating continuing guardian photo...' });
                const photoUrl = await uploadToCloudinary(photos.continuingGuardian1.file);
                await patchGuardianPhoto(continuingGuardian1ID, photoUrl);
            }

            // Register Guardian 2 if provided
            let guardian2_id = continuingGuardian2ID;
            if (showGuardian2 && !isContinuingGuardian2 && studentData.guardian2?.full_name) {
                guardian2_id = generateGuardianID();
                const guardian2Payload = {
                    guardian_id: guardian2_id,
                    full_name: studentData.guardian2.full_name.trim(),
                    contact: studentData.guardian2.contact.trim(),
                    nin: studentData.guardian2.nin.trim(),
                    ...(studentData.guardian2.email?.trim() && { email: studentData.guardian2.email.trim() }),
                    ...(photoUrls.guardian2 && { photo: photoUrls.guardian2 }),
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guardians`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(guardian2Payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to register secondary guardian');
                }
            } else if (showGuardian2 && photos.continuingGuardian2.file) {
                toast.update(toastId, { render: 'Updating continuing guardian photo...' });
                const photoUrl = await uploadToCloudinary(photos.continuingGuardian2.file);
                await patchGuardianPhoto(continuingGuardian2ID, photoUrl);
            }

            // Register Student
            toast.update(toastId, { render: 'Registering student...' });

            const registration_id = generateRegistrationID();

            // Build student payload
            const studentPayload: any = {
                registration_id,
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
                    guardian_id: guardian1_id,
                    relationship: studentData.guardian1?.relationship
                },
                ...(guardian2_id && {
                    guardian2: {
                        guardian_id: guardian2_id,
                        relationship: studentData.guardian2?.relationship
                    }
                }),
                ...(studentData.religion && { religion: studentData.religion }),
                house: studentData.house || null,
                ...(studentData.club && { club: studentData.club.trim() }),
                photo: photoUrls.student || null,
                ...(studentData.LIN && { LIN: studentData.LIN.trim() }),
                ...(studentData.payment_code && { payment_code: studentData.payment_code.trim() }),
            };

            // Add residence if any field is filled
            if (studentData.residence.region || studentData.residence.district || studentData.residence.village) {
                studentPayload.residence = {};
                if (studentData.residence.region) studentPayload.residence.region = studentData.residence.region;
                if (studentData.residence.district) studentPayload.residence.district = studentData.residence.district;
                if (studentData.residence.village) studentPayload.residence.village = studentData.residence.village;
            }

            const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentPayload),
            });

            if (!studentResponse.ok) {
                const errorData = await studentResponse.json();
                throw new Error(errorData.message || 'Failed to register student');
            }

            const result = await studentResponse.json();

            // Clear draft on success
            clearDraft();

            // Set submitted data for success report
            setSubmittedData({
                ...result.data,
                registration_id,
                guardian1: studentData.guardian1,
                guardian2: studentData.guardian2
            });

            toast.update(toastId, {
                render: 'Registration successful!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            setShowSuccess(true);

        } catch (error) {
            console.error('Registration error:', error);
            toast.update(toastId, {
                render: error instanceof Error ? error.message : 'Registration failed',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = useCallback(() => {
        setStudentData(initialStudentData);
        setPhotos(initialPhotos);
        setErrors({});
        setIsContinuingGuardian1(false);
        setIsContinuingGuardian2(false);
        setContinuingGuardian1ID('');
        setContinuingGuardian2ID('');
        setVerifyState1('idle');
        setVerifyState2('idle');
        setShowGuardian2(false);
        setCurrentStep(1);
        clearDraft();
    }, []);

    return {
        currentStep,
        setCurrentStep,
        studentData,
        photos,
        errors,
        isLoading,
        showSuccess,
        setShowSuccess,
        submittedData,
        isContinuingGuardian1,
        setIsContinuingGuardian1,
        isContinuingGuardian2,
        setIsContinuingGuardian2,
        continuingGuardian1ID,
        setContinuingGuardian1ID,
        continuingGuardian2ID,
        setContinuingGuardian2ID,
        verifyState1,
        verifyState2,
        showGuardian2,
        setShowGuardian2,
        updateStudentData,
        updatePhoto,
        validateStep,
        getContinuingGuardian1Info: () => getContinuingGuardianInfo(continuingGuardian1ID, 1),
        getContinuingGuardian2Info: () => getContinuingGuardianInfo(continuingGuardian2ID, 2),
        handleSubmit,
        handleReset,
    };
};