// app/admin/marks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface Mark {
  _id: string;
  student_id: string;
  student_name: string;
  class: string;
  subject: string;
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  grade: string;
  term: string;
  academic_year: string;
  date_recorded: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

// Constants
const EXAM_TYPES = ['CAT 1', 'CAT 2', 'CAT 3', 'End of Term', 'Mid Term'];
const GRADES = [
  { min: 80, max: 100, grade: 'A', color: 'text-green-600', bg: 'bg-green-50' },
  { min: 70, max: 79, grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' },
  { min: 60, max: 69, grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { min: 50, max: 59, grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' },
  { min: 0, max: 49, grade: 'F', color: 'text-red-600', bg: 'bg-red-50' },
];

const getGrade = (percentage: number): string => {
  const grade = GRADES.find(g => percentage >= g.min && percentage <= g.max);
  return grade?.grade || 'F';
};

const getGradeColor = (percentage: number): string => {
  const grade = GRADES.find(g => percentage >= g.min && percentage <= g.max);
  return grade?.color || 'text-red-600';
};

const getGradeBg = (percentage: number): string => {
  const grade = GRADES.find(g => percentage >= g.min && percentage <= g.max);
  return grade?.bg || 'bg-red-50';
};

// Component
export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);

  const rowsPerPage = 20;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marksRes, subjectsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/marks`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`),
        ]);

        const marksData = await marksRes.json();
        const subjectsData = await subjectsRes.json();

        setMarks(marksData.data || []);
        setSubjects(subjectsData.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter marks
  const filteredMarks = marks.filter(mark => {
    const matchesSearch = mark.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || mark.class === selectedClass;
    const matchesSubject = !selectedSubject || mark.subject === selectedSubject;
    const matchesExamType = !selectedExamType || mark.exam_type === selectedExamType;
    const matchesTerm = !selectedTerm || mark.term === selectedTerm;
    
    return matchesSearch && matchesClass && matchesSubject && matchesExamType && matchesTerm;
  });

  // Paginate
  const paginatedMarks = filteredMarks.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredMarks.length / rowsPerPage);

  // Stats
  const stats = {
    total: filteredMarks.length,
    average: filteredMarks.length > 0 
      ? (filteredMarks.reduce((sum, m) => sum + m.percentage, 0) / filteredMarks.length).toFixed(1)
      : '0',
    passRate: filteredMarks.length > 0
      ? ((filteredMarks.filter(m => m.percentage >= 50).length / filteredMarks.length) * 100).toFixed(1)
      : '0',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Marks</h1>
            <p className="text-sm text-gray-500 mt-1">Manage student academic performance</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Mark
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.average}%</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Classes</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
              <option value="Level 5">Level 5</option>
              <option value="Level 6">Level 6</option>
              <option value="Level 7">Level 7</option>
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Exam Types</option>
              {EXAM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMarks.map((mark) => (
                  <tr key={mark._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mark.student_name}</p>
                        <p className="text-xs text-gray-500">{mark.student_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{mark.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{mark.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{mark.exam_type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{mark.score}</span>
                        <span className="text-sm text-gray-500">/ {mark.max_score}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${mark.percentage}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "inline-flex px-2 py-1 rounded-lg text-xs font-medium",
                        getGradeBg(mark.percentage),
                        getGradeColor(mark.percentage)
                      )}>
                        {mark.grade || getGrade(mark.percentage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{mark.term}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingMark(mark)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this mark?')) {
                              // Handle delete
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedMarks.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No marks found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredMarks.length)} of {filteredMarks.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal would go here */}
    </div>
  );
}

// Missing component
const TrendingUp: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-7.5 7.5-5-5L3 16" />
    <path d="M17 6h6v6" />
  </svg>
);