'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Camera, 
  Users, 
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RefreshCw,
  User,
  FileSpreadsheet,
  X,
  Settings,
  Home
} from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types - No guardian fields
interface Student {
  _id: string;
  registration_id: string;
  name: {
    first_name: string;
    last_name: string;
    other_names: string;
  };
  class: {
    name: string;
    stream: string;
  };
  gender: string;
  date_of_birth: string;
  photo: string;
  religion?: string;
  academic_section?: string;
  school_section?: string;
  house?: string;
  club?: string;
  residence: {
    region: string;
    district: string;
    village: string;
  };
  data_status: string;
  missing_fields: string[];
}

interface PendingChange {
  studentId: string;
  field: string;
  value: any;
  timestamp: number;
}

interface ColumnConfig {
  id: string;
  label: string;
  group: 'bio' | 'academic' | 'residence' | 'extras';
  field: string;
  type: 'text' | 'select';
  options?: string[];
  visible: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
const STORAGE_KEY = 'student_editor_pending_changes';
const COLUMNS_STORAGE_KEY = 'student_editor_columns';

// Column configurations - NO GUARDIAN FIELDS
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'photo', label: 'Photo', group: 'bio', field: 'photo', type: 'text', visible: true },
  { id: 'registration_id', label: 'Reg ID', group: 'bio', field: 'registration_id', type: 'text', visible: true },
  { id: 'first_name', label: 'First Name', group: 'bio', field: 'name.first_name', type: 'text', visible: true },
  { id: 'last_name', label: 'Last Name', group: 'bio', field: 'name.last_name', type: 'text', visible: true },
  { id: 'other_names', label: 'Other Names', group: 'bio', field: 'name.other_names', type: 'text', visible: false },
  { id: 'gender', label: 'Gender', group: 'bio', field: 'gender', type: 'select', options: ['Male', 'Female'], visible: true },
  { id: 'date_of_birth', label: 'Date of Birth', group: 'bio', field: 'date_of_birth', type: 'text', visible: true },
  { id: 'religion', label: 'Religion', group: 'bio', field: 'religion', type: 'text', visible: false },
  { id: 'class', label: 'Class', group: 'academic', field: 'class.name', type: 'text', visible: true },
  { id: 'stream', label: 'Stream', group: 'academic', field: 'class.stream', type: 'text', visible: true },
  { id: 'academic_section', label: 'Academic Section', group: 'academic', field: 'academic_section', type: 'text', visible: false },
  { id: 'school_section', label: 'School Section', group: 'academic', field: 'school_section', type: 'select', options: ['Day', 'Boarding'], visible: false },
  { id: 'house', label: 'House', group: 'extras', field: 'house', type: 'select', options: ['Athenes', 'Paris', 'Berlin', 'Aves'], visible: false },
  { id: 'club', label: 'Club', group: 'extras', field: 'club', type: 'select', options: ['Swimming', 'MDD', 'Chess', 'Art & Craft', 'Music', 'Drama'], visible: false },
  { id: 'region', label: 'Region', group: 'residence', field: 'residence.region', type: 'text', visible: false },
  { id: 'district', label: 'District', group: 'residence', field: 'residence.district', type: 'text', visible: false },
  { id: 'village', label: 'Village', group: 'residence', field: 'residence.village', type: 'text', visible: false },
];

// Column groups
const COLUMN_GROUPS = {
  bio: { label: 'Bio Information', icon: User },
  academic: { label: 'Academic Info', icon: GraduationCap },
  residence: { label: 'Residence', icon: Home },
  extras: { label: 'Extras', icon: Settings },
};

// Clean student data by removing guardian fields
const cleanStudentData = (students: any[]): Student[] => {
  return students.map(student => {
    const { guardian1, guardian2, qr_code, __v, createdAt, updatedAt, ...cleanStudent } = student;
    return {
      ...cleanStudent,
      residence: student.residence || { region: '', district: '', village: '' },
      name: student.name || { first_name: '', last_name: '', other_names: '' },
      class: student.class || { name: '', stream: '' },
    };
  });
};

