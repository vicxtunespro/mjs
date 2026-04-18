// TeacherMarksCollectionSheet.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Eye,
    Download,
    Users,
    BookOpen,
    Phone,
    User,
    Hash,
    MapPin,
    Calendar,
    Mail,
    RefreshCw,
    Trash2,
    BadgeCheck,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    Filter,
    X,
    Loader2,
    BookMarked,
    ClipboardList,
    Award,
    Printer,
    FileSpreadsheet,
    FileText,
    Send,
    ShieldCheck,
    Shield,
    GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import clsx from 'clsx';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UI Components
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import SectionHeader from '../ui/sectionHeader';

// Types
interface StudentName {
    first_name: string;
    last_name: string;
    other_names?: string;
}

interface StudentClass {
    name: string;
    stream?: string;
}

interface Student {
    _id: string;
    registration_id?: string;
    name: StudentName;
    class: StudentClass;
    gender: string;
    date_of_birth: string;
    section: string;
    stream?: string;
}

type ExamType = 'BEGINNING_OF_TERM' | 'MID_TERM' | 'END_OF_TERM' | 'SPECIAL';

interface Exam {
    _id: string;
    name: string;
    type: ExamType;
    term?: string;
    academicYear?: string;
    subjects: string[];
    isActive: boolean;
    requiresCore: boolean;
    createdAt: string;
}

interface Marks {
    [subject: string]: number | string;
}

