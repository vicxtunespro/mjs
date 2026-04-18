'use client';

// components/IDCardGenerator.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { PDFIDCardDocument } from '@/components/ids/studentId';
import type { Student, APIResponse } from '@/types/id.types';
import {
  Download,
  Grid3x3,
  FileText,
  RefreshCw,
  User,
  Calendar,
  Hash,
  QrCode,
  GraduationCap,
  Loader2,
} from 'lucide-react';

type PreviewMode = 'grid' | 'pdf';

interface IDCardGeneratorProps {
  apiUrl?: string;
}

const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({
  apiUrl = 'https://api.mjsportal.xyz/students',
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('grid');

  // Fetch students from your backend
  useEffect(() => {
    const fetchStudents = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<APIResponse>(apiUrl);

        if (response.data.success) {
          setStudents(response.data.data);
          setError(null);
        } else {
          setError('Failed to fetch student data');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (axios.isAxiosError(err)) {
          setError(err.message || 'Failed to fetch student data. Please try again later.');
        } else {
          setError('Failed to fetch student data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [apiUrl]);

  // Generate PDF filename
  const getFileName = useCallback((): string => {
    const date = new Date();
    return `mjs-student-id-cards-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.pdf`;
  }, []);

  // Helper function to format full name
  const getFullName = (student: Student): string => {
    const parts = [student.name.first_name, student.name.other_names, student.name.last_name].filter(Boolean);
    return parts.join(' ');
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cta-low border-t-cta rounded-full animate-spin"></div>
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cta animate-pulse" />
          </div>
          <p className="text-foreground font-medium">Loading student data...</p>
          <p className="text-muted-foreground text-sm">Please wait while we fetch the records</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2 bg-cta text-white rounded-lg hover:bg-cta-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-semibold">No Students Found</h3>
          <p className="text-muted-foreground">There are no student records available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold">MJS Educational Centre</h1>
            <p className="text-lg opacity-90">Student ID Card Generator</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <User className="w-4 h-4" />
              <span className="font-medium">Total Students: {students.length}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <div className="flex gap-2 bg-white/10 rounded-lg p-1">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  previewMode === 'grid'
                    ? 'bg-white text-primary shadow-md'
                    : 'hover:bg-white/20'
                }`}
                onClick={() => setPreviewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
                Grid View
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  previewMode === 'pdf'
                    ? 'bg-white text-primary shadow-md'
                    : 'hover:bg-white/20'
                }`}
                onClick={() => setPreviewMode('pdf')}
              >
                <FileText className="w-4 h-4" />
                PDF Preview
              </button>
            </div>

            <PDFDownloadLink
              document={<PDFIDCardDocument students={students} />}
              fileName={getFileName()}
              className="inline-flex items-center gap-2 px-6 py-2 bg-cta text-white rounded-lg hover:bg-cta-hover transition-all shadow-md hover:shadow-lg"
            >
              {({ loading: pdfLoading, error: pdfError }) => {
                if (pdfError) return 'Error generating PDF';
                return (
                  <>
                    {pdfLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {pdfLoading ? 'Generating PDF...' : 'Download All ID Cards'}
                  </>
                );
              }}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {previewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border group"
              >
                <div className="p-6 space-y-4">
                  {/* School Header */}
                  <div className="text-center border-b border-border pb-3">
                    <h3 className="text-lg font-bold text-primary">MJS EDUCATIONAL CENTRE</h3>
                    <p className="text-xs text-muted-foreground italic">"Excellence in Education"</p>
                  </div>

                  {/* Card Title */}
                  <h4 className="text-center text-sm font-semibold text-foreground">STUDENT IDENTITY CARD</h4>

                  {/* Content */}
                  <div className="flex gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-28 bg-muted rounded-lg border border-border overflow-hidden">
                        {student.photo && student.photo !== '' ? (
                          <img
                            src={student.photo}
                            alt={getFullName(student)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="text-sm font-medium text-foreground">{getFullName(student)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Registration ID
                        </p>
                        <p className="text-sm font-mono text-foreground">{student.registration_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">LIN</p>
                        <p className="text-sm font-mono text-foreground">{student.LIN}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="text-sm text-foreground">{student.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            DOB
                          </p>
                          <p className="text-sm text-foreground">{formatDate(student.date_of_birth)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Class</p>
                        <p className="text-sm font-medium text-foreground">
                          {student.class.name} {student.class.stream}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {student.qr_code?.cloudinary_url && (
                    <div className="pt-3 border-t border-border flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                        <img
                          src={student.qr_code.cloudinary_url}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          Scan to Verify
                        </p>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          ID: {student.registration_id}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-2 text-center border-t border-border">
                    <p className="text-[10px] text-muted-foreground">Valid ID Card - Issued by MJS Educational Centre</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-[10px] text-muted-foreground italic">Student's Signature</p>
                      <p className="text-[10px] text-muted-foreground italic">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
            <div className="h-[800px]">
              <PDFViewer width="100%" height="100%">
                <PDFIDCardDocument students={students} />
              </PDFViewer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDCardGenerator;