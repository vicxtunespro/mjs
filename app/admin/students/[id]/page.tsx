"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Home,
  Users,
  Shield,
  Heart,
  Activity,
  FileText,
  Award,
  Globe,
  Edit,
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Bell,
  Clock,
  Star,
  TrendingUp,
  Bookmark,
  HeartPulse,
  AlertCircle,
  ChevronRight,
  School,
  BookMarked,
  UserCheck,
  UserCog,
  UserPlus,
  Building,
  Church,
  Cross,
  Moon,
  Eye
} from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SectionHeader from '@/components/ui/sectionHeader';
import { toSentenceCase } from '@/lib/utils';

// Types
interface Student {
  _id: string;
  registration_id: string;
  name: {
    first_name: string;
    last_name: string;
    other_names?: string;
  };
  class: {
    name: string;
    stream?: string;
  };
  residence?: {
    region: string;
    district: string;
    village: string;
    address?: string;
  };
  guardian1?: {
    guardian_id: string;
    relationship: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  guardian2?: {
    guardian_id: string;
    relationship: string;
    name?: string;
    phone?: string;
    email?: string;
  };
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
  emergency_contact?: string;
  blood_group?: string;
  previous_school?: string;
  admission_date?: string;
}

interface Guardian {
  _id: string;
  guardian_id: string;
  name: {
    first_name: string;
    last_name: string;
    other_names?: string;
  };
  relationship: string;
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
  occupation?: string;
  workplace?: string;
  emergency_contact?: string;
  createdAt: string;
  updatedAt: string;
}

const StudentProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const studentId = params.id as string;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mjs-backend-server.onrender.com';

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student data
      const studentResponse = await fetch(`${API_BASE_URL}/students/${studentId}`);
      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student data');
      }
      const studentResults = await studentResponse.json();
      const studentData = studentResults.data
      setStudent(studentData);

      // Fetch guardian data if guardian IDs exist
      const guardianIds = [
        studentData.guardian1?.guardian_id,
        studentData.guardian2?.guardian_id
      ].filter(Boolean);

      const guardianPromises = guardianIds.map(id => 
        fetch(`${API_BASE_URL}/guardians/${id}`).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch guardian ${id}`);
          return res.json();
        })
      );

      const guardianResults = await Promise.allSettled(guardianPromises);
      const successfulGuardians = guardianResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<Guardian>).value);
      
      setGuardians(successfulGuardians);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load student profile', {
        description: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth));
    } catch {
      return 0;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string = 'active') => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'graduated': 'bg-blue-100 text-blue-800 border-blue-200',
      'transferred': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'bg-green-100 text-green-800';
    if (rate >= 85) return 'bg-yellow-100 text-yellow-800';
    if (rate >= 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const exportToPDF = () => {
    if (!student) return;

    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Student Profile Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);
    doc.text(`Registration ID: ${student?.registration_id}`, 14, 28);
    
    // Student Information
    doc.setFontSize(12);
    doc.text('Personal Information', 14, 40);
    doc.setFontSize(10);
    
    const studentInfo = [
      ['Full Name', `${student?.name?.first_name} ${student?.name?.last_name} ${student?.name?.other_names || ''}`],
      ['Gender', student?.gender],
      ['Date of Birth', formatDate(student?.date_of_birth)],
      ['Age', calculateAge(student?.date_of_birth).toString()],
      ['Religion', student?.religion],
      ['Blood Group', student?.blood_group || 'Not specified'],
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Value']],
      body: studentInfo,
      theme: 'grid',
    });

    // Academic Information
    let startY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('Academic Information', 14, startY);
    doc.setFontSize(10);

    const academicInfo = [
      ['Class', student?.class?.name],
      ['Stream', student?.class?.stream || 'N/A'],
      ['Section', student?.section],
      ['House', student?.house || 'N/A'],
      ['Admission Date', student?.admission_date ? formatDate(student?.admission_date) : 'N/A'],
      ['Status', student?.status || 'active'],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Field', 'Value']],
      body: academicInfo,
      theme: 'grid',
    });

    // Performance
    startY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('Performance', 14, startY);
    doc.setFontSize(10);

    const performanceInfo = [
      ['Attendance Rate', `${student?.attendance_rate || 0}%`],
      ['Performance Score', `${student?.performance_score || 0}%`],
      ['Clubs/Activities', student?.club?.join(', ') || 'None'],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Field', 'Value']],
      body: performanceInfo,
      theme: 'grid',
    });

    // Save PDF
    doc.save(`${student?.registration_id}_profile_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast.success('Profile exported as PDF', {
      description: 'The student profile has been downloaded',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Student Not Found</h2>
        <p className="text-gray-500 mb-6">The student profile you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/students')}
            className="h-10 w-10 text-secondary-minus"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SectionHeader title={"Student Profile"} subtitle={`All information about ${toSentenceCase(student?.name?.first_name)}`} Icon={User}/>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className='bg-secondary'>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button className='bg-cta hover:bg-primary-plus hover:text-secondary'>
            <Edit className="h-4 w-4 mr-2"/>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={student?.photo} alt={`${student?.name?.first_name} ${student?.name?.last_name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-cta/10 text-2xl">
                    {student?.name?.first_name?.[0]}{student?.name?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">
                        {student?.name?.first_name} {student?.name?.last_name}
                        {student?.name?.other_names && ` (${student?.name?.other_names})`}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(student?.status)}>
                          {student?.status || 'active'}
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {student?.gender}
                        </Badge>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {student?.section}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Student ID</div>
                      <div className="font-mono font-bold text-secondary">{student?.registration_id}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <div className="text-sm text-gray-500">Age</div>
                      <div className="font-semibold">{calculateAge(student?.date_of_birth)} years</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Class</div>
                      <div className="font-semibold">{student?.class?.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Stream</div>
                      <div className="font-semibold">{student?.class?.stream || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">House</div>
                      <div className="font-semibold">{student?.house || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Academic
                  </TabsTrigger>
                  <TabsTrigger value="guardians" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guardians
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" />
                    Medical
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="overview" className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div className="font-medium">{student?.name?.first_name} {student?.name?.last_name} {student?.name?.other_names || ''}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Date of Birth</div>
                          <div className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(student?.date_of_birth)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Religion</div>
                          <div className="font-medium flex items-center gap-2">
                            {student?.religion === 'Islam' ? (
                              <Moon className="h-4 w-4" />
                            ) : (
                              <Cross className="h-4 w-4" />
                            )}
                            {student?.religion}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Residence</div>
                          <div className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {student?.residence ? (
                              `${student?.residence.village}, ${student?.residence.district}, ${student?.residence.region}`
                            ) : (
                              'Not specified'
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Previous School</div>
                          <div className="font-medium flex items-center gap-2">
                            <School className="h-4 w-4" />
                            {student?.previous_school || 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Admission Date</div>
                          <div className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {student?.admission_date ? formatDate(student?.admission_date) : 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Performance Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm text-gray-500">Attendance Rate</div>
                              <div className={`text-2xl font-bold ${getAttendanceColor(student?.attendance_rate || 0)}`}>
                                {student?.attendance_rate || 0}%
                              </div>
                            </div>
                            <div className={`p-3 rounded-full ${getAttendanceColor(student?.attendance_rate || 0)}`}>
                              <Clock className="h-6 w-6" />
                            </div>
                          </div>
                          <Progress value={student?.attendance_rate || 0} className="h-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm text-gray-500">Performance Score</div>
                              <div className={`text-2xl font-bold ${getPerformanceColor(student?.performance_score || 0)}`}>
                                {student?.performance_score || 0}%
                              </div>
                            </div>
                            <div className={`p-3 rounded-full ${getPerformanceColor(student?.performance_score || 0)}`}>
                              <Award className="h-6 w-6" />
                            </div>
                          </div>
                          <Progress value={student?.performance_score || 0} className="h-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Academic Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500">Class</div>
                          <div className="font-semibold text-lg">{student?.class?.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Stream</div>
                          <div className="font-semibold">{student?.class?.stream || 'Not assigned'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Section</div>
                          <div className="font-semibold">{student?.section}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">House</div>
                          <div className="font-semibold">{student?.house || 'Not assigned'}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Activities & Clubs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {student?.club && student?.club.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student?.club.map((club, index) => (
                              <Badge key={index} variant="outline" className="px-3 py-1">
                                {club}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-4">No club activities</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Academic Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Performance</span>
                            <span className={`font-bold ${getPerformanceColor(student?.performance_score || 0)}`}>
                              {student?.performance_score || 0}%
                            </span>
                          </div>
                          <Progress value={student?.performance_score || 0} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Attendance</span>
                            <span className={`font-bold ${getAttendanceColor(student?.attendance_rate || 0)}`}>
                              {student?.attendance_rate || 0}%
                            </span>
                          </div>
                          <Progress value={student?.attendance_rate || 0} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guardians" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guardians.length > 0 ? (
                      guardians.map((guardian, index) => (
                        <Card key={guardian._id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Guardian {index + 1}
                              </CardTitle>
                              <Badge variant="outline">
                                {guardian.relationship}
                              </Badge>
                            </div>
                            <CardDescription>
                              {guardian.name.first_name} {guardian.name.last_name}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-500">Full Name</div>
                              <div className="font-semibold">
                                {guardian.name.first_name} {guardian.name.last_name} {guardian.name.other_names || ''}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Contact Information</div>
                              <div className="space-y-2 mt-1">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{guardian.contact.phone}</span>
                                </div>
                                {guardian.contact.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{guardian.contact.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {guardian.occupation && (
                              <div>
                                <div className="text-sm text-gray-500">Occupation</div>
                                <div className="font-semibold">{guardian.occupation}</div>
                              </div>
                            )}
                            {guardian.workplace && (
                              <div>
                                <div className="text-sm text-gray-500">Workplace</div>
                                <div className="font-semibold">{guardian.workplace}</div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Guardian
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : student?.guardian1 || student?.guardian2 ? (
                      <Card className="md:col-span-2">
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Guardian Information</h3>
                            <p className="text-gray-500 mb-4">
                              Guardian records exist but detailed information couldn't be loaded.
                            </p>
                            <div className="space-y-2 text-sm">
                              {student?.guardian1 && (
                                <div>
                                  <span className="font-medium">Primary Guardian:</span>{' '}
                                  {student?.guardian1.relationship}
                                </div>
                              )}
                              {student?.guardian2 && student?.guardian2.relationship && (
                                <div>
                                  <span className="font-medium">Secondary Guardian:</span>{' '}
                                  {student?.guardian2.relationship}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="md:col-span-2">
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Guardians Added</h3>
                            <p className="text-gray-500 mb-4">
                              This student doesn't have any guardians registered in the system.
                            </p>
                            <Button>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Guardian
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HeartPulse className="h-5 w-5" />
                          Medical Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500">Blood Group</div>
                          <div className="font-semibold">{student?.blood_group || 'Not specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Allergies</div>
                          {student?.allergies && student?.allergies.length > 0 && student?.allergies[0] !== 'None' ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {student?.allergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="font-semibold text-green-600">No known allergies</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Emergency Contact</div>
                          <div className="font-semibold">{student?.emergency_contact || 'Not specified'}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Medical Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {student?.medical_notes ? (
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-line">{student?.medical_notes}</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No medical notes recorded</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Additional Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {student?.notes ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">{student?.notes}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookMarked className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">No additional notes</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Age</div>
                <div className="text-2xl font-bold">{calculateAge(student?.date_of_birth)} years</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Days Since Admission</div>
                <div className="text-2xl font-bold">
                  {student?.admission_date 
                    ? Math.floor((new Date().getTime() - new Date(student?.admission_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 'N/A'
                  }
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Profile Completion</div>
                <Progress value={85} className="h-2" />
                <div className="text-xs text-gray-500">85% complete</div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Created On</div>
                <div className="font-medium">{formatDate(student?.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium">{formatDate(student?.updatedAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Database ID</div>
                <div className="font-mono text-xs truncate">{student?._id}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Wrap with Suspense for better loading
export default function StudentProfilePageWrapper() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded" />
            <div className="h-64 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 animate-pulse rounded" />
            <div className="h-48 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    }>
      <StudentProfilePage />
    </Suspense>
  );
}