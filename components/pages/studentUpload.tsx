'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import SectionHeader from '../ui/sectionHeader';
import { 
  Backpack, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronDown,
  Info,
  HelpCircle,
  Table,
  Grid,
  FileJson,
  Trash2,
  ArrowUpCircle
} from 'lucide-react';

// Shadcn Dropdown imports only
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UploadResponse {
  success: boolean;
  message: string;
  inserted?: number;
  error?: any;
}

type TemplateFormat = 'csv' | 'excel' | 'json';

export default function StudentUploadTester() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = '.xlsx,.xls,.csv,.json';
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv', 'json'];
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setResponse({
        success: false,
        message: 'Invalid file type. Please upload .xlsx, .csv, or .json files only.',
        error: 'Unsupported file format'
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      setResponse({
        success: false,
        message: 'File size exceeds 10MB limit.',
        error: 'File too large'
      });
      return;
    }

    setFile(selectedFile);
    setResponse(null);
    simulateUploadProgress();
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://humble-robot-wr5wq7x4gjj9hvq45-5000.app.github.dev/students/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await res.json();
      setResponse(data);
      setUploadProgress(100);

      if (data.success && fileInputRef.current) {
        setTimeout(() => {
          setFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResponse(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = async (format: TemplateFormat) => {
    try {
      setDownloading(true);
      
      // Map format to file path
      const filePaths = {
        csv: '/templates/student_template.csv',
        excel: '/templates/student_template.xlsx',
        json: '/templates/student_template.json'
      };
      
      // Map format to download name
      const fileNames = {
        csv: 'student_upload_template.csv',
        excel: 'student_upload_template.xlsx',
        json: 'student_upload_template.json'
      };
      
      const response = await fetch(filePaths[format]);
      
      if (!response.ok) {
        throw new Error(`Template file not found: ${filePaths[format]}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNames[format];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setResponse({
        success: true,
        message: `${format.toUpperCase()} template downloaded successfully!`,
        inserted: 0
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setResponse(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error downloading template:', error);
      
      // Fallback to generated template if file not found
      generateFallbackTemplate(format);
      
    } finally {
      setDownloading(false);
    }
  };

  // Fallback template generator in case file is missing
  const generateFallbackTemplate = (format: TemplateFormat) => {
    if (format === 'csv') {
      const csvContent = `Name,Email,Age,Grade,Phone,Address,DateOfBirth,ParentName,ParentPhone
John Doe,john.doe@example.com,16,10,+1234567890,123 Main St,2008-05-15,Robert Doe,+1987654321
Jane Smith,jane.smith@example.com,15,9,+2345678901,456 Oak Ave,2009-08-22,Mary Smith,+2765432109`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify([
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "age": 16,
          "grade": "10",
          "phone": "+1234567890",
          "address": "123 Main St",
          "dateOfBirth": "2008-05-15",
          "parentName": "Robert Doe",
          "parentPhone": "+1987654321"
        },
        {
          "name": "Jane Smith",
          "email": "jane.smith@example.com",
          "age": 15,
          "grade": "9",
          "phone": "+2345678901",
          "address": "456 Oak Ave",
          "dateOfBirth": "2009-08-22",
          "parentName": "Mary Smith",
          "parentPhone": "+2765432109"
        }
      ], null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_upload_template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // For Excel, we'll provide a CSV as fallback since we can't generate Excel files
      alert('Excel template not available. Please use CSV or JSON format.');
    }
    
    setResponse({
      success: true,
      message: `${format.toUpperCase()} template downloaded successfully! (Fallback version)`,
      inserted: 0
    });

    setTimeout(() => {
      setResponse(null);
    }, 3000);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-gray-600" />;
      case 'csv':
        return <Table className="w-8 h-8 text-gray-600" />;
      case 'json':
        return <FileJson className="w-8 h-8 text-gray-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileTypeColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'csv':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'json':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatLabels = {
    csv: 'CSV Template',
    excel: 'Excel Template',
    json: 'JSON Template'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div>
          <SectionHeader 
            title="Bulk Student Upload" 
            subtitle="Upload multiple student records efficiently using Excel, CSV, or JSON files." 
            Icon={Backpack}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Upload Area */}
              <div className="p-6 md:p-8">
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8 md:p-12
                    transition-all duration-200 cursor-pointer
                    ${dragActive 
                      ? 'border-red-500 bg-red-50' 
                      : file 
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!file ? (
                    <div className="text-center">
                      <div>
                        <Upload className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                        Drag & Drop or <span className="text-red-600">Browse</span>
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Support: Excel (.xlsx, .xls), CSV, JSON (Max 10MB)
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Info size={14} />
                        <span>Secure upload • Processed immediately</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4">
                        <div className={`
                          p-3 md:p-4 rounded-2xl ${getFileTypeColor(file.name)}
                        `}>
                          {getFileIcon(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-1 truncate">
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {(file.size / 1024).toFixed(2)} KB • Ready to upload
                          </p>
                          
                          {/* Progress Bar */}
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        >
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`
                      flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-white
                      transition-all duration-200 flex items-center justify-center gap-2
                      ${!file || loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>

                  {/* Template Download with Shadcn Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={downloading}
                        className="flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading ? (
                          <>
                            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            <span>Template</span>
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleDownloadTemplate('csv')}>
                        <Table className="mr-2 h-4 w-4" />
                        CSV Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadTemplate('excel')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadTemplate('json')}>
                        <FileJson className="mr-2 h-4 w-4" />
                        JSON Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {file && (
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className="px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>

                {/* Response Display */}
                {response && (
                  <div
                    className={`mt-6 p-4 md:p-6 rounded-xl border ${
                      response.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div>
                        {response.success ? (
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-base md:text-lg mb-2 ${
                          response.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {response.success ? 'Success!' : 'Upload Failed'}
                        </h3>
                        <p className={`text-xs md:text-sm mb-3 ${
                          response.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {response.message}
                        </p>
                        
                        {response.inserted !== undefined && response.inserted > 0 && (
                          <div className="inline-block px-3 py-2 bg-white rounded-lg shadow-sm">
                            <p className="text-xs md:text-sm font-medium text-green-700">
                              ✓ {response.inserted} students inserted successfully
                            </p>
                          </div>
                        )}
                        
                        {response.error && (
                          <details className="mt-3">
                            <summary className="text-xs md:text-sm font-medium text-red-700 cursor-pointer hover:text-red-800">
                              View error details
                            </summary>
                            <pre className="mt-3 p-3 bg-white rounded-lg text-xs overflow-auto max-h-40 border border-red-100">
                              {JSON.stringify(response.error, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <button
                        onClick={() => setResponse(null)}
                        className="p-1 hover:bg-white/50 rounded-full transition-colors"
                      >
                        <X size={18} className={response.success ? 'text-green-600' : 'text-red-600'} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-6">
              {/* Format Guide */}
              <div className="p-4 md:p-6 border-b border-gray-200">
                <button
                  onClick={() => setShowFormatGuide(!showFormatGuide)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">Format Guide</h3>
                  </div>
                  <div>
                    <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-500 transition-transform duration-200 ${showFormatGuide ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showFormatGuide && (
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Required Fields
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Name', 'Email', 'Age', 'Grade'].map(field => (
                            <div key={field} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                              {field}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Optional Fields
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Phone', 'Address', 'DateOfBirth', 'ParentName', 'ParentPhone'].map(field => (
                            <div key={field} className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                              {field}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Data */}
              <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                  <Grid className="w-4 h-4 text-red-600" />
                  Sample Format
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">CSV / Excel Format:</p>
                    <code className="block text-xs bg-gray-50 p-2 md:p-3 rounded-lg text-gray-700 overflow-x-auto">
                      Name,Email,Age,Grade,Phone<br/>
                      John Doe,john@example.com,16,10,+1234567890<br/>
                      Jane Smith,jane@example.com,15,9,+2345678901
                    </code>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">JSON Format:</p>
                    <pre className="text-xs bg-gray-50 p-2 md:p-3 rounded-lg text-gray-700 overflow-x-auto max-h-32">
{`[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 16,
    "grade": "10"
  }
]`}
                    </pre>
                  </div>

                  <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-700 flex items-start gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        Download our template to ensure your data is formatted correctly. 
                        The template includes all required fields with example data.
                      </span>
                    </p>
                  </div>

                  {/* Format Selection Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      disabled={downloading}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Table size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('excel')}
                      disabled={downloading}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('json')}
                      disabled={downloading}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <FileJson size={14} />
                      JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-bold text-red-600">10MB</p>
                    <p className="text-xs text-gray-500">Max File Size</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-bold text-red-600">4</p>
                    <p className="text-xs text-gray-500">Supported Formats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}