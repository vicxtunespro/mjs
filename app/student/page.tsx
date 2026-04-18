"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Save, 
  X, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2 
} from "lucide-react";
import clsx from "clsx";

// ==================== Type Definitions ====================

interface StudentName {
  first_name: string;
  last_name: string;
  other_names?: string;
}

interface StudentClass {
  name: string;
  stream?: string;
}

interface Residence {
  region?: string;
  district?: string;
  village?: string;
}

interface Guardian {
  full_name: string;
  contact: string;
  nin: string;
  email?: string;
  relationship: string;
  guardian_id?: string;
  photo?: string;
}

interface Student {
  _id: string;
  registration_id: string;
  LIN?: string;
  payment_code?: string;
  name: StudentName;
  class: StudentClass;
  academic_section?: string;
  school_section?: string;
  house?: string;
  club?: string;
  gender: string;
  religion?: string;
  date_of_birth: string;
  photo?: string;
  residence: Residence;
  guardian1?: Guardian;
  guardian2?: Guardian;
}

interface Locations {
  Central: string[];
  Eastern: string[];
  Northern: string[];
  Western: string[];
}

interface EditingCell {
  rowId: string | null;
  field: string | null;
}

// ==================== Constants ====================

const CLASS_STRUCTURE: Record<string, string[]> = {
  Daycare: ["Day Care"],
  Nursery: ["Pre A", "Pre B", "Pre C"],
  "Lower Primary": ["Level 1", "Level 2", "Level 3"],
  "Upper Primary": ["Level 4", "Level 5", "Level 6", "Level 7"],
};

const SCHOOL_SECTION = ["Day", "Boarding"];
const HOUSES = ["Athens", "Paris", "Berlin", "Venus"];
const CLUBS = ["Swimming", "MDD", "Cookery", "Scout", "Chess"];
const RELIGIONS = ["Muslim", "Christian", "Catholic", "Hindu", "Other"];
const GENDERS = ["Male", "Female", "Other"];

const CLOUDINARY_CLOUD_NAME = "dzidperyt";
const CLOUDINARY_UPLOAD_PRESET = "mjs-admission-photos";

// ==================== Helper Functions ====================

const getAcademicSection = (className?: string): string => {
  if (!className) return "";
  for (const section in CLASS_STRUCTURE) {
    if (CLASS_STRUCTURE[section].includes(className)) {
      return section;
    }
  }
  return "";
};

const getValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const setNestedValue = <T extends object>(obj: T, path: string, value: any): T => {
  const keys = path.split(".");
  const newObj = { ...obj } as any;

  let current = newObj;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = { ...current[key] };
      current = current[key];
    }
  });

  return newObj as T;
};

const validateField = (field: string, value: string): boolean => {
  if (field === "payment_code") return /^\d{10}$/.test(value);
  if (field === "LIN") return /^[A-Z0-9]{10,15}$/i.test(value);
  if (field === "date_of_birth") return !isNaN(new Date(value).getTime());
  return true;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// ==================== Sub-components ====================

const TableSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="overflow-auto border border-gray-200 rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            {Array(8).fill(0).map((_, i) => (
              <th key={i} className="p-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(5).fill(0).map((_, i) => (
            <tr key={i} className="border-t border-gray-100">
              {Array(8).fill(0).map((_, j) => (
                <td key={j} className="p-3">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EditableCell: React.FC<{
  value: any;
  field: string;
  row: Student;
  onSave: (rowId: string, field: string, value: any) => void;
  onCancel: () => void;
  locations: Locations;
}> = ({ value, field, row, onSave, onCancel, locations }) => {
  const [localValue, setLocalValue] = useState<any>(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const region = getValue(row, "residence.region");
  const districts = region && locations[region as keyof Locations] ? locations[region as keyof Locations] : [];

  const handleSave = () => {
    onSave(row._id, field, localValue);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      onSave(row._id, field, data.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      onCancel();
    }
  };

  // Render different input types based on field
  const renderInput = () => {
    if (field === "gender") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select Gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      );
    }

    if (field === "school_section") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select Section</option>
          {SCHOOL_SECTION.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      );
    }

    if (field === "house") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select House</option>
          {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      );
    }

    if (field === "club") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select Club</option>
          {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      );
    }

    if (field === "religion") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select Religion</option>
          {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      );
    }

    if (field === "residence.district") {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select District</option>
          {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
      );
    }

    if (field === "photo") {
      return (
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
            id={`photo-upload-${row._id}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`photo-upload-${row._id}`}
            className={clsx(
              "px-3 py-1 text-sm rounded-lg cursor-pointer flex items-center gap-2",
              isUploading ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </label>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type={field === "date_of_birth" ? "date" : "text"}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 px-2 py-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return renderInput();
};

// ==================== Main Component ====================

export default function DataEditorPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editingCell, setEditingCell] = useState<EditingCell>({ rowId: null, field: null });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState<Locations>({
    Central: [],
    Eastern: [],
    Northern: [],
    Western: []
  });

  const rowsPerPage = 15;

  const columns = [
    { key: "registration_id", label: "Reg ID", sortable: true },
    { key: "name.first_name", label: "First Name", sortable: true },
    { key: "name.last_name", label: "Last Name", sortable: true },
    { key: "class.name", label: "Class", sortable: true },
    { key: "academic_section", label: "Academic Section", sortable: true },
    { key: "school_section", label: "School Section", sortable: true },
    { key: "house", label: "House", sortable: true },
    { key: "club", label: "Club", sortable: true },
    { key: "gender", label: "Gender", sortable: true },
    { key: "religion", label: "Religion", sortable: true },
    { key: "date_of_birth", label: "DOB", sortable: true },
    { key: "payment_code", label: "Payment Code", sortable: true },
    { key: "LIN", label: "LIN", sortable: true },
    { key: "photo", label: "Photo", sortable: false },
    { key: "residence.region", label: "Region", sortable: true },
    { key: "residence.district", label: "District", sortable: true },
    { key: "residence.village", label: "Village", sortable: true },
  ];

  // Load locations data
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsData = await import("@/src/data/regions.json");
        setLocations(locationsData.default as Locations);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };
    loadLocations();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`);
        const json = await res.json();

        const fixed: Student[] = json.data.map((s: any) => {
          const section = getAcademicSection(s.class?.name);
          if (!s.academic_section && section) {
            return { ...s, academic_section: section };
          }
          return s;
        });

        setData(fixed);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and paginate data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(student => 
      student.name.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Save change to API
  const saveChange = useCallback(async (rowId: string, field: string, value: any) => {
    setSaving(prev => ({ ...prev, [rowId]: true }));
    
    let formatted = value;
    if (field === "date_of_birth" && value) {
      formatted = new Date(value).toISOString();
    }

    const payload = setNestedValue({}, field, formatted);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students/${rowId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to save");
      
      // Show success feedback briefly
      setTimeout(() => {
        setSaving(prev => ({ ...prev, [rowId]: false }));
      }, 1000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaving(prev => ({ ...prev, [rowId]: false }));
    }
  }, []);

  // Update local state and save
  const updateCell = useCallback((rowId: string, field: string, value: any) => {
    if (!validateField(field, value)) {
      alert(`Invalid ${field}. Please check the format.`);
      return;
    }

    setData((prev) =>
      prev.map((row) =>
        row._id === rowId ? setNestedValue(row, field, value) : row
      )
    );

    saveChange(rowId, field, value);
  }, [saveChange]);

  const startEditing = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const cancelEditing = () => {
    setEditingCell({ rowId: null, field: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Data Editor</h1>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] xl:max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Data Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Click on any cell to edit. Changes are saved automatically.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name or registration ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50 transition">
                    {columns.map((col) => {
                      const value = getValue(row, col.key);
                      const isEditing = editingCell.rowId === row._id && editingCell.field === col.key;
                      const isSaving = saving[row._id];

                      return (
                        <td
                          key={col.key}
                          onClick={() => !isEditing && startEditing(row._id, col.key)}
                          className={clsx(
                            "px-4 py-3 text-sm",
                            !isEditing && "cursor-pointer hover:bg-gray-100"
                          )}
                        >
                          {isSaving && !isEditing && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs">Saved</span>
                            </div>
                          )}
                          
                          {!isSaving && isEditing ? (
                            <EditableCell
                              value={value}
                              field={col.key}
                              row={row}
                              onSave={updateCell}
                              onCancel={cancelEditing}
                              locations={locations}
                            />
                          ) : col.key === "photo" ? (
                            value ? (
                              <img
                                src={value}
                                alt={row.name.first_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )
                          ) : col.key === "date_of_birth" ? (
                            <span className="text-gray-700">{formatDate(value)}</span>
                          ) : value ? (
                            <span className="text-gray-900">{String(value)}</span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} students
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={clsx(
                  "px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1",
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={clsx(
                        "w-8 h-8 rounded-lg text-sm font-medium transition",
                        page === pageNum
                          ? "bg-red-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={clsx(
                  "px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1",
                  page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}