interface StudentMarks {
    studentId: string;
    examId: string;
    marks: Marks;
    submittedAt?: string;
    submittedBy?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

interface Marksheet {
    _id: string;
    examId: string;
    class: string;
    stream?: string;
    subjects: string[];
    createdBy: string;
    createdAt: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectionReason?: string;
    marks: StudentMarks[];
}

interface ModifiedMark {
    id: string;
    original: Marks;
    changes: Marks;
    timestamp: number;
}

interface TeacherSession {
    examId: string;
    class: string;
    stream?: string;
    selectedSubjects: string[];
    modifiedMarks: Record<string, ModifiedMark>;
    lastActive: number;
}

// Predefined subjects
const CORE_SUBJECTS = [
    { key: 'ENG', label: 'English', type: 'number', min: 0, max: 100 },
    { key: 'MTC', label: 'Mathematics', type: 'number', min: 0, max: 100 },
    { key: 'SST', label: 'Social Studies', type: 'number', min: 0, max: 100 },
    { key: 'SCI', label: 'Science', type: 'number', min: 0, max: 100 },
];

const EXTRA_SUBJECTS = [
    { key: 'COMP', label: 'Computer', type: 'number', min: 0, max: 100 },
    { key: 'SWHIL', label: 'Swahili', type: 'number', min: 0, max: 100 },
    { key: 'FRENCH', label: 'French', type: 'number', min: 0, max: 100 },
    { key: 'ISLAM', label: 'Islamic', type: 'number', min: 0, max: 100 },
    { key: 'RE', label: 'Religious Education', type: 'number', min: 0, max: 100 },
    { key: 'LUG', label: 'Luganda', type: 'number', min: 0, max: 100 },
    { key: 'ARABIC', label: 'Arabic', type: 'number', min: 0, max: 100 },
    { key: 'GERMAN', label: 'German', type: 'number', min: 0, max: 100 },
    { key: 'CHINESE', label: 'Chinese', type: 'number', min: 0, max: 100 },
    { key: 'SWIMMING', label: 'Swimming', type: 'number', min: 0, max: 100 },
    { key: 'PAINTING', label: 'Painting', type: 'number', min: 0, max: 100 },
    { key: 'MUSIC', label: 'Music', type: 'number', min: 0, max: 100 },
    { key: 'DANCE', label: 'Dance', type: 'number', min: 0, max: 100 },
    { key: 'DRAMA', label: 'Drama', type: 'number', min: 0, max: 100 },
];

// Zustand Store with persistence
interface TeacherStore {
    session: TeacherSession | null;
    setSession: (session: TeacherSession | null) => void;
    updateModifiedMark: (studentId: string, changes: Marks, original: Marks) => void;
    clearModifiedMark: (studentId: string) => void;
    clearAllModified: () => void;
    clearSession: () => void;
}

const useTeacherStore = create<TeacherStore>()(
    persist(
        (set) => ({
            session: null,
            setSession: (session) => set({ session }),
            updateModifiedMark: (studentId, changes, original) =>
                set((state) => {
                    if (!state.session) return state;

                    const modifiedMarks = { ...state.session.modifiedMarks };
                    modifiedMarks[studentId] = {
                        id: studentId,
                        original,
                        changes,
                        timestamp: Date.now(),
                    };

                    return {
                        session: {
                            ...state.session,
                            modifiedMarks,
                            lastActive: Date.now(),
                        },
                    };
                }),
            clearModifiedMark: (studentId) =>
                set((state) => {
                    if (!state.session) return state;
                    const modifiedMarks = { ...state.session.modifiedMarks };
                    delete modifiedMarks[studentId];
                    return {
                        session: {
                            ...state.session,
                            modifiedMarks,
                            lastActive: Date.now(),
                        },
                    };
                }),
            clearAllModified: () =>
                set((state) => {
                    if (!state.session) return state;
                    return {
                        session: {
                            ...state.session,
                            modifiedMarks: {},
                            lastActive: Date.now(),
                        },
                    };
                }),
            clearSession: () => set({ session: null }),
        }),
        {
            name: 'teacher-marks-storage',
            partialize: (state) => ({ session: state.session }),
        }
    )
);

// Loading Skeletons
const SelectionPhaseSkeleton = () => (
    <Card className="w-full border-none shadow-none">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-64" />
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
                <Separator />
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
        </CardFooter>
    </Card>
);

const TablePhaseSkeleton = () => (
    <Card className="w-full border-none shadow-none">
        <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((row) => (
                            <TableRow key={row}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                    <TableCell key={col}>
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
);

// Main Component
const TeacherMarksCollectionSheet: React.FC = () => {
    const router = useRouter();
    const { session, setSession, updateModifiedMark, clearAllModified, clearSession } = useTeacherStore();

    // Local state
    const [students, setStudents] = useState<Student[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [existingMarksheets, setExistingMarksheets] = useState<Marksheet[]>([]);
    const [activeMarksheet, setActiveMarksheet] = useState<Marksheet | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [streams, setStreams] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalComment, setApprovalComment] = useState('');
    const [userRole, setUserRole] = useState<'admin' | 'teacher'>('teacher');

    // Selection phase state
    const [selectedExam, setSelectedExam] = useState<string>(session?.examId || '');
    const [selectedClass, setSelectedClass] = useState<string>(session?.class || '');
    const [selectedStream, setSelectedStream] = useState<string>(session?.stream || 'all');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(session?.selectedSubjects || []);
    const [selectionPhase, setSelectionPhase] = useState<boolean>(!session);

    // Marks state
    const [marks, setMarks] = useState<Record<string, Marks>>({});
    const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch students
                const studentsResponse = await fetch('https://api.mjsportal.xyz/students');
                const studentsResults = await studentsResponse.json();
                const studentsData = studentsResults.data;
                setStudents(studentsData);

                // Extract unique classes and streams
                const uniqueClasses = [...new Set(studentsData.map((s: Student) => s.class?.name).filter(Boolean))];
                const uniqueStreams = [...new Set(studentsData.map((s: Student) => s.class?.stream).filter(Boolean))];
                setClasses(uniqueClasses as string[]);
                setStreams(uniqueStreams as string[]);

                // Fetch exams
                const examsData: Exam[] = [
                    {
                        _id: "65f1a1b2c3d4e5f601",
                        name: "Beginning of Term Assessment - Term 1",
                        type: "BEGINNING_OF_TERM",
                        term: "Term 1",
                        academicYear: "2025",
                        subjects: ["Mathematics", "English", "Biology", "History"],
                        isActive: true,
                        requiresCore: true,
                        createdAt: "2025-01-10T08:30:00.000Z",
                    },
                    {
                        _id: "65f1a1b2c3d4e5f602",
                        name: "Mid Term Exams - Term 1",
                        type: "MID_TERM",
                        term: "Term 1",
                        academicYear: "2025",
                        subjects: ["Mathematics", "English", "Chemistry", "Geography"],
                        isActive: true,
                        requiresCore: true,
                        createdAt: "2025-02-15T09:00:00.000Z",
                    },
                    {
                        _id: "65f1a1b2c3d4e5f603",
                        name: "End of Term Exams - Term 1",
                        type: "END_OF_TERM",
                        term: "Term 1",
                        academicYear: "2025",
                        subjects: ["Mathematics", "English", "Physics", "Computer Studies"],
                        isActive: true,
                        requiresCore: true,
                        createdAt: "2025-03-20T10:15:00.000Z",
                    },
                    {
                        _id: "65f1a1b2c3d4e5f604",
                        name: "Swimming Competition",
                        type: "SPECIAL",
                        term: "Term 2",
                        academicYear: "2025",
                        subjects: ["SWIMMING"],
                        isActive: true,
                        requiresCore: false,
                        createdAt: "2025-05-05T08:45:00.000Z",
                    },
                    {
                        _id: "65f1a1b2c3d4e5f605",
                        name: "Art Exhibition - Painting",
                        type: "SPECIAL",
                        term: "Term 2",
                        academicYear: "2025",
                        subjects: ["PAINTING"],
                        isActive: true,
                        requiresCore: false,
                        createdAt: "2025-06-18T09:30:00.000Z",
                    },
                ];

                setExams(examsData);

            } catch (error) {
                toast.error('Failed to load data');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter students based on class and stream
    useEffect(() => {
        if (!selectedClass || isLoading) {
            setFilteredStudents([]);
            return;
        }

        let filtered = students.filter(
            (student) => student.class?.name === selectedClass
        );

        if (selectedStream && selectedStream !== 'all') {
            filtered = filtered.filter(
                (student) => student.class?.stream === selectedStream
            );
        }

        // Sort by name
        filtered.sort((a, b) => {
            const nameA = `${a.name?.first_name} ${a.name?.last_name}`;
            const nameB = `${b.name?.first_name} ${b.name?.last_name}`;
            return nameA.localeCompare(nameB);
        });

        setFilteredStudents(filtered);
    }, [students, selectedClass, selectedStream, isLoading]);

    // Load existing marksheet if available
    useEffect(() => {
        const loadExistingMarksheet = async () => {
            if (!selectedExam || !selectedClass || selectionPhase) return;

            try {
                // Check if marksheet exists
                const existing = existingMarksheets.find(
                    m => m.examId === selectedExam && 
                         m.class === selectedClass && 
                         (selectedStream === 'all' || m.stream === selectedStream)
                );

                if (existing) {
                    setActiveMarksheet(existing);
                    
                    // Initialize marks from existing marksheet
                    const initialMarks: Record<string, Marks> = {};
                    existing.marks.forEach((mark: StudentMarks) => {
                        initialMarks[mark.studentId] = { ...mark.marks };
                    });
                    setMarks(initialMarks);
                } else {
                    setActiveMarksheet(null);
                    setMarks({});
                }
            } catch (error) {
                console.error('Failed to load existing marksheet:', error);
            }
        };

        loadExistingMarksheet();
    }, [selectedExam, selectedClass, selectedStream, selectionPhase, existingMarksheets]);

    // Restore session on mount
    useEffect(() => {
        if (session && !isLoading && filteredStudents.length > 0) {
            setSelectedExam(session.examId);
            setSelectedClass(session.class);
            setSelectedStream(session.stream || 'all');
            setSelectedSubjects(session.selectedSubjects);
            setSelectionPhase(false);

            // Restore marks from modified rows
            const restoredMarks: Record<string, Marks> = { ...marks };
            
            // Overlay with session modifications
            Object.entries(session.modifiedMarks).forEach(([studentId, modified]) => {
                restoredMarks[studentId] = {
                    ...(restoredMarks[studentId] || {}),
                    ...modified.changes
                };
            });
            
            setMarks(restoredMarks);

            // Mark modified cells
            const modifiedSet = new Set<string>();
            Object.values(session.modifiedMarks).forEach((modified) => {
                Object.entries(modified.changes).forEach(([subject, value]) => {
                    if (value !== '') {
                        modifiedSet.add(`${modified.id}-${subject}`);
                    }
                });
            });
            setModifiedCells(modifiedSet);
        }
    }, [session, isLoading, filteredStudents]);

    // Handle exam selection
    const handleExamToggle = (examId: string) => {
        setSelectedExam(examId);

        const exam = exams.find(e => e._id === examId);
        if (exam) {
            if (exam.requiresCore) {
                setSelectedSubjects(CORE_SUBJECTS.map(s => s.key));
            } else {
                setSelectedSubjects([]);
            }
        }
    };

    // Handle subject toggle
    const handleSubjectToggle = (subjectKey: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(subjectKey)
                ? prev.filter((s) => s !== subjectKey)
                : [...prev, subjectKey]
        );
    };

    const handleSelectCoreSubjects = () => {
        setSelectedSubjects(CORE_SUBJECTS.map(s => s.key));
    };

    const handleSelectAllSubjects = () => {
        setSelectedSubjects([...CORE_SUBJECTS, ...EXTRA_SUBJECTS].map(s => s.key));
    };

    const handleDeselectAllSubjects = () => {
        setSelectedSubjects([]);
    };

    // Handle generate table
    const handleGenerateTable = () => {
        if (!selectedExam) {
            toast.error('Please select an exam');
            return;
        }
        if (!selectedClass) {
            toast.error('Please select a class');
            return;
        }

        setSelectionPhase(false);

        // Save session
        setSession({
            examId: selectedExam,
            class: selectedClass,
            stream: selectedStream !== 'all' ? selectedStream : undefined,
            selectedSubjects,
            modifiedMarks: {},
            lastActive: Date.now(),
        });

        toast.success('Marks sheet generated successfully');
    };

    // Handle mark input
    const handleMarkChange = (studentId: string, subject: string, value: string) => {
        // Validate number
        const numValue = value === '' ? '' : parseFloat(value);
        if (value !== '' && (isNaN(numValue as number) || (numValue as number) < 0 || (numValue as number) > 100)) {
            toast.error('Marks must be between 0 and 100');
            return;
        }

        const student = students.find(s => s._id === studentId);
        if (!student) return;

        // Get current marks for this student
        const currentMarks = marks[studentId] || {};
        
        // Get existing marksheet marks if any
        const existingMarksheetMark = activeMarksheet?.marks.find(m => m.studentId === studentId)?.marks || {};

        // Create updated marks by merging all sources
        const updatedMarks = {
            ...existingMarksheetMark,
            ...currentMarks,
            [subject]: value === '' ? '' : numValue
        };

        // Update marks state
        setMarks(prev => ({
            ...prev,
            [studentId]: updatedMarks
        }));

        // Track modified cells
        setModifiedCells(prev => {
            const newSet = new Set(prev);
            if (value !== '') {
                newSet.add(`${studentId}-${subject}`);
            } else {
                newSet.delete(`${studentId}-${subject}`);
            }
            return newSet;
        });

        // Get original value from existing marksheet
        const originalValue = existingMarksheetMark[subject] || '';

        // Update modified marks in store
        const changes = { [subject]: value === '' ? '' : numValue };
        const original = { [subject]: originalValue };

        updateModifiedMark(studentId, changes, original);
    };

    // Handle save as draft
    const handleSaveDraft = async () => {
        if (!session || Object.keys(session.modifiedMarks).length === 0) return;

        setIsSaving(true);

        try {
            // Prepare marks data
            const marksData = filteredStudents.map(student => ({
                studentId: student._id,
                examId: session.examId,
                marks: marks[student._id] || {},
                status: 'draft' as const,
            }));

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Draft saved successfully');

            // Clear modified state
            clearAllModified();
            setModifiedCells(new Set());

        } catch (error) {
            toast.error('Failed to save draft');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle submit for approval
    const handleSubmitForApproval = async () => {
        if (!session) return;

        setIsSubmitting(true);

        try {
            // Validate all students have marks
            const missingMarks = filteredStudents.filter(student => {
                const studentMarks = marks[student._id] || {};
                return selectedSubjects.some(subject => !studentMarks[subject]);
            });

            if (missingMarks.length > 0) {
                toast.error(`${missingMarks.length} students have missing marks`);
                setIsSubmitting(false);
                return;
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Marksheet submitted for approval');

            // Clear session
            clearSession();
            setSelectionPhase(true);
            setShowSubmitDialog(false);

        } catch (error) {
            toast.error('Failed to submit marksheet');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle approval/rejection
    const handleApproval = async (approve: boolean) => {
        if (!activeMarksheet) return;

        setIsSaving(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success(approve ? 'Marksheet approved' : 'Marksheet rejected');
            setShowApprovalDialog(false);
            setApprovalComment('');
            
            // Refresh marksheet status
            setActiveMarksheet(prev => prev ? { ...prev, status: approve ? 'approved' : 'rejected' } : null);
            
        } catch (error) {
            toast.error('Failed to process approval');
        } finally {
            setIsSaving(false);
        }
    };

    // Export functions
    const exportToCSV = () => {
        const headers = ['Student ID', 'Name', 'Class', 'Stream', ...selectedSubjects];
        
        const rows = filteredStudents.map(student => {
            const studentMarks = marks[student._id] || {};
            return [
                student.registration_id || student._id.slice(-8),
                `${student.name?.first_name} ${student.name?.last_name}`,
                student.class?.name,
                student.class?.stream || '-',
                ...selectedSubjects.map(subject => studentMarks[subject] || ''),
            ];
        });

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marksheet_${selectedExamDetails?.name || 'exam'}_${selectedClass}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();

        toast.success('CSV exported successfully');
    };

    const exportToExcel = () => {
        const data = filteredStudents.map(student => {
            const studentMarks = marks[student._id] || {};
            const row: any = {
                'Student ID': student.registration_id || student._id.slice(-8),
                'Name': `${student.name?.first_name} ${student.name?.last_name}`,
                'Class': student.class?.name,
                'Stream': student.class?.stream || '-',
            };
            selectedSubjects.forEach(subject => {
                row[subject] = studentMarks[subject] || '';
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Marksheet');
        XLSX.writeFile(wb, `marksheet_${selectedExamDetails?.name || 'exam'}_${selectedClass}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast.success('Excel file exported successfully');
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');

        doc.setFontSize(16);
        doc.text(selectedExamDetails?.name || 'Marksheet', 14, 15);
        doc.setFontSize(10);
        doc.text(`Class: ${selectedClass} ${selectedStream !== 'all' ? `- ${selectedStream}` : ''}`, 14, 22);
        doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 28);

        const headers = ['ID', 'Name', 'Class', 'Stream', ...selectedSubjects];
        const tableData = filteredStudents.map(student => {
            const studentMarks = marks[student._id] || {};
            return [
                student.registration_id?.slice(-8) || student._id.slice(-8),
                `${student.name?.first_name} ${student.name?.last_name}`,
                student.class?.name,
                student.class?.stream || '-',
                ...selectedSubjects.map(subject => studentMarks[subject] || ''),
            ];
        });

        autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`marksheet_${selectedExamDetails?.name || 'exam'}_${selectedClass}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('PDF exported successfully');
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle clear current activity
    const handleClearActivity = () => {
        clearSession();
        setSelectedExam('');
        setSelectedClass('');
        setSelectedStream('all');
        setSelectedSubjects([]);
        setMarks({});
        setModifiedCells(new Set());
        setActiveMarksheet(null);
        setSelectionPhase(true);
        setShowClearDialog(false);

        toast.success('Activity cleared');
    };

    // Memoized values - FIXED: Convert to boolean
    const hasUnsavedChanges = useMemo(() => {
        return session ? Object.keys(session.modifiedMarks).length > 0 : false;
    }, [session]);

    const modifiedCount = useMemo(() => {
        return session ? Object.keys(session.modifiedMarks).length : 0;
    }, [session]);

    const selectedExamDetails = useMemo(() => {
        return exams.find(e => e._id === selectedExam);
    }, [exams, selectedExam]);

    const allSelectedSubjects = useMemo(() => {
        const allSubjects = [...CORE_SUBJECTS, ...EXTRA_SUBJECTS];
        return allSubjects.filter(s => selectedSubjects.includes(s.key));
    }, [selectedSubjects]);

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
            case 'submitted':
                return <Badge className="bg-red-100 text-gray-800 border-blue-200">Submitted</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
        }
    };

    if (isLoading) {
        return selectionPhase ? <SelectionPhaseSkeleton /> : <TablePhaseSkeleton />;
    }

    // Render selection phase
    if (selectionPhase) {
        return (
            <Card className="w-full border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SectionHeader
                            title="Marks Collection Sheet"
                            subtitle="Select exam, class and subjects to begin"
                            Icon={ClipboardList}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">1. Select Exam</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Exam *</label>
                                    {exams.length > 0 ? (
                                        <Select value={selectedExam} onValueChange={handleExamToggle}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an exam" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((exam) => (
                                                    <SelectItem key={exam._id} value={exam._id}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{exam.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {exam.type === 'SPECIAL' ? 'Special' : exam.type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-sm text-gray-500 py-2">No active exams available</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium mb-2">2. Select Class</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Class *</label>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stream</label>
                                    <Select value={selectedStream} onValueChange={setSelectedStream}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All streams" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Streams</SelectItem>
                                            {streams.map((stream) => (
                                                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium mb-2">3. Select Subjects</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {selectedExamDetails?.requiresCore 
                                    ? "Core subjects are pre-selected. You can add extra subjects as needed."
                                    : "Select subjects for this exam."}
                            </p>

                            <div className="flex gap-2 mb-4 flex-wrap">
                                {selectedExamDetails?.requiresCore && (
                                    <Button variant="outline" size="sm" onClick={handleSelectCoreSubjects}>
                                        Core Subjects Only
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={handleSelectAllSubjects}>
                                    All Subjects
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDeselectAllSubjects}>
                                    Clear All
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {selectedExamDetails?.requiresCore && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-gray-600">Core Subjects</h4>
                                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {CORE_SUBJECTS.map((subject) => (
                                                <div key={subject.key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`core-${subject.key}`}
                                                        checked={selectedSubjects.includes(subject.key)}
                                                        onChange={() => handleSubjectToggle(subject.key)}
                                                        className="rounded border-gray-300"
                                                        disabled
                                                    />
                                                    <label htmlFor={`core-${subject.key}`} className="text-sm font-medium">
                                                        {subject.label} ({subject.key})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-purple-600">
                                        {selectedExamDetails?.requiresCore ? 'Extra Subjects' : 'Available Subjects'}
                                    </h4>
                                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {EXTRA_SUBJECTS.map((subject) => (
                                            <div key={subject.key} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`extra-${subject.key}`}
                                                    checked={selectedSubjects.includes(subject.key)}
                                                    onChange={() => handleSubjectToggle(subject.key)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={`extra-${subject.key}`} className="text-sm">
                                                    {subject.label} ({subject.key})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button 
                        onClick={handleGenerateTable} 
                        disabled={!selectedExam || !selectedClass || selectedSubjects.length === 0}
                    >
                        Generate Marks Sheet
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Render marks sheet phase
    return (
        <>
            <Card className="w-full border-none shadow-none">
                <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <SectionHeader
                                    title="Marks Collection Sheet"
                                    subtitle={`${selectedExamDetails?.name || 'Exam'} - ${selectedClass} ${selectedStream !== 'all' ? `- ${selectedStream}` : ''}`}
                                    Icon={ClipboardList}
                                />
                                {activeMarksheet && getStatusBadge(activeMarksheet.status)}
                                {hasUnsavedChanges && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {modifiedCount} unsaved
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="flex items-center gap-2">
                                <span>{filteredStudents.length} students</span>
                                <span>•</span>
                                <span>{selectedSubjects.length} subjects</span>
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={exportToCSV}>
                                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                                        CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToExcel}>
                                        <FileText className="h-4 w-4 mr-2 text-gray-600" />
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToPDF}>
                                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectionPhase(true)}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Change
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Change selection</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Clear
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Clear activity</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {activeMarksheet?.status !== 'approved' && (
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleSaveDraft} 
                                    disabled={!hasUnsavedChanges || isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Draft
                                </Button>
                            )}

                            {userRole === 'teacher' && activeMarksheet?.status !== 'approved' && activeMarksheet?.status !== 'submitted' && (
                                <Button 
                                    size="sm" 
                                    onClick={() => setShowSubmitDialog(true)} 
                                    className="bg-red-600 hover:bg-red-700" 
                                    disabled={hasUnsavedChanges}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit
                                </Button>
                            )}

                            {userRole === 'admin' && activeMarksheet?.status === 'submitted' && (
                                <Button 
                                    size="sm" 
                                    onClick={() => setShowApprovalDialog(true)} 
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Review
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredStudents.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap bg-gray-50">ID</TableHead>
                                        <TableHead className="whitespace-nowrap bg-gray-50">Name</TableHead>
                                        <TableHead className="whitespace-nowrap bg-gray-50">Class</TableHead>
                                        <TableHead className="whitespace-nowrap bg-gray-50">Stream</TableHead>
                                        {allSelectedSubjects.map((subject) => (
                                            <TableHead key={subject.key} className="whitespace-nowrap text-center bg-gray-50">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>{subject.key}</TooltipTrigger>
                                                        <TooltipContent>{subject.label}</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student._id} className="hover:bg-gray-50">
                                            <TableCell className="font-mono text-xs">
                                                {student.registration_id?.slice(-8) || student._id.slice(-8)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                                        {student.name?.first_name?.[0]}{student.name?.last_name?.[0]}
                                                    </div>
                                                    <span className="font-medium">
                                                        {student.name?.first_name} {student.name?.last_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.class?.name}</TableCell>
                                            <TableCell>{student.class?.stream || '-'}</TableCell>
                                            {allSelectedSubjects.map((subject) => {
                                                const isModified = modifiedCells.has(`${student._id}-${subject.key}`);
                                                const markValue = marks[student._id]?.[subject.key] ?? '';
                                                const hasExisting = activeMarksheet?.marks.find(m => m.studentId === student._id)?.marks?.[subject.key] !== undefined;
                                                const isDisabled = activeMarksheet?.status === 'approved' || activeMarksheet?.status === 'submitted';

                                                return (
                                                    <TableCell key={`${student._id}-${subject.key}`} className="p-1">
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.5"
                                                                value={markValue}
                                                                onChange={(e) => handleMarkChange(student._id, subject.key, e.target.value)}
                                                                disabled={isDisabled}
                                                                className={clsx(
                                                                    'h-10 text-center border-0 focus:ring-1 focus:ring-blue-500',
                                                                    isModified && 'bg-yellow-50 font-medium',
                                                                    hasExisting && !isModified && 'bg-green-50',
                                                                    isDisabled && 'bg-gray-100 cursor-not-allowed'
                                                                )}
                                                                placeholder="-"
                                                            />
                                                            {hasExisting && !isModified && !isDisabled && markValue !== '' && (
                                                                <BadgeCheck className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium text-gray-500 mt-4">No students found</p>
                            <p className="text-sm text-gray-400 mb-4">
                                No students match the selected class and stream
                            </p>
                            <Button variant="outline" onClick={() => setSelectionPhase(true)}>
                                Change Selection
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit for Approval Dialog */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit for Approval?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will lock the marksheet and submit it for admin review. You won't be able to make further changes after submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleSubmitForApproval} 
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Marksheet</DialogTitle>
                        <DialogDescription>
                            Approve or reject this marksheet submission.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Add comments (required for rejection)"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => handleApproval(false)} 
                            disabled={!approvalComment || isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Reject
                        </Button>
                        <Button 
                            onClick={() => handleApproval(true)} 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Activity Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Current Activity?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear your current session including selected exam, class, subjects, and any unsaved marks.
                            {hasUnsavedChanges && (
                                <p className="text-yellow-600 font-medium mt-2">
                                    You have {modifiedCount} unsaved change{modifiedCount > 1 ? 's' : ''} that will be lost.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearActivity}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Clear Activity
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default TeacherMarksCollectionSheet;