export default function StudentDataEditor() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  
  // Column management - with SSR fix
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showColumnManager, setShowColumnManager] = useState(false);
  
  // Pending changes with localStorage - with SSR fix
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [streams, setStreams] = useState<string[]>([]);
  const [uploadQueue, setUploadQueue] = useState<{ studentId: string; file: File; preview: string }[]>([]);
  const [showUploadQueue, setShowUploadQueue] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on client side only
  useEffect(() => {
    setIsClient(true);
    
    // Load columns
    const savedColumns = localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
    
    // Load pending changes
    const savedPending = localStorage.getItem(STORAGE_KEY);
    if (savedPending) {
      setPendingChanges(new Map(JSON.parse(savedPending)));
    }
  }, []);

  // Save pending changes to localStorage
  useEffect(() => {
    if (isClient && pendingChanges.size > 0) {
      const pendingArray = Array.from(pendingChanges.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingArray));
    }
  }, [pendingChanges, isClient]);

  // Save column config to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
    }
  }, [columns, isClient]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/students`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Clean the data by removing guardian fields
        const cleanedStudents = cleanStudentData(result.data);
        setStudents(cleanedStudents);
        setFilteredStudents(cleanedStudents);
        
        const uniqueClasses = new Set<string>();
        const uniqueStreams = new Set<string>();
        cleanedStudents.forEach((student: Student) => {
          if (student.class?.name) uniqueClasses.add(student.class.name);
          if (student.class?.stream) uniqueStreams.add(student.class.stream);
        });
        setClasses(Array.from(uniqueClasses).sort());
        setStreams(Array.from(uniqueStreams).sort());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students
  useEffect(() => {
    let filtered = [...students];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registration_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class?.name === selectedClass);
    }
    
    if (selectedStream !== 'all') {
      filtered = filtered.filter(s => s.class?.stream === selectedStream);
    }
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass, selectedStream]);

  // Get cell value with pending changes
  const getCellValue = (student: Student, field: string) => {
    const key = `${student._id}-${field}`;
    const pending = pendingChanges.get(key);
    if (pending) return pending.value;
    
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = student;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return '';
      }
      return value || '';
    }
    
    return (student as any)[field] || '';
  };

  // Handle cell edit
  const handleCellEdit = (studentId: string, field: string, value: any) => {
    const key = `${studentId}-${field}`;
    const newPending = new Map(pendingChanges);
    newPending.set(key, { studentId, field, value, timestamp: Date.now() });
    setPendingChanges(newPending);
  };

  // Handle photo upload (add to queue)
  const handlePhotoUpload = (studentId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setUploadQueue(prev => [...prev, { studentId, file, preview }]);
    setShowUploadQueue(true);
    
    // Store as pending change
    handleCellEdit(studentId, 'photo', preview);
  };

  // Upload all queued photos to Cloudinary
  const uploadAllPhotos = async () => {
    for (const item of uploadQueue) {
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('upload_preset', 'student_photos');
        formData.append('folder', `students/${item.studentId}`);
        
        const response = await fetch('https://api.cloudinary.com/v1_1/dzidperyt/image/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          const key = `${item.studentId}-photo`;
          const newPending = new Map(pendingChanges);
          newPending.set(key, { studentId: item.studentId, field: 'photo', value: data.secure_url, timestamp: Date.now() });
          setPendingChanges(newPending);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    
    setUploadQueue([]);
    setShowUploadQueue(false);
  };

  // Save all changes
  const saveAllChanges = async () => {
    if (pendingChanges.size === 0 && uploadQueue.length === 0) return;
    
    setSaving(true);
    setError(null);
    
    // First upload any pending photos
    if (uploadQueue.length > 0) {
      await uploadAllPhotos();
    }
    
    const updatesByStudent = new Map<string, any>();
    
    for (const [key, change] of pendingChanges.entries()) {
      if (!updatesByStudent.has(change.studentId)) {
        updatesByStudent.set(change.studentId, {});
      }
      
      const update = updatesByStudent.get(change.studentId);
      
      if (change.field.includes('.')) {
        const parts = change.field.split('.');
        if (parts.length === 2) {
          if (!update[parts[0]]) update[parts[0]] = {};
          update[parts[0]][parts[1]] = change.value;
        }
      } else {
        update[change.field] = change.value;
      }
    }
    
    let successCount = 0;
    for (const [studentId, updates] of updatesByStudent.entries()) {
      try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        if (response.ok) successCount++;
      } catch (err) {
        console.error(`Failed to update student ${studentId}:`, err);
      }
    }
    
    await fetchStudents();
    setPendingChanges(new Map());
    setSaving(false);
    setSuccess(`Successfully updated ${successCount} student(s)`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Discard all changes
  const discardAllChanges = () => {
    setPendingChanges(new Map());
    setUploadQueue([]);
    setShowUploadQueue(false);
    setSuccess('All pending changes discarded');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  // Export to CSV
  const exportToCSV = () => {
    const visibleColumns = columns.filter(c => c.visible);
    const headers = visibleColumns.map(c => c.label);
    const rows = filteredStudents.map(student => 
      visibleColumns.map(col => {
        if (col.id === 'photo') return student.photo ? 'Yes' : 'No';
        return getCellValue(student, col.field);
      })
    );
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Render editable cell
  const EditableCell = ({ student, column }: { student: Student; column: ColumnConfig }) => {
    const value = getCellValue(student, column.field);
    
    if (column.type === 'select' && column.options) {
      return (
        <Select
          value={value}
          onValueChange={(v) => handleCellEdit(student._id, column.field, v)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (column.id === 'photo') {
      const hasPending = pendingChanges.has(`${student._id}-photo`);
      const displayUrl = hasPending ? value : student.photo;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {displayUrl ? (
              <AvatarImage src={displayUrl} />
            ) : (
              <AvatarFallback className="text-xs bg-gray-100">
                {student.name.first_name?.[0]}{student.name.last_name?.[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handlePhotoUpload(student._id, file);
                }
              };
              input.click();
            }}
          >
            <Camera className="h-3 w-3 mr-1" />
            {student.photo ? 'Change' : 'Upload'}
          </Button>
        </div>
      );
    }
    
    return (
      <Input
        value={value}
        onChange={(e) => handleCellEdit(student._id, column.field, e.target.value)}
        className="h-8 text-sm"
        placeholder="—"
      />
    );
  };

  const visibleColumns = columns.filter(c => c.visible);
  const pendingCount = pendingChanges.size + uploadQueue.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Data Editor</h1>
            <p className="text-gray-500 mt-1">Edit student records with inline editing and photo uploads</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchStudents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Popover open={showColumnManager} onOpenChange={setShowColumnManager}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Manage Columns</h4>
                  {Object.entries(COLUMN_GROUPS).map(([groupId, group]) => {
                    const groupColumns = columns.filter(c => c.group === groupId);
                    if (groupColumns.length === 0) return null;
                    const Icon = group.icon;
                    return (
                      <div key={groupId}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{group.label}</span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {groupColumns.map(col => (
                            <div key={col.id} className="flex items-center gap-2">
                              <Checkbox
                                id={col.id}
                                checked={col.visible}
                                onCheckedChange={() => toggleColumn(col.id)}
                              />
                              <Label htmlFor={col.id} className="text-sm cursor-pointer">
                                {col.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Queue Dialog */}
        <Dialog open={showUploadQueue} onOpenChange={setShowUploadQueue}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Photo Upload Queue</DialogTitle>
              <DialogDescription>
                {uploadQueue.length} photo(s) ready to upload
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadQueue.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg">
                  <img src={item.preview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500">Ready to upload</p>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadQueue(false)}>
                Close
              </Button>
              <Button onClick={uploadAllPhotos} className="bg-red-600 hover:bg-red-700">
                Upload All ({uploadQueue.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Name or Registration ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Stream</Label>
                <Select value={selectedStream} onValueChange={setSelectedStream}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Streams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Streams</SelectItem>
                    {streams.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClass('all');
                    setSelectedStream('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spreadsheet Table */}
        <Card>
          <ScrollArea className="h-[calc(100vh-450px)]">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    {visibleColumns.map(col => (
                      <TableHead key={col.id} className="whitespace-nowrap">
                        {col.label}
                        {pendingChanges.has(`*${col.field}`) && (
                          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700 text-xs">
                            pending
                          </Badge>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No students found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        {visibleColumns.map(col => (
                          <TableCell key={col.id} className="p-2">
                            <EditableCell student={student} column={col} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </Card>

        {/* Stats and Save Buttons */}
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-4 gap-4 flex-1">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-xl font-bold">{students.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">With Photos</p>
                <p className="text-xl font-bold">{students.filter(s => s.photo).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Pending Changes</p>
                <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Photos in Queue</p>
                <p className="text-xl font-bold text-gray-600">{uploadQueue.length}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-2 ml-4">
            {pendingCount > 0 && (
              <>
                <Button variant="destructive" onClick={discardAllChanges}>
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button onClick={saveAllChanges} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save ({pendingCount})
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}