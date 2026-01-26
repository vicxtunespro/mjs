"use client";
import { getStudents, deleteStudentRow } from '@/src/modules/students/students.services';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Trash2,
  Pencil,
  Download,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  User,
  X,
  FileText,
  FileSpreadsheet,
  MoreVertical,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Home,
  Users,
  UserPlus,
  Upload,
  EyeOff,
  EyeIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Bell,
  Share2,
  Printer,
  Copy,
  Star,
  Award,
  BookMarked,
  Activity,
  TrendingUp,
  Clock,
  Hash,
  Layers,
  Grid,
  List,
  Columns,
  Settings,
  HelpCircle,
  Info,
  Sparkles,
  FileX,
  Settings2
} from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Type definitions
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
  address?: string;
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
  club?: string[];
  photo?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  status?: 'active' | 'inactive' | 'graduated' | 'transferred';
  attendance_rate?: number;
  performance_score?: number;
  medical_notes?: string;
  allergies?: string[];
  notes?: string;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface Filters {
  class: string;
  religion: string;
  stream: string;
  region: string;
  district: string;
  section: string;
  gender: string;
  house: string;
  status: string;
  age_min: string;
  age_max: string;
  attendance_min: string;
  attendance_max: string;
  performance_min: string;
  performance_max: string;
  has_allergies: string;
  has_medical_notes: string;
  has_guardian: string;
}

interface ColumnVisibility {
  id: boolean;
  name: boolean;
  gender: boolean;
  class: boolean;
  section: boolean;
  location: boolean;
  age: boolean;
  status: boolean;
  attendance: boolean;
  performance: boolean;
  religion: boolean;
  house: boolean;
  guardians: boolean;
  contact: boolean;
  createdAt: boolean;
}

interface QuickActionsState {
  showInactive: boolean;
  showMedical: boolean;
  groupByClass: boolean;
  autoRefresh: boolean;
};


// Sample data with enhanced fields
// const studentsData: Student[] = [
//   {
//     "_id": "696e3877ce647cc38199e415",
//     "registration_id": "MJS-260119-165814-282",
//     "name": { "first_name": "VICTOR", "last_name": "NUWARIMPA", "other_names": "VICTOR NUWARIMPA" },
//     "class": { "name": "Level 5", "stream": "Apple" },
//     "residence": { "region": "Central", "district": "Wakiso", "village": "Kitemu", "address": "Plot 123, Kitemu Rd" },
//     "guardian1": { "guardian_id": "G260119100104576", "relationship": "Mother", "name": "Sarah Nuwariimpa", "phone": "+256-712-345678", "email": "sarah.n@email.com" },
//     "guardian2": { "relationship": "Father", "name": "James Nuwariimpa", "phone": "+256-701-234567" },
//     "contact": { "phone": "+256-712-345679", "email": "victor.n@student.edu" },
//     "gender": "Male",
//     "date_of_birth": "2012-05-15T00:00:00.000Z",
//     "religion": "Christianity",
//     "section": "Primary",
//     "house": "Day",
//     "club": ["Debate", "Football", "Music"],
//     "photo": "",
//     "createdAt": "2026-01-19T13:58:15.731Z",
//     "updatedAt": "2026-01-19T13:58:15.731Z",
//     "__v": 0,
//     "status": "active",
//     "attendance_rate": 94,
//     "performance_score": 85,
//     "medical_notes": "Asthma - requires inhaler",
//     "allergies": ["Peanuts", "Dust"],
//     "notes": "Excellent in mathematics"
//   },
//   {
//     "_id": "696dd6b305d518e945fa8ec4",
//     "registration_id": "MJS-260119-100106-240",
//     "name": { "first_name": "MATOVU", "last_name": "MURSHID" },
//     "class": { "name": "Pre B" },
//     "residence": { "region": "Central", "district": "Kampala", "village": "NABBINGO" },
//     "guardian1": { "guardian_id": "G260119100104576", "relationship": "Mother", "name": "Amina Murshid", "phone": "+256-712-345680" },
//     "guardian2": { "guardian_id": "G260119100106257", "relationship": "Father", "name": "Hassan Murshid" },
//     "gender": "Male",
//     "date_of_birth": "2020-01-21T00:00:00.000Z",
//     "religion": "Islam",
//     "section": "Pre-Primary",
//     "house": "",
//     "photo": "",
//     "createdAt": "2026-01-19T07:01:07.537Z",
//     "updatedAt": "2026-01-19T07:01:07.537Z",
//     "__v": 0,
//     "status": "active",
//     "attendance_rate": 98,
//     "performance_score": 92,
//     "allergies": ["None"],
//     "notes": "Quick learner, very attentive"
//   },
//   {
//     "_id": "695e4a29837e0668dab14d1a",
//     "registration_id": "MJS-260107-145728-139",
//     "name": { "first_name": "John", "last_name": "Dementa" },
//     "class": { "name": "Level 4" },
//     "residence": { "region": "East", "district": "Mbale", "village": "Jamika" },
//     "guardian1": { "guardian_id": "G260102134316924", "relationship": "Mother", "name": "Mary Dementa" },
//     "guardian2": { "relationship": "Father" },
//     "gender": "Female",
//     "date_of_birth": "2011-01-07T00:00:00.000Z",
//     "religion": "Christianity",
//     "section": "Primary",
//     "house": "",
//     "photo": "https://res.cloudinary.com/dzidperyt/image/upload/v1767787046/xr8621am0egexaycb8ws.jpg",
//     "createdAt": "2026-01-07T11:57:29.363Z",
//     "updatedAt": "2026-01-07T11:57:29.363Z",
//     "__v": 0,
//     "status": "active",
//     "attendance_rate": 89,
//     "performance_score": 78,
//     "medical_notes": "Wears glasses",
//     "allergies": ["None"],
//     "club": ["Art", "Drama"],
//     "notes": "Creative artist"
//   },
//   // Add more enhanced sample data as needed...
// ];

const EnhancedStudentTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [advancedSearch, setAdvancedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'compact'>('table');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    name: true,
    gender: true,
    class: true,
    section: true,
    location: true,
    age: false,
    status: true,
    attendance: true,
    performance: true,
    religion: false,
    house: true,
    guardians: false,
    contact: false,
    createdAt: false,
  });
  const [quickActions, setQuickActions] = useState<QuickActionsState>({
    showInactive: false,
    showMedical: true,
    groupByClass: false,
    autoRefresh: false,
  });

  // Fetch students Data
  
  useEffect(() => {
    let isMounted = true; // safety guard

    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const data = await getStudents();
        if (isMounted) {
          setStudentsData(data);
        }
      } catch (err) {
        if (isMounted) {
          throw new Error('Failed to load students');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

    // Advanced filter states
    const [filters, setFilters] = useState<Filters>({
      class: 'all',
      religion: 'all',
      stream: 'all',
      region: 'all',
      district: 'all',
      section: 'all',
      gender: 'all',
      house: 'all',
      status: 'all',
      age_min: '',
      age_max: '',
      attendance_min: '',
      attendance_max: '',
      performance_min: '',
      performance_max: '',
      has_allergies: 'all',
      has_medical_notes: 'all',
      has_guardian: 'all',
    });

    // Extract unique values for filters
    const uniqueValues = useMemo(() => {
      const classes = [...new Set(studentsData.map(s => s.class?.name).filter(Boolean))] as string[];
      const religions = [...new Set(studentsData.map(s => s.religion).filter(Boolean))] as string[];
      const streams = [...new Set(studentsData.map(s => s.class?.stream).filter(Boolean))] as string[];
      const regions = [...new Set(studentsData.map(s => s.residence?.region).filter(Boolean))] as string[];
      const districts = [...new Set(studentsData.map(s => s.residence?.district).filter(Boolean))] as string[];
      const sections = [...new Set(studentsData.map(s => s.section).filter(Boolean))] as string[];
      const genders = [...new Set(studentsData.map(s => s.gender).filter(Boolean))] as string[];
      const houses = [...new Set(studentsData.map(s => s.house).filter(Boolean))] as string[];
      const statuses = ['active', 'inactive', 'graduated', 'transferred'];
      const clubs = [...new Set(studentsData.flatMap(s => s.club || []).filter(Boolean))] as string[];

      return {
        classes: classes.sort(),
        religions: religions.sort(),
        streams: streams.sort(),
        regions: regions.sort(),
        districts: districts.sort(),
        sections: sections.sort(),
        genders: genders.sort(),
        houses: houses.sort(),
        statuses,
        clubs,
      };
    }, []);

    // Calculate student age
    const calculateAge = (dateOfBirth: string): number => {
      try {
        return differenceInYears(new Date(), parseISO(dateOfBirth));
      } catch {
        return 0;
      }
    };

    // Filter and sort data with advanced filters
    const filteredData = useMemo(() => {
      let result = studentsData.filter((student) => {
        // Basic search
        const basicSearch = searchTerm.toLowerCase();
        const fullName = `${student.name?.first_name} ${student.name?.last_name} ${student.name?.other_names || ''}`.toLowerCase();
        const registrationMatch = student.registration_id?.toLowerCase().includes(basicSearch) || false;
        const nameMatch = fullName.includes(basicSearch);
        const villageMatch = student.residence?.village?.toLowerCase().includes(basicSearch) || false;
        const guardianMatch = student.guardian1?.name?.toLowerCase().includes(basicSearch) || false;

        const basicSearchMatch = registrationMatch || nameMatch || villageMatch || guardianMatch;

        // Advanced search
        let advancedSearchMatch = true;
        if (advancedSearch) {
          const advSearch = advancedSearch.toLowerCase();
          const allText = `
          ${student.name?.first_name} ${student.name?.last_name} ${student.name?.other_names || ''}
          ${student.registration_id}
          ${student.residence?.region} ${student.residence?.district} ${student.residence?.village}
          ${student.guardian1?.name} ${student.guardian2?.name}
          ${student.contact?.email} ${student.contact?.phone}
          ${student.medical_notes}
          ${student.notes}
          ${student.club?.join(' ')}
        `.toLowerCase();
          advancedSearchMatch = allText.includes(advSearch);
        }

        // Filter matches
        const classMatch = filters.class === 'all' || student.class?.name === filters.class;
        const religionMatch = filters.religion === 'all' || student.religion === filters.religion;
        const streamMatch = filters.stream === 'all' || student.class?.stream === filters.stream;
        const regionMatch = filters.region === 'all' || student.residence?.region === filters.region;
        const districtMatch = filters.district === 'all' || student.residence?.district === filters.district;
        const sectionMatch = filters.section === 'all' || student.section === filters.section;
        const genderMatch = filters.gender === 'all' || student.gender === filters.gender;
        const houseMatch = filters.house === 'all' || student.house === filters.house;
        const statusMatch = filters.status === 'all' || student.status === filters.status;

        // Age filter
        const age = calculateAge(student.date_of_birth);
        const ageMin = filters.age_min ? parseInt(filters.age_min) : 0;
        const ageMax = filters.age_max ? parseInt(filters.age_max) : 100;
        const ageMatch = age >= ageMin && age <= ageMax;

        // Attendance filter
        const attendance = student.attendance_rate || 0;
        const attendanceMin = filters.attendance_min ? parseInt(filters.attendance_min) : 0;
        const attendanceMax = filters.attendance_max ? parseInt(filters.attendance_max) : 100;
        const attendanceMatch = attendance >= attendanceMin && attendance <= attendanceMax;

        // Performance filter
        const performance = student.performance_score || 0;
        const performanceMin = filters.performance_min ? parseInt(filters.performance_min) : 0;
        const performanceMax = filters.performance_max ? parseInt(filters.performance_max) : 100;
        const performanceMatch = performance >= performanceMin && performance <= performanceMax;

        // Boolean filters
        const allergiesMatch = filters.has_allergies === 'all' ||
          (filters.has_allergies === 'yes' && student.allergies && student.allergies.length > 0 && student.allergies[0] !== 'None') ||
          (filters.has_allergies === 'no' && (!student.allergies || student.allergies.length === 0 || student.allergies[0] === 'None'));

        const medicalNotesMatch = filters.has_medical_notes === 'all' ||
          (filters.has_medical_notes === 'yes' && student.medical_notes) ||
          (filters.has_medical_notes === 'no' && !student.medical_notes);

        const guardianMatchFilter = filters.has_guardian === 'all' ||
          (filters.has_guardian === 'yes' && student.guardian1) ||
          (filters.has_guardian === 'no' && !student.guardian1);

        // Quick action filters
        const inactiveFilter = !quickActions.showInactive || student.status !== 'inactive';
        const medicalFilter = quickActions.showMedical || !student.medical_notes;

        return basicSearchMatch && advancedSearchMatch && classMatch && religionMatch &&
          streamMatch && regionMatch && districtMatch && sectionMatch && genderMatch &&
          houseMatch && statusMatch && ageMatch && attendanceMatch && performanceMatch &&
          allergiesMatch && medicalNotesMatch && guardianMatchFilter && inactiveFilter && medicalFilter;
      });

      // Group by class if enabled
      if (quickActions.groupByClass) {
        result.sort((a, b) => {
          if (a.class?.name < b.class?.name) return -1;
          if (a.class?.name > b.class?.name) return 1;
          return 0;
        });
      }

      // Apply sorting
      if (sortConfig.key) {
        result.sort((a, b) => {
          let aVal: any, bVal: any;

          if (sortConfig.key === 'age') {
            aVal = calculateAge(a.date_of_birth);
            bVal = calculateAge(b.date_of_birth);
          } else if (sortConfig.key === 'attendance_rate') {
            aVal = a.attendance_rate || 0;
            bVal = b.attendance_rate || 0;
          } else if (sortConfig.key === 'performance_score') {
            aVal = a.performance_score || 0;
            bVal = b.performance_score || 0;
          } else if (sortConfig.key && sortConfig.key.includes('.')) {
            const keys = sortConfig.key.split('.');
            aVal = keys.reduce((obj: any, key) => obj?.[key], a);
            bVal = keys.reduce((obj: any, key) => obj?.[key], b);
          } else if (sortConfig.key) {
            aVal = a[sortConfig.key as keyof Student];
            bVal = b[sortConfig.key as keyof Student];
          }

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return result;
    }, [searchTerm, advancedSearch, filters, sortConfig, quickActions, studentsData]);

    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Stats
    const stats = useMemo(() => {
      const total = filteredData.length;
      const active = filteredData.filter(s => s.status === 'active').length;
      const averageAttendance = filteredData.reduce((acc, s) => acc + (s.attendance_rate || 0), 0) / total || 0;
      const averagePerformance = filteredData.reduce((acc, s) => acc + (s.performance_score || 0), 0) / total || 0;
      const withMedicalNotes = filteredData.filter(s => s.medical_notes).length;
      const withAllergies = filteredData.filter(s => s.allergies && s.allergies.length > 0 && s.allergies[0] !== 'None').length;

      return {
        total,
        active,
        averageAttendance: Math.round(averageAttendance),
        averagePerformance: Math.round(averagePerformance),
        withMedicalNotes,
        withAllergies,
      };
    }, [filteredData]);

    const handleSort = (key: string) => {
      setSortConfig({
        key,
        direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    };

    const handleFilterChange = (filterKey: keyof Filters, value: string) => {
      setFilters(prev => ({ ...prev, [filterKey]: value }));
      setPage(0);
    };

    const clearAllFilters = () => {
      setFilters({
        class: 'all',
        religion: 'all',
        stream: 'all',
        region: 'all',
        district: 'all',
        section: 'all',
        gender: 'all',
        house: 'all',
        status: 'all',
        age_min: '',
        age_max: '',
        attendance_min: '',
        attendance_max: '',
        performance_min: '',
        performance_max: '',
        has_allergies: 'all',
        has_medical_notes: 'all',
        has_guardian: 'all',
      });
      setSearchTerm('');
      setAdvancedSearch('');
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== 'all' && v !== '').length;

    // Export functions
    const exportToCSV = () => {
      const headers = ['Registration ID', 'First Name', 'Last Name', 'Gender', 'Age', 'Class', 'Stream', 'Section', 'Status', 'Attendance %', 'Performance Score', 'Religion', 'Region', 'District', 'Village', 'House', 'Guardian 1', 'Guardian 1 Phone', 'Allergies', 'Medical Notes'];
      const rows = filteredData.map(s => [
        s.registration_id || '',
        s.name?.first_name || '',
        s.name?.last_name || '',
        s.gender || '',
        calculateAge(s.date_of_birth),
        s.class?.name || '',
        s.class?.stream || '',
        s.section || '',
        s.status || '',
        s.attendance_rate || '',
        s.performance_score || '',
        s.religion || '',
        s.residence?.region || '',
        s.residence?.district || '',
        s.residence?.village || '',
        s.house || '',
        s.guardian1?.name || '',
        s.guardian1?.phone || '',
        s.allergies?.join(', ') || '',
        s.medical_notes || ''
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      toast.success('CSV exported successfully!', {
        description: `${filteredData.length} records exported`,
      });
    };

    const exportToPDF = () => {
      const doc = new jsPDF('landscape');

      // Add header
      doc.setFontSize(20);
      doc.text('Student Management Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);
      doc.text(`Total Students: ${filteredData.length}`, 14, 28);
      doc.text(`Active: ${stats.active} | Avg Attendance: ${stats.averageAttendance}% | Avg Performance: ${stats.averagePerformance}%`, 14, 34);

      // Prepare table data
      const tableData = filteredData.map(student => [
        student.registration_id || '',
        `${student.name?.first_name} ${student.name?.last_name}`,
        student.gender,
        calculateAge(student.date_of_birth),
        student.class?.name,
        student.class?.stream || '',
        student.section,
        student.status || 'active',
        `${student.attendance_rate || 0}%`,
        student.performance_score || 0,
        student.residence?.district || '',
        student.house || ''
      ]);

      // Add table
      autoTable(doc, {
        head: [['ID', 'Name', 'Gender', 'Age', 'Class', 'Stream', 'Section', 'Status', 'Attendance', 'Performance', 'District', 'House']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { top: 40 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15 },
          3: { cellWidth: 10 },
          4: { cellWidth: 20 },
          5: { cellWidth: 15 },
          6: { cellWidth: 20 },
          7: { cellWidth: 15 },
          8: { cellWidth: 20 },
          9: { cellWidth: 20 },
          10: { cellWidth: 25 },
          11: { cellWidth: 15 },
        },
      });

      // Save PDF
      doc.save(`students_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);

      toast.success('PDF exported successfully!', {
        description: 'Report downloaded',
      });
    };

    // Student selection
    const toggleStudentSelection = (studentId: string) => {
      const newSelected = new Set(selectedStudents);
      if (newSelected.has(studentId)) {
        newSelected.delete(studentId);
      } else {
        newSelected.add(studentId);
      }
      setSelectedStudents(newSelected);
    };

    const selectAllStudents = () => {
      if (selectedStudents.size === paginatedData.length) {
        setSelectedStudents(new Set());
      } else {
        setSelectedStudents(new Set(paginatedData.map(s => s._id)));
      }
    };

    // Bulk actions
    const handleBulkAction = (action: string) => {
      if (selectedStudents.size === 0) {
        toast.warning('No students selected', {
          description: 'Please select students to perform this action',
        });
        return;
      }

      switch (action) {
        case 'export':
          toast.info('Bulk export initiated', {
            description: `Exporting ${selectedStudents.size} students`,
          });
          break;
        case 'email':
          toast.info('Bulk email initiated', {
            description: `Preparing email for ${selectedStudents.size} guardians`,
          });
          break;
        case 'sms':
          toast.info('Bulk SMS initiated', {
            description: `Sending SMS to ${selectedStudents.size} guardians`,
          });
          break;
        case 'inactive':
          toast.info('Marking students as inactive', {
            description: `Updating ${selectedStudents.size} students`,
          });
          break;
        case 'print':
          window.print();
          break;
      }
    };

    //Actions
    const viewProfile = (id: string) =>{
      router.push(`/admin/students/${id}`);
    }

    // Render helpers
    const renderSortIcon = (key: string) => {
      if (sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const getStatusColor = (status: string = 'active') => {
      const colors: Record<string, string> = {
        'active': 'bg-green-100 text-green-800 hover:bg-green-100',
        'inactive': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        'graduated': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        'transferred': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      };
      return colors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    };

    const getPerformanceColor = (score: number) => {
      if (score >= 90) return 'text-green-600 bg-green-50';
      if (score >= 70) return 'text-yellow-600 bg-yellow-50';
      if (score >= 50) return 'text-orange-600 bg-orange-50';
      return 'text-red-600 bg-red-50';
    };

    const getAttendanceColor = (rate: number) => {
      if (rate >= 95) return 'text-green-600';
      if (rate >= 85) return 'text-yellow-600';
      if (rate >= 75) return 'text-orange-600';
      return 'text-red-600';
    };

    const handleDelete = (student: Student) => {
      setSelectedStudent(student);
      setDeleteDialogOpen(true);
    };

    const confirmDelete = async (id: string) => {

      try {
        console.log(id);
        await deleteStudentRow(id);
        toast.success('Student deleted successfully', {
          description: `${selectedStudent?.name?.first_name} ${selectedStudent?.name?.last_name} has been removed`,
        });
        setDeleteDialogOpen(false);
        setSelectedStudent(null);
      } catch (error) {
        toast.error('Student deleted successfully', {
          description: `${selectedStudent?.name?.first_name} ${selectedStudent?.name?.last_name} could'nt not be deleted`,
        });
      }
    };

    // Mobile responsive helpers
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl md:text-3xl">Student Management</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage all student records, attendance, and performance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription className="flex flex-col md:flex-row md:items-center gap-2">
                  <span>Total Students: {filteredData.length}</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="w-fit">
                      {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {selectedStudents.size > 0 && (
                    <Badge variant="outline" className="w-fit">
                      {selectedStudents.size} selected
                    </Badge>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedStudents.size > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Bulk Actions ({selectedStudents.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Selected Students</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('email')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email Guardians
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('sms')}>
                        <Phone className="h-4 w-4 mr-2" />
                        SMS Guardians
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('print')}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Reports
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction('inactive')}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark as Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

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
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToPDF}>
                      <FileText className="h-4 w-4 mr-2 text-red-600" />
                      Export as PDF Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Current View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" className="md:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filters & Settings</SheetTitle>
                      <SheetDescription>
                        Filter and customize the student table view
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <FilterPanel
                        filters={filters}
                        uniqueValues={uniqueValues}
                        handleFilterChange={handleFilterChange}
                        clearAllFilters={clearAllFilters}
                        quickActions={quickActions}
                        setQuickActions={setQuickActions}
                        columnVisibility={columnVisibility}
                        setColumnVisibility={setColumnVisibility}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <Card className="col-span-2 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Students</span>
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-green-600">
                      {stats.active} active ({Math.round((stats.active / stats.total) * 100)}%)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Avg Attendance</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
                    <Progress value={stats.averageAttendance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Avg Performance</span>
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.averagePerformance}%</div>
                    <Progress value={stats.averagePerformance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Medical Notes</span>
                      <Activity className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.withMedicalNotes}</div>
                    <div className="text-xs text-gray-500">
                      {stats.withAllergies} with allergies
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-2">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Quick Actions</span>
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={quickActions.showMedical}
                          onCheckedChange={(checked) => setQuickActions(prev => ({ ...prev, showMedical: checked }))}
                          id="show-medical"
                        />
                        <Label htmlFor="show-medical" className="text-xs">Show Medical</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={quickActions.groupByClass}
                          onCheckedChange={(checked) => setQuickActions(prev => ({ ...prev, groupByClass: checked }))}
                          id="group-by-class"
                        />
                        <Label htmlFor="group-by-class" className="text-xs">Group by Class</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {/* Search and Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, ID, village, guardian..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Search className="h-3 w-3" />
                          Advanced Search
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="advanced-search">Search across all fields</Label>
                            <Textarea
                              id="advanced-search"
                              placeholder="Search in all student fields..."
                              value={advancedSearch}
                              onChange={(e) => setAdvancedSearch(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <Button size="sm" onClick={() => setAdvancedSearch('')} variant="ghost">
                            Clear advanced search
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <span className="text-xs text-gray-500">
                      {filteredData.length} of {studentsData.length} students match
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="hidden md:flex"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {viewMode === 'table' ? <List className="h-4 w-4 mr-2" /> :
                          viewMode === 'grid' ? <Grid className="h-4 w-4 mr-2" /> :
                            <Columns className="h-4 w-4 mr-2" />}
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                        <DropdownMenuRadioItem value="table">
                          <List className="h-4 w-4 mr-2" />
                          Table View
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="grid">
                          <Grid className="h-4 w-4 mr-2" />
                          Grid View
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="compact">
                          <Columns className="h-4 w-4 mr-2" />
                          Compact View
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Columns</DropdownMenuLabel>
                      {Object.entries(columnVisibility).map(([key, visible]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={visible}
                          onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, [key]: !!checked }))}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Filters Panel for Desktop */}
              {showFilters && !isMobile && (
                <FilterPanel
                  filters={filters}
                  uniqueValues={uniqueValues}
                  handleFilterChange={handleFilterChange}
                  clearAllFilters={clearAllFilters}
                  quickActions={quickActions}
                  setQuickActions={setQuickActions}
                  columnVisibility={columnVisibility}
                  setColumnVisibility={setColumnVisibility}
                />
              )}

              {/* Table/Grid View */}
              {viewMode === 'table' ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedStudents.size === paginatedData.length && paginatedData.length > 0}
                            onChange={selectAllStudents}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        {columnVisibility.id && (
                          <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort('registration_id')}
                          >
                            <div className="flex items-center gap-1">
                              ID {renderSortIcon('registration_id')}
                            </div>
                          </TableHead>
                        )}
                        {columnVisibility.name && (
                          <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort('name.first_name')}
                          >
                            <div className="flex items-center gap-1">
                              Name {renderSortIcon('name.first_name')}
                            </div>
                          </TableHead>
                        )}
                        {columnVisibility.gender && <TableHead className="whitespace-nowrap">Gender</TableHead>}
                        {columnVisibility.class && <TableHead className="whitespace-nowrap">Class/Stream</TableHead>}
                        {columnVisibility.section && <TableHead className="whitespace-nowrap">Section</TableHead>}
                        {columnVisibility.age && <TableHead className="whitespace-nowrap">Age</TableHead>}
                        {columnVisibility.status && (
                          <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              Status {renderSortIcon('status')}
                            </div>
                          </TableHead>
                        )}
                        {columnVisibility.attendance && (
                          <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort('attendance_rate')}
                          >
                            <div className="flex items-center gap-1">
                              Attendance {renderSortIcon('attendance_rate')}
                            </div>
                          </TableHead>
                        )}
                        {columnVisibility.performance && (
                          <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort('performance_score')}
                          >
                            <div className="flex items-center gap-1">
                              Performance {renderSortIcon('performance_score')}
                            </div>
                          </TableHead>
                        )}
                        {columnVisibility.location && <TableHead className="whitespace-nowrap">Location</TableHead>}
                        {columnVisibility.house && <TableHead className="whitespace-nowrap">House</TableHead>}
                        <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((student) => (
                          <TableRow key={student._id} className="group hover:bg-gray-50">
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(student._id)}
                                onChange={() => toggleStudentSelection(student._id)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            {columnVisibility.id && (
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="font-mono cursor-help">
                                        {student.registration_id?.slice(0, 8)}...
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{student.registration_id}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            {columnVisibility.name && (
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.photo} />
                                    <AvatarFallback className="bg-gray-100">
                                      {student.name?.first_name?.[0]}{student.name?.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">
                                      {student.name?.first_name} {student.name?.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {student.religion}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.gender && (
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    student.gender === 'Male'
                                      ? 'border-blue-200 text-blue-700 bg-blue-50'
                                      : 'border-pink-200 text-pink-700 bg-pink-50'
                                  }
                                >
                                  {student.gender}
                                </Badge>
                              </TableCell>
                            )}
                            {columnVisibility.class && (
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{student.class?.name}</div>
                                  {student.class?.stream && (
                                    <Badge variant="outline" className="text-xs">
                                      {student.class.stream}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.section && (
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  {student.section}
                                </Badge>
                              </TableCell>
                            )}
                            {columnVisibility.age && (
                              <TableCell>
                                <div className="font-medium">{calculateAge(student.date_of_birth)}</div>
                              </TableCell>
                            )}
                            {columnVisibility.status && (
                              <TableCell>
                                <Badge className={getStatusColor(student.status)}>
                                  {student.status || 'active'}
                                </Badge>
                              </TableCell>
                            )}
                            {columnVisibility.attendance && (
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-medium ${getAttendanceColor(student.attendance_rate || 0)}`}>
                                          {student.attendance_rate || 0}%
                                        </span>
                                        <Progress value={student.attendance_rate || 0} className="w-16 h-2" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Attendance rate: {student.attendance_rate || 0}%</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            {columnVisibility.performance && (
                              <TableCell>
                                <div className={`px-2 py-1 rounded text-center font-medium ${getPerformanceColor(student.performance_score || 0)}`}>
                                  {student.performance_score || 0}%
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.location && (
                              <TableCell>
                                <div className="space-y-1 min-w-0">
                                  <div className="font-medium truncate">{student.residence?.district}</div>
                                  <div className="text-xs text-gray-500 truncate">{student.residence?.region}</div>
                                </div>
                              </TableCell>
                            )}
                            {columnVisibility.house && (
                              <TableCell>
                                {student.house ? (
                                  <Badge variant="outline">{student.house}</Badge>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Mail className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Email Guardian</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => viewProfile(student._id)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Full Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/admin/students/edit/${student._id}`)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Contact Guardian
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Calendar className="h-4 w-4 mr-2" />
                                      View Attendance
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <BookOpen className="h-4 w-4 mr-2" />
                                      Academic Record
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(student)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Student
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={Object.values(columnVisibility).filter(v => v).length + 2} className="h-96 text-center">
                            
                              {isLoading ?(
                                <div className="flex flex-col items-center justify-center gap-4">
                                  <Settings className="h-12 w-12 text-gray-300 animate-spin" />
                                  <div>
                                    <p className="text-lg font-medium text-gray-500">Loading Students Data</p>
                                    <p className="text-sm text-gray-400">
                                      Just a moment please
                                    </p>
                                  </div>
                                </div>
                              ): 
                              (
                              <div className="flex flex-col items-center justify-center gap-4">
                                <AlertCircle className="h-12 w-12 text-gray-300 animate-pluse" />
                                <div>
                                  <p className="text-lg font-medium text-gray-500">No students found</p>
                                  <p className="text-sm text-gray-400">
                                    Try adjusting your search or filter parameters
                                  </p>
                                  <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={clearAllFilters}
                                  >
                                    Clear All Filters
                                  </Button>
                                </div>
                              </div>
                              )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedData.map((student) => (
                    <Card key={student._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.photo} />
                            <AvatarFallback className="bg-gray-100">
                              {student.name?.first_name?.[0]}{student.name?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status || 'active'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold">
                            {student.name?.first_name} {student.name?.last_name}
                          </h4>
                          <div className="text-sm text-gray-500">
                            {student.class?.name} • {student.section}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Attendance:</span>
                            <span className={`font-medium ${getAttendanceColor(student.attendance_rate || 0)}`}>
                              {student.attendance_rate || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Performance:</span>
                            <span className={`font-medium ${getPerformanceColor(student.performance_score || 0)}`}>
                              {student.performance_score || 0}%
                            </span>
                          </div>
                          {student.guardian1 && (
                            <div className="text-xs text-gray-500 truncate">
                              Guardian: {student.guardian1.name}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Compact View
                <div className="space-y-2">
                  {paginatedData.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.photo} />
                          <AvatarFallback className="bg-gray-100 text-xs">
                            {student.name?.first_name?.[0]}{student.name?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {student.name?.first_name} {student.name?.last_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {student.class?.name} • {student.section}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getAttendanceColor(student.attendance_rate || 0)}`}>
                            {student.attendance_rate || 0}%
                          </div>
                          <div className="text-xs text-gray-500">Attendance</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 whitespace-nowrap">
                      Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min((page + 1) * rowsPerPage, filteredData.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredData.length}</span> results
                    </span>

                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(parseInt(value));
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="10 per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 0) setPage(page - 1);
                          }}
                          className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (page <= 2) {
                          pageNum = i;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                              isActive={page === pageNum}
                            >
                              {pageNum + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages - 1) setPage(page + 1);
                          }}
                          className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6">
            <div className="text-sm text-gray-500">
              Data last updated: {format(new Date(), 'PPPpp')}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {clearAllFilters(); window.location.reload()}}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{' '}
                <span className="font-semibold">
                  {selectedStudent?.name?.first_name} {selectedStudent?.name?.last_name}
                </span>{' '}
                from the student records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDelete(selectedStudent?._id ?? '')}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  // Filter Panel Component
  const FilterPanel = ({
    filters,
    uniqueValues,
    handleFilterChange,
    clearAllFilters,
    quickActions,
    setQuickActions,
    columnVisibility,
    setColumnVisibility
  }: {
    filters: Filters;
    uniqueValues: any;
    handleFilterChange: (key: keyof Filters, value: string) => void;
    clearAllFilters: () => void;
    quickActions: any;
    setQuickActions: React.Dispatch<React.SetStateAction<any>>;
    columnVisibility: ColumnVisibility;
    setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  }) => {
    return (
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="columns">Columns</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select
                    value={filters.class}
                    onValueChange={(value) => handleFilterChange('class', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueValues.classes.map((c: string) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <Select
                    value={filters.section}
                    onValueChange={(value) => handleFilterChange('section', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {uniqueValues.sections.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={filters.gender}
                    onValueChange={(value) => handleFilterChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      {uniqueValues.genders.map((g: string) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {uniqueValues.statuses.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.age_min}
                      onChange={(e) => handleFilterChange('age_min', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.age_max}
                      onChange={(e) => handleFilterChange('age_max', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendance %</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.attendance_min}
                      onChange={(e) => handleFilterChange('attendance_min', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.attendance_max}
                      onChange={(e) => handleFilterChange('attendance_max', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Performance %</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.performance_min}
                      onChange={(e) => handleFilterChange('performance_min', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.performance_max}
                      onChange={(e) => handleFilterChange('performance_max', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Has Medical Notes</label>
                  <Select
                    value={filters.has_medical_notes}
                    onValueChange={(value) => handleFilterChange('has_medical_notes', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Has Allergies</label>
                  <Select
                    value={filters.has_allergies}
                    onValueChange={(value) => handleFilterChange('has_allergies', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Has Guardian</label>
                  <Select
                    value={filters.has_guardian}
                    onValueChange={(value) => handleFilterChange('has_guardian', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="columns" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(columnVisibility).map(([key, visible]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      checked={visible}
                      onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, [key]: checked }))}
                      id={`column-${key}`}
                    />
                    <Label htmlFor={`column-${key}`} className="text-sm">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColumnVisibility({
                    id: true,
                    name: true,
                    gender: true,
                    class: true,
                    section: true,
                    location: true,
                    age: false,
                    status: true,
                    attendance: true,
                    performance: true,
                    religion: false,
                    house: true,
                    guardians: false,
                    contact: false,
                    createdAt: false,
                  })}
                >
                  Reset Columns
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColumnVisibility({
                    id: true,
                    name: true,
                    gender: true,
                    class: true,
                    section: true,
                    location: true,
                    age: true,
                    status: true,
                    attendance: true,
                    performance: true,
                    religion: true,
                    house: true,
                    guardians: true,
                    contact: true,
                    createdAt: true,
                  })}
                >
                  Show All
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={quickActions.showInactive}
                  onCheckedChange={(checked) => setQuickActions((prev: typeof quickActions) => ({ ...prev, showInactive: checked }))}
                  id="show-inactive"
                />
                <Label htmlFor="show-inactive" className="text-sm">Show Inactive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={quickActions.autoRefresh}
                  onCheckedChange={(checked) => setQuickActions((prev: typeof quickActions) => ({ ...prev, autoRefresh: checked }))}
                  id="auto-refresh"
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Save filter preset
                  toast.success('Filters saved as preset');
                }}
              >
                Save Preset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  export default EnhancedStudentTable;