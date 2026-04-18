// TeacherStudentDataOrganizer.tsx
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
  EyeOff,
  Columns,
  Download,
  Upload,
  Users,
  School,
  BookOpen,
  Phone,
  User,
  Hash,
  MapPin,
  Calendar,
  Mail,
  UserCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  BadgeCheck,
  BadgeX,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import clsx from 'clsx';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI Components (reusing from your existing setup)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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

interface StudentResidence {
  region?: string;
  district?: string;
  village?: string;
}

interface StudentGuardian {
  guardian_id?: string;
  name?: string;
  relationship: string;
  phone?: string;
  email?: string;
}

interface StudentContact {
  phone?: string;
  email?: string;
  emergency_contact?: string;
}

interface Student {
  _id: string;
  registration_id?: string;
  name: StudentName;
  class: StudentClass;
  residence?: StudentResidence;
  guardian1?: StudentGuardian;
  guardian2?: StudentGuardian;
  contact?: StudentContact;
  gender: string;
  date_of_birth: string;
  religion: string;
  section: string;
  house?: string;
  photo?: string;
  stream?: string; // For backward compatibility
  phone?: string; // For backward compatibility
  guardianName?: string;
  guardianContact?: string;
}

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'tel' | 'email';
  options?: string[]; // For select fields
  getValue: (student: Student) => any;
  setValue: (student: Student, value: any) => Student;
}

interface ModifiedRow {
  id: string;
  original: Record<string, any>;
  changes: Record<string, any>;
  timestamp: number;
}

interface TeacherSession {
  class: string;
  stream?: string;
  selectedColumns: string[];
  modifiedRows: Record<string, ModifiedRow>;
  lastActive: number;
}

// Zustand Store with persistence
interface TeacherStore {
  session: TeacherSession | null;
  setSession: (session: TeacherSession | null) => void;
  updateModifiedRow: (studentId: string, changes: Record<string, any>, original: Record<string, any>) => void;
  clearModifiedRow: (studentId: string) => void;
  clearAllModified: () => void;
  clearSession: () => void;
}

const useTeacherStore = create<TeacherStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      updateModifiedRow: (studentId, changes, original) =>
        set((state) => {
          if (!state.session) return state;
          
          const modifiedRows = { ...state.session.modifiedRows };
          modifiedRows[studentId] = {
            id: studentId,
            original,
            changes,
            timestamp: Date.now(),
          };
          
          return {
            session: {
              ...state.session,
              modifiedRows,
              lastActive: Date.now(),
            },
          };
        }),
      clearModifiedRow: (studentId) =>
        set((state) => {
          if (!state.session) return state;
          const modifiedRows = { ...state.session.modifiedRows };
          delete modifiedRows[studentId];
          return {
            session: {
              ...state.session,
              modifiedRows,
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
              modifiedRows: {},
              lastActive: Date.now(),
            },
          };
        }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'teacher-storage',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Editable fields configuration
const EDITABLE_FIELDS: EditableField[] = [
  {
    key: 'stream',
    label: 'Stream',
    type: 'select',
    options: ['Apple', 'Banana', 'Cherry', 'Grapes', 'Orange', 'Pear', 'Strawberry'],
    getValue: (student) => student.class?.stream || student.stream || '',
    setValue: (student, value) => ({
      ...student,
      class: { ...student.class, stream: value },
      stream: value,
    }),
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'tel',
    getValue: (student) => student.contact?.phone || student.phone || '',
    setValue: (student, value) => ({
      ...student,
      contact: { ...student.contact, phone: value },
      phone: value,
    }),
  },
  {
    key: 'guardianName',
    label: 'Guardian Name',
    type: 'text',
    getValue: (student) => student.guardian1?.name || student.guardianName || '',
    setValue: (student, value) => {
      // Create a proper guardian object that satisfies the StudentGuardian type
      const guardian1: StudentGuardian = {
        ...student.guardian1,
        name: value,
        relationship: student.guardian1?.relationship || 'Parent', // Ensure relationship has a default
      };
      
      return {
        ...student,
        guardian1,
        guardianName: value,
      };
    },
  },
  {
    key: 'guardianContact',
    label: 'Guardian Contact',
    type: 'tel',
    getValue: (student) => student.guardian1?.phone || student.guardianContact || '',
    setValue: (student, value) => {
      const guardian1: StudentGuardian = {
        ...student.guardian1,
        phone: value,
        relationship: student.guardian1?.relationship || 'Parent', // Ensure relationship has a default
      };
      
      return {
        ...student,
        guardian1,
        guardianContact: value,
      };
    },
  },
  {
    key: 'guardianEmail',
    label: 'Guardian Email',
    type: 'email',
    getValue: (student) => student.guardian1?.email || '',
    setValue: (student, value) => {
      const guardian1: StudentGuardian = {
        ...student.guardian1,
        email: value,
        relationship: student.guardian1?.relationship || 'Parent', // Ensure relationship has a default
      };
      
      return {
        ...student,
        guardian1,
      };
    },
  },
  {
    key: 'residence',
    label: 'Village',
    type: 'text',
    getValue: (student) => student.residence?.village || '',
    setValue: (student, value) => ({
      ...student,
      residence: { ...student.residence, village: value },
    }),
  },
  {
    key: 'house',
    label: 'House',
    type: 'select',
    options: ['Day', 'Boarding', 'Red', 'Blue', 'Green', 'Yellow'],
    getValue: (student) => student.house || '',
    setValue: (student, value) => ({ ...student, house: value }),
  },
];

// Loading Skeleton for Selection Phase
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
          
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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

// Loading Skeleton for Table Phase
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
        </div>
      </div>
    </CardHeader>
    
    <CardContent>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-50">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="bg-gray-50">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              {[1, 2, 3].map((i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                <TableCell className="bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="bg-gray-50/50">
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                {[1, 2, 3].map((col) => (
                  <TableCell key={col}>
                    <Skeleton className="h-9 w-full" />
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
const TeacherStudentDataOrganizer: React.FC = () => {
  const router = useRouter();
  const { session, setSession, updateModifiedRow, clearModifiedRow, clearAllModified, clearSession } = useTeacherStore();
  
  // Local state
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [streams, setStreams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Selection phase state
  const [selectedClass, setSelectedClass] = useState<string>(session?.class || '');
  const [selectedStream, setSelectedStream] = useState<string>(session?.stream || 'all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(session?.selectedColumns || []);
  const [selectionPhase, setSelectionPhase] = useState<boolean>(!session);
  
  // Editing state
  const [editValues, setEditValues] = useState<Record<string, Record<string, any>>>({});
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });

  // Fetch students data
  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      try {
        
        // Replace with your actual API call
        const response = await fetch('https://api.mjsportal.xyz/students');
        const results = await response.json();
        setStudents(results.data);
        
        // Extract unique classes and streams
        const uniqueClasses = [...new Set(results.data.map((s: Student) => s.class?.name).filter(Boolean))];
        const uniqueStreams = [...new Set(results.data.map((s: Student) => s.class?.stream).filter(Boolean))];
        setClasses(uniqueClasses as string[]);
        setStreams(uniqueStreams as string[]);
      } catch (error) {
        toast.error('Failed to load students');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudents();
  }, []);

 

  // Restore session on mount
  useEffect(() => {
    if (session && !isLoading) {
      setSelectedClass(session.class);
      setSelectedStream(session.stream || 'all');
      setSelectedColumns(session.selectedColumns);
      setSelectionPhase(false);
      
      // Restore edit values from modified rows
      const restoredEditValues: Record<string, Record<string, any>> = {};
      Object.values(session.modifiedRows).forEach((modified) => {
        restoredEditValues[modified.id] = modified.changes;
      });
      setEditValues(restoredEditValues);
      
      // Mark modified cells
      const modifiedSet = new Set<string>();
      Object.values(session.modifiedRows).forEach((modified) => {
        Object.keys(modified.changes).forEach((field) => {
          modifiedSet.add(`${modified.id}-${field}`);
        });
      });
      setModifiedCells(modifiedSet);
    }
  }, [session, isLoading]);

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
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        if (sortConfig.key === 'name') {
          aVal = `${a.name?.first_name} ${a.name?.last_name}`;
          bVal = `${b.name?.first_name} ${b.name?.last_name}`;
        } else if (sortConfig.key === 'id') {
          aVal = a.registration_id || a._id;
          bVal = b.registration_id || b._id;
        } else {
          const field = EDITABLE_FIELDS.find(f => f.key === sortConfig.key);
          if (field) {
            aVal = field.getValue(a);
            bVal = field.getValue(b);
          }
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedClass, selectedStream, sortConfig, isLoading]);

  // Handle column selection
  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((c) => c !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(EDITABLE_FIELDS.map((f) => f.key));
  };

  const handleDeselectAllColumns = () => {
    setSelectedColumns([]);
  };

  // Handle generate table
  const handleGenerateTable = () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    
    setSelectionPhase(false);
    
    // Save session
    setSession({
      class: selectedClass,
      stream: selectedStream !== 'all' ? selectedStream : undefined,
      selectedColumns,
      modifiedRows: {},
      lastActive: Date.now(),
    });
    
    toast.success('Table generated successfully');
  };

  // Handle cell edit
  const handleCellEdit = (studentId: string, fieldKey: string, value: any) => {
    const field = EDITABLE_FIELDS.find((f) => f.key === fieldKey);
    if (!field) return;
    
    const student = students.find((s) => s._id === studentId);
    if (!student) return;
    
    // Update edit values
    setEditValues((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [fieldKey]: value,
      },
    }));
    
    // Mark cell as modified
    setModifiedCells((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${studentId}-${fieldKey}`);
      return newSet;
    });
    
    // Get original value
    const originalValue = field.getValue(student);
    
    // Update modified rows in store
    const changes = { [fieldKey]: value };
    const original = { [fieldKey]: originalValue };
    
    updateModifiedRow(studentId, changes, original);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!session || Object.keys(session.modifiedRows).length === 0) return;
    
    setIsSaving(true);
    
    try {
      // Prepare updates
      const updates = Object.values(session.modifiedRows).map((modified) => ({
        id: modified.id,
        ...modified.changes,
      }));
      
      // Simulate API call - replace with actual
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Send to API
      // const response = await fetch('/api/students/bulk-update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ updates }),
      // });
      
      // if (!response.ok) throw new Error('Failed to save changes');
      
      // Clear modified state
      clearAllModified();
      setModifiedCells(new Set());
      setEditValues({});
      
      toast.success('Changes saved successfully', {
        description: `${updates.length} student${updates.length > 1 ? 's' : ''} updated`,
      });
      
      // Refresh students data
      // const refreshedStudents = await fetch('/api/students').then(res => res.json());
      // setStudents(refreshedStudents);
    } catch (error) {
      toast.error('Failed to save changes', {
        description: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle clear current activity
  const handleClearActivity = () => {
    clearSession();
    setSelectedClass('');
    setSelectedStream('all');
    setSelectedColumns([]);
    setEditValues({});
    setModifiedCells(new Set());
    setSelectionPhase(true);
    setShowClearDialog(false);
    
    toast.success('Activity cleared');
  };

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return session && Object.keys(session.modifiedRows).length > 0;
  }, [session]);

  // Get modified count
  const modifiedCount = useMemo(() => {
    return session ? Object.keys(session.modifiedRows).length : 0;
  }, [session]);

  // Show loading skeleton while initial data loads
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
              title="Teacher Student Data Organizer"
              subtitle="Select class and columns to begin"
              Icon={Users}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">1. Select Class</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class *</label>
                  {classes.length > 0 ? (
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">No classes available</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream (Optional)</label>
                  <Select value={selectedStream} onValueChange={setSelectedStream}>
                    <SelectTrigger>
                      <SelectValue placeholder="All streams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      {streams.map((stream) => (
                        <SelectItem key={stream} value={stream}>
                          {stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Column Selection */}
            <div>
              <h3 className="text-lg font-medium mb-2">2. Select Columns to Update</h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose which fields you want to edit. Student Name and ID will always be visible.
              </p>
              
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleSelectAllColumns}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllColumns}>
                  Deselect All
                </Button>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {EDITABLE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`col-${field.key}`}
                      checked={selectedColumns.includes(field.key)}
                      onChange={() => handleColumnToggle(field.key)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`col-${field.key}`} className="text-sm">
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className='bg-success text-primary' onClick={handleGenerateTable} disabled={!selectedClass}>
            Generate Table
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render table phase
  return (
    <>
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SectionHeader
                  title="Teacher Student Data Organizer"
                  subtitle={`${selectedClass} ${selectedStream !== 'all' ? `- ${selectedStream}` : ''}`}
                  Icon={Users}
                />
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {modifiedCount} unsaved change{modifiedCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <span>{filteredStudents.length} students</span>
                {selectedColumns.length > 0 && (
                  <Badge variant="secondary" className='text-primary font-light'>
                    Editing: {selectedColumns.length} field{selectedColumns.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectionPhase(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Change Selection
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go back to class/column selection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearDialog(true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Activity
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear current session and start over</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className='bg-success'
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredStudents.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Fixed columns */}
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 whitespace-nowrap bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Student Name {renderSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 whitespace-nowrap bg-gray-50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Student ID {renderSortIcon('id')}
                      </div>
                    </TableHead>
                    
                    {/* Dynamic columns */}
                    {selectedColumns.map((columnKey) => {
                      const field = EDITABLE_FIELDS.find((f) => f.key === columnKey);
                      if (!field) return null;
                      
                      return (
                        <TableHead
                          key={columnKey}
                          className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                          onClick={() => handleSort(columnKey)}
                        >
                          <div className="flex items-center">
                            {field.label} {renderSortIcon(columnKey)}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id} className="hover:bg-gray-50">
                      {/* Fixed: Student Name */}
                      <TableCell className="font-medium bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {student.name?.first_name?.[0]}
                            {student.name?.last_name?.[0]}
                          </div>
                          <span>
                            {student.name?.first_name} {student.name?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      
                      {/* Fixed: Student ID */}
                      <TableCell className="bg-gray-50/50">
                        <Badge variant="outline" className="font-mono">
                          {student.registration_id?.slice(-8) || student._id.slice(-8)}
                        </Badge>
                      </TableCell>
                      
                      {/* Dynamic: Editable columns */}
                      {selectedColumns.map((columnKey) => {
                        const field = EDITABLE_FIELDS.find((f) => f.key === columnKey);
                        if (!field) return null;
                        
                        const isModified = modifiedCells.has(`${student._id}-${columnKey}`);
                        const currentValue = editValues[student._id]?.[columnKey] ?? field.getValue(student);
                        
                        return (
                          <TableCell
                            key={`${student._id}-${columnKey}`}
                            className={clsx(
                              'p-0',
                              isModified && 'bg-yellow-50'
                            )}
                          >
                            {field.type === 'select' ? (
                              <Select
                                value={currentValue || ''}
                                onValueChange={(value) =>
                                  handleCellEdit(student._id, columnKey, value)
                                }
                              >
                                <SelectTrigger className={clsx(
                                  'border-0 rounded-none h-full min-h-[48px] px-4 focus:ring-1 focus:ring-blue-500',
                                  isModified && 'bg-yellow-50'
                                )}>
                                  <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={field.type}
                                value={currentValue || ''}
                                onChange={(e) =>
                                  handleCellEdit(student._id, columnKey, e.target.value)
                                }
                                className={clsx(
                                  'border-0 rounded-none h-full min-h-[48px] px-4 focus:ring-1 focus:ring-blue-500',
                                  isModified && 'bg-yellow-50'
                                )}
                                placeholder={`Enter ${field.label}`}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <Users className="h-12 w-12 text-gray-300" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-500">No students found</p>
                <p className="text-sm text-gray-400">
                  No students match the selected class and stream
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectionPhase(true)}
                >
                  Change Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        {hasUnsavedChanges && (
          <CardFooter className="border-t bg-yellow-50/50 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                <span>
                  You have {modifiedCount} unsaved change{modifiedCount > 1 ? 's' : ''}. 
                  Click Save Changes to persist to database.
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAllModified}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard Changes
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Clear Activity Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Current Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current session including:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Selected class and stream</li>
                <li>Selected columns</li>
                {hasUnsavedChanges && (
                  <li className="text-yellow-600 font-medium">
                    {modifiedCount} unsaved change{modifiedCount > 1 ? 's' : ''} (will be lost)
                  </li>
                )}
              </ul>
              You'll need to start over from the selection phase.
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

export default TeacherStudentDataOrganizer;