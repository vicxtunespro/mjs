"use client";
import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from "@/components/ui/dialog";
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
} from "@/components/ui/pagination";

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
}

interface StudentGuardian {
  guardian_id?: string;
  relationship: string;
}

interface Student {
  _id: string;
  registration_id?: string;
  name: StudentName;
  class: StudentClass;
  residence?: StudentResidence;
  guardian1?: StudentGuardian;
  guardian2?: StudentGuardian;
  gender: string;
  date_of_birth: string;
  religion: string;
  section: string;
  house?: string;
  club?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
}

interface UniqueValues {
  classes: string[];
  religions: string[];
  streams: string[];
  regions: string[];
  districts: string[];
  sections: string[];
  genders: string[];
  houses: string[];
}

// Sample data from your JSON
const studentsData: Student[] = [
  {"name":{"first_name":"VICTOR","last_name":"NUWARIMPA","other_names":"VICTOR NUWARIMPA"},"class":{"name":"Level 5","stream":"Apple"},"residence":{"region":"Central","district":"Wakiso","village":"Kitemu"},"guardian1":{"guardian_id":"G260119100104576","relationship":"Mother"},"guardian2":{"relationship":"Father"},"_id":"696e3877ce647cc38199e415","registration_id":"MJS-260119-165814-282","gender":"Male","date_of_birth":"2026-01-19T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"Day","photo":"","createdAt":"2026-01-19T13:58:15.731Z","updatedAt":"2026-01-19T13:58:15.731Z","__v":0},
  {"name":{"first_name":"MATOVU","last_name":"MURSHID"},"class":{"name":"Pre B"},"residence":{"region":"Central","district":"Kampala","village":"NABBINGO"},"guardian1":{"guardian_id":"G260119100104576","relationship":"Mother"},"guardian2":{"guardian_id":"G260119100106257","relationship":"Father"},"_id":"696dd6b305d518e945fa8ec4","registration_id":"MJS-260119-100106-240","gender":"Male","date_of_birth":"2021-01-21T00:00:00.000Z","religion":"Islam","section":"Pre-Primary","house":"","photo":"","createdAt":"2026-01-19T07:01:07.537Z","updatedAt":"2026-01-19T07:01:07.537Z","__v":0},
  {"name":{"first_name":"John","last_name":"Dementa"},"class":{"name":"Level 4"},"residence":{"region":"East","district":"Mbale","village":"Jamika"},"guardian1":{"guardian_id":"G260102134316924","relationship":"Mother"},"guardian2":{"relationship":"Father"},"_id":"695e4a29837e0668dab14d1a","registration_id":"MJS-260107-145728-139","gender":"Female","date_of_birth":"2011-01-07T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"","photo":"https://res.cloudinary.com/dzidperyt/image/upload/v1767787046/xr8621am0egexaycb8ws.jpg","createdAt":"2026-01-07T11:57:29.363Z","updatedAt":"2026-01-07T11:57:29.363Z","__v":0},
  {"name":{"first_name":"Nantale","last_name":"John"},"class":{"name":"Pre C"},"residence":{"region":"Central","district":"Kampala","village":"Kitemu"},"guardian1":{"guardian_id":"G251231111919692","relationship":"Father"},"guardian2":{"relationship":""},"_id":"695d30f417717dd6d74bde63","registration_id":"MJS-260106-185737-259","gender":"Male","date_of_birth":"2026-01-06T00:00:00.000Z","religion":"Christianity","section":"Pre-Primary","house":"","photo":"","createdAt":"2026-01-06T15:57:40.550Z","updatedAt":"2026-01-06T15:57:40.550Z","__v":0},
  {"name":{"first_name":"VICTOR","last_name":"NUWARIMPA","other_names":"VICTOR NUWARIMPA"},"class":{"name":"Toddler"},"guardian1":{"guardian_id":"G251231111919692","relationship":"Father"},"guardian2":{"relationship":""},"_id":"695d2cab5b5b28e5527d3dce","registration_id":"MJS-260106-183920-188","gender":"Male","date_of_birth":"2026-01-06T00:00:00.000Z","religion":"Christianity","section":"Day Care","house":"","club":"Swimming","photo":"","createdAt":"2026-01-06T15:39:23.439Z","updatedAt":"2026-01-06T15:39:23.439Z","__v":0},
  {"name":{"first_name":"VICTOR","last_name":"NUWARIMPA","other_names":"VICTOR NUWARIMPA"},"class":{"name":"Level 6","stream":"Apple"},"residence":{"region":"Central","district":"Kampala","village":"Kitemu"},"guardian1":{"guardian_id":"G251231111919692","relationship":"Guardian"},"guardian2":{"relationship":""},"_id":"695d2b675b5b28e5527d3dcb","registration_id":"MJS-260106-183356-631","gender":"Female","date_of_birth":"2026-01-10T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"","photo":"","createdAt":"2026-01-06T15:33:59.728Z","updatedAt":"2026-01-06T15:33:59.728Z","__v":0},
  {"name":{"first_name":"VICTOR","last_name":"NUWARIMPA","other_names":"VICTOR NUWARIMPA"},"class":{"name":"Level 3","stream":"Apple"},"residence":{"region":"Central","district":"Kampala","village":"Nabbingo"},"guardian1":{"guardian_id":"G251231111919692","relationship":"Father"},"guardian2":{"relationship":""},"_id":"695d2a965b5b28e5527d3dc8","registration_id":"MJS-260106-183027-761","gender":"Male","date_of_birth":"2016-02-02T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"","club":"Swimming","photo":"","createdAt":"2026-01-06T15:30:30.511Z","updatedAt":"2026-01-06T15:30:30.511Z","__v":0},
  {"name":{"first_name":"CATHERINE","last_name":"ROBIN"},"class":{"name":"Level 7"},"residence":{"region":"East","district":"Mbale","village":"Kumii"},"guardian1":{"guardian_id":"G251231111919692","relationship":"Father"},"guardian2":{"relationship":""},"_id":"695d294b5b5b28e5527d3dc4","registration_id":"MJS-260106-182459-770","gender":"Female","date_of_birth":"2012-03-09T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"","photo":"","createdAt":"2026-01-06T15:24:59.991Z","updatedAt":"2026-01-06T15:24:59.991Z","__v":0},
  {"name":{"first_name":"Monica","last_name":"KWAGALAKWE"},"class":{"name":"Level 4"},"residence":{"region":"Central","district":"Kampala","village":"Kitemu"},"guardian1":{"guardian_id":"G251230161617967","relationship":"Mother"},"guardian2":{"relationship":""},"_id":"695d272a5b5b28e5527d3dbc","registration_id":"MJS-260106-181553-908","gender":"Female","date_of_birth":"2014-03-09T00:00:00.000Z","religion":"Christianity","section":"Primary","house":"","photo":"","createdAt":"2026-01-06T15:15:54.373Z","updatedAt":"2026-01-06T15:15:54.373Z","__v":0},
  {"name":{"first_name":"Hellen","last_name":"Namazzi"},"class":{"name":"Level 5"},"residence":{"region":"Eastern","district":"Mbale","village":"kumi"},"_id":"695944c584031c4988d72ad5","registration_id":"MJS-260103-193307-707","gender":"Female","date_of_birth":"2010-11-25T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2026-01-03T16:33:09.801Z","updatedAt":"2026-01-03T16:33:09.801Z","__v":0},
  {"name":{"first_name":"Kaitale","last_name":"David"},"class":{"name":"Level 5"},"residence":{"region":"Central","district":"Kawempe","village":"Kamu"},"_id":"69581514ebbea2c37bae6276","registration_id":"MJS-260102-215722-213","gender":"Male","date_of_birth":"2012-12-12T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2026-01-02T18:57:24.341Z","updatedAt":"2026-01-02T18:57:24.341Z","__v":0},
  {"name":{"first_name":"Monica","last_name":"Khalayi"},"class":{"name":"Level 7"},"residence":{"region":"Central","district":"Kampala","village":"Nsangi"},"_id":"69581435ebbea2c37bae6274","registration_id":"MJS-260102-215340-931","gender":"Female","date_of_birth":"2019-01-03T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2026-01-02T18:53:41.907Z","updatedAt":"2026-01-02T18:53:41.907Z","__v":0},
  {"name":{"first_name":"Sseruwu","last_name":"Fred"},"class":{"name":"Level 4"},"_id":"6957a3ba609e2a8f09b5aa2d","registration_id":"MJS-260102-135345-825","gender":"Male","date_of_birth":"2014-07-01T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2026-01-02T10:53:46.572Z","updatedAt":"2026-01-02T10:53:46.572Z","__v":0},
  {"name":{"first_name":"CATHERINE","last_name":"KWAGALAKWE"},"class":{"name":"Level 6"},"residence":{"region":"Central","district":"Kampala","village":"Kitemu"},"_id":"6954df4e815537dd827da7df","registration_id":"MJS-251231-113109-921","gender":"Female","date_of_birth":"2016-12-22T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2025-12-31T08:31:10.407Z","updatedAt":"2025-12-31T08:31:10.407Z","__v":0},
  {"name":{"first_name":"JOHN","last_name":"KYEYUNE"},"class":{"name":"Pre C","stream":"1"},"_id":"6954df3a815537dd827da7db","registration_id":"MJS-251231-113050-378","gender":"Male","date_of_birth":"2017-12-13T00:00:00.000Z","religion":"Christianity","section":"Pre-Primary","createdAt":"2025-12-31T08:30:50.820Z","updatedAt":"2025-12-31T08:30:50.820Z","__v":0},
  {"name":{"first_name":"VICTOR","last_name":"NUWARIMPA","other_names":"VICTOR NUWARIMPA"},"class":{"name":"Level 7"},"residence":{"region":"Central","district":"Kampala","village":"Kitemu"},"_id":"6953d0a3a1155742ea2f0be9","registration_id":"MJS-251230-161618-015","gender":"Male","date_of_birth":"2025-12-15T00:00:00.000Z","religion":"Christianity","section":"Primary","createdAt":"2025-12-30T13:16:19.627Z","updatedAt":"2025-12-30T13:16:19.627Z","__v":0},
  {"name":{"first_name":"Aisha","last_name":"Namirembe","other_names":""},"class":{"name":"P.4","stream":"Red"},"residence":{"region":"Central","district":"Mukono","village":"Seeta"},"_id":"6942979484ea9ef034a7b430","registration_id":"MJS-2025-002","gender":"Female","date_of_birth":"2015-09-02T00:00:00.000Z","religion":"Muslim","section":"Primary","house":"Victoria","club":"Debate Club","photo":"https://example.com/photos/aisha-namirembe.jpg","createdAt":"2025-12-17T11:44:20.722Z","updatedAt":"2025-12-17T11:44:20.722Z","__v":0},
];

const EnhancedStudentTable = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<Filters>({
    class: 'all',
    religion: 'all',
    stream: 'all',
    region: 'all',
    district: 'all',
    section: 'all',
    gender: 'all',
    house: 'all',
  });

  // Extract unique values for filters
  const uniqueValues: UniqueValues = useMemo(() => {
    const classes = [...new Set(studentsData.map(s => s.class?.name).filter(Boolean))] as string[];
    const religions = [...new Set(studentsData.map(s => s.religion).filter(Boolean))] as string[];
    const streams = [...new Set(studentsData.map(s => s.class?.stream).filter(Boolean))] as string[];
    const regions = [...new Set(studentsData.map(s => s.residence?.region).filter(Boolean))] as string[];
    const districts = [...new Set(studentsData.map(s => s.residence?.district).filter(Boolean))] as string[];
    const sections = [...new Set(studentsData.map(s => s.section).filter(Boolean))] as string[];
    const genders = [...new Set(studentsData.map(s => s.gender).filter(Boolean))] as string[];
    const houses = [...new Set(studentsData.map(s => s.house).filter(Boolean))] as string[];

    return {
      classes: classes.sort(),
      religions: religions.sort(),
      streams: streams.sort(),
      regions: regions.sort(),
      districts: districts.sort(),
      sections: sections.sort(),
      genders: genders.sort(),
      houses: houses.sort(),
    };
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = studentsData.filter((student) => {
      const fullName = `${student.name?.first_name} ${student.name?.last_name} ${student.name?.other_names || ''}`.toLowerCase();
      const searchMatch = fullName.includes(searchTerm.toLowerCase()) ||
        (student.registration_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (student.residence?.village?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const classMatch = filters.class === 'all' || student.class?.name === filters.class;
      const religionMatch = filters.religion === 'all' || student.religion === filters.religion;
      const streamMatch = filters.stream === 'all' || student.class?.stream === filters.stream;
      const regionMatch = filters.region === 'all' || student.residence?.region === filters.region;
      const districtMatch = filters.district === 'all' || student.residence?.district === filters.district;
      const sectionMatch = filters.section === 'all' || student.section === filters.section;
      const genderMatch = filters.gender === 'all' || student.gender === filters.gender;
      const houseMatch = filters.house === 'all' || student.house === filters.house;

      return searchMatch && classMatch && religionMatch && streamMatch && 
             regionMatch && districtMatch && sectionMatch && genderMatch && houseMatch;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: any, bVal: any;
        
        if (sortConfig.key && sortConfig.key.includes('.')) {
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
  }, [searchTerm, filters, sortConfig]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
    });
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  const exportToCSV = () => {
    const headers = ['Registration ID', 'First Name', 'Last Name', 'Other Names', 'Gender', 'Class', 'Stream', 'Section', 'Religion', 'Region', 'District', 'Village', 'House'];
    const rows = filteredData.map(s => [
      s.registration_id || '',
      s.name?.first_name || '',
      s.name?.last_name || '',
      s.name?.other_names || '',
      s.gender || '',
      s.class?.name || '',
      s.class?.stream || '',
      s.section || '',
      s.religion || '',
      s.residence?.region || '',
      s.residence?.district || '',
      s.residence?.village || '',
      s.house || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Student Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);
    doc.text(`Total Students: ${filteredData.length}`, 14, 28);
    
    // Prepare table data
    const tableData = filteredData.map(student => [
      student.registration_id || '',
      `${student.name?.first_name} ${student.name?.last_name}`,
      student.gender || '',
      student.class?.name || '',
      student.class?.stream || '',
      student.section || '',
      student.religion || '',
      student.residence?.district || '',
      student.residence?.region || '',
      student.house || ''
    ]);

    // Add table
    autoTable(doc, {
      head: [['ID', 'Name', 'Gender', 'Class', 'Stream', 'Section', 'Religion', 'District', 'Region', 'House']],
      body: tableData,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 35 },
    });

    // Save PDF
    doc.save(`students_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getSectionColor = (section: string) => {
    const colors: Record<string, string> = {
      'Primary': 'bg-green-100 text-green-800 hover:bg-green-100',
      'Pre-Primary': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      'Day Care': 'bg-red-100 text-gray-800 hover:bg-red-100',
    };
    return colors[section] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, you would make an API call here
    console.log('Deleting student:', selectedStudent);
    setDeleteDialogOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Student Management</CardTitle>
              <CardDescription>
                Total Students: {filteredData.length} 
                {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
              </CardDescription>
            </div>
            
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
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, ID, or village..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Filters</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
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
                              {uniqueValues.classes.map(c => (
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
                              {uniqueValues.sections.map(s => (
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
                              {uniqueValues.genders.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Region</label>
                          <Select
                            value={filters.region}
                            onValueChange={(value) => handleFilterChange('region', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Regions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Regions</SelectItem>
                              {uniqueValues.regions.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Stream</label>
                          <Select
                            value={filters.stream}
                            onValueChange={(value) => handleFilterChange('stream', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Streams" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Streams</SelectItem>
                              {uniqueValues.streams.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Religion</label>
                          <Select
                            value={filters.religion}
                            onValueChange={(value) => handleFilterChange('religion', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Religions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Religions</SelectItem>
                              {uniqueValues.religions.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">District</label>
                          <Select
                            value={filters.district}
                            onValueChange={(value) => handleFilterChange('district', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Districts" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Districts</SelectItem>
                              {uniqueValues.districts.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">House</label>
                          <Select
                            value={filters.house}
                            onValueChange={(value) => handleFilterChange('house', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Houses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Houses</SelectItem>
                              {uniqueValues.houses.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('registration_id')}
                    >
                      <div className="flex items-center gap-1">
                        ID {renderSortIcon('registration_id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name.first_name')}
                    >
                      <div className="flex items-center gap-1">
                        Name {renderSortIcon('name.first_name')}
                      </div>
                    </TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Class/Stream</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {student.registration_id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.photo} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.name?.first_name} {student.name?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.religion}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.gender === 'Male' ? 'default' : 'secondary'}
                            className={
                              student.gender === 'Male' 
                                ? 'bg-red-100 text-gray-800 hover:bg-red-100' 
                                : 'bg-pink-100 text-pink-800 hover:bg-pink-100'
                            }
                          >
                            {student.gender}
                          </Badge>
                        </TableCell>
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
                        <TableCell>
                          <Badge className={getSectionColor(student.section)}>
                            {student.section}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{student.residence?.district}</div>
                            <div className="text-sm text-gray-500">{student.residence?.region}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(student)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <AlertCircle className="h-12 w-12 text-gray-300" />
                          <div>
                            <p className="text-lg font-medium text-gray-500">No students found</p>
                            <p className="text-sm text-gray-400">
                              Try adjusting your search or filter parameters
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name?.first_name} {selectedStudent?.name?.last_name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedStudentTable;