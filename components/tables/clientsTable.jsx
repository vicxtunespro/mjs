"use client";
import React, { useEffect, useState, useMemo } from 'react';
import studentsData from '@/Data/students.json'; // Importing sample data
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  IconButton,
  TablePagination,
  Button,
  Menu,
  MenuItem,
  Chip,
  Box,
  Typography,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Avatar,
} from '@mui/material';
import { Eye, Trash2, Pencil, Download, Search, Filter, ChevronUp, ChevronDown, User, Mail, Phone, MapPin, UserPlus } from 'lucide-react';
import Link from 'next/link';
import useModalStore from '@/store/modalStore';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { styled } from '@mui/material/styles';
import SectionHeader from '../ui/sectionHeader';

// Custom styled button with your colors
const CustomButton = styled(Button)(({ theme, active }) => ({
  backgroundColor: active ? '#333333' : 'transparent',
  color: active ? '#ffffff' : '#333333',
  border: '1px solid #333333',
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 500,
  padding: '6px 12px',
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: '#333333',
    color: '#ffffff',
  },
  '&.export-btn': {
    backgroundColor: '#333333',
    color: '#ffffff',
    border: 'none',
    '&:hover': {
      backgroundColor: '#ef4444',
    },
  },
  '&.success-btn': {
    backgroundColor: active ? '#333333' : 'transparent',
    color: active ? '#ffffff' : '#333333',
    border: '1px solid #333333',
    '&:hover': {
      backgroundColor: '#333333',
      color: '#ffffff',
    },
  },
  '&.warning-btn': {
    backgroundColor: active ? '#f59e0b' : 'transparent',
    color: active ? '#ffffff' : '#f59e0b',
    border: '1px solid #f59e0b',
    '&:hover': {
      backgroundColor: '#f59e0b',
      color: '#ffffff',
    },
  },
  '&.error-btn': {
    backgroundColor: active ? '#ef4444' : 'transparent',
    color: active ? '#ffffff' : '#ef4444',
    border: '1px solid #ef4444',
    '&:hover': {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
  },
}));

// Custom styled icon button
const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: '#333333',
  '&:hover': {
    backgroundColor: '#eef2ff',
  },
  '&.view-btn': {
    color: '#3b82f6',
    '&:hover': {
      backgroundColor: '#dbeafe',
    },
  },
  '&.edit-btn': {
    color: '#333333',
    '&:hover': {
      backgroundColor: '#d1fae5',
    },
  },
  '&.delete-btn': {
    color: '#ef4444',
    '&:hover': {
      backgroundColor: '#fee2e2',
    },
  },
}));

const LearnersTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { openModal } = useModalStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [levelFilter, setLevelFilter] = useState('all');
  const open = Boolean(anchorEl);

  // Sample student data with additional fields

  const levels = [
    'Level One',
    'Level Two',
    'Level Three',
    'Level Four',
    'Level Five',
    'Level Six',
    'Level Seven'
  ];

  useEffect(() => {
    // Use sample data instead of Firebase fetch
    setStudents(studentsData);
    setLoading(false);
  }, []);

  const [pdfHeader, setPdfHeader] = useState('Sample Header');

  const handleUpdate = (id) => {
    openModal(<UpdateStudentModal id={id} />);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      // Remove from local state only
      setStudents((prev) => prev.filter((student) => student.id !== id));
    }
  };

  // Filter function
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  // Pagination functions
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export functions
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      'Student ID': row?.student_id,
      'First Name': row?.first_name,
      'Last Name': row?.last_name,
      'Other Names': row?.other_names,
      'Gender': row?.gender,
      'Stream': row?.stream,
      'Section': row?.section,
      // 'Enrollment Date': row?.enrollment_date,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Students.xlsx");
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(pdfHeader, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

    const headers = [['ID', 'Name', 'Gender', 'Stream', 'Section']];
    const pdfData = filteredData.map(row => [
      row?.student_id,
      `${row?.first_name} ${row?.last_name} ${row?.other_names}`,
      row?.gender,
      row?.stream,
      row?.section,
    ]);

    autoTable(doc, {
      head: headers,
      body: pdfData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 1 },
      headStyles: {
        fillColor: [79, 0, 260], // Using your primary color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    doc.save('Students.pdf');
    handleExportClose();
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Status filter function
  const handleLevelFilter = (level) => {
    setLevelFilter(level);
    setPdfHeader(`Class List - ${level}`);
    setPage(0);
  };

  // Data filtering, sorting and pagination
  const filteredData = useMemo(() => {
    let result = studentsData.filter((row) =>
      `${row?.first_name} ${row?.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
      row?.first_name.toLowerCase().includes(filter.toLowerCase()) ||
      row?.last_name.includes(filter) ||
      row?.student_id.toLowerCase().includes(filter.toLowerCase()) ||
      row?.other_names.toLowerCase().includes(filter.toLowerCase())
    );

    // Apply level filter
    if (levelFilter !== 'all') {
      result = result.filter(row => row?.level === levelFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [students, filter, levelFilter, sortConfig]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Get level color
  const getStatusColor = (level) => {
    switch (level) {
      case 'active': return '#333333'; // success color
      case 'inactive': return '#ef4444'; // error color
      case 'pending': return '#f59e0b'; // warning color
      default: return '#6b7280'; // default gray
    }
  };

  return (
      <div className='bg-gradient-to-br from-primary to-primary-midtone
          dark:bg-gradient-to-br dark:from-background-dark dark:to-secondary
          border border-primary dark:border-secondary-minus shadow-lg rounded-xl overflow-hidden' sx={{ border: '1px solid #e5e7eb' }}>
        {/* Table Header */}
        <div className='px-4 pt-6'>
          <SectionHeader Icon={UserPlus} title="Student Management" subtitle="Manage student information effectively" />
        </div>
        <CardContent>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search students by name, email, phone, ID or program"
              value={filter}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#f7dfc4" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#333333',
                  },
                }
              }}
            />
            <div className='flex gap-2 w-full md:w-auto md:justify-end'>
              {/* Filter Box */}
              <Box sx={{ minWidth: 120 }} className="w-2/3 md:w-auto">
                <FormControl fullWidth>
                  <InputLabel id="student-level-filter-label">Filter by Level</InputLabel>
                  <Select
                    labelId="student-level-filter-label"
                    id="student-level-filter"
                    value={levelFilter}
                    label="Filter by Level"
                    onChange={(e) => handleLevelFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {levels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <CustomButton
                className="export-btn w-1/3"
                startIcon={<Download size={18} />}
                onClick={handleExportClick}
              >
                Export
              </CustomButton>
            </div>
          </div>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleExportClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            <MenuItem onClick={exportToExcel} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Download size={18} color="#333333" />
                <Typography variant="body2">Export as Excel</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={exportToPDF} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Download size={18} color="#ef4444" />
                <Typography variant="body2">Export as PDF</Typography>
              </Box>
            </MenuItem>
          </Menu>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress sx={{ color: '#333333' }} />
            </Box>
          ) : (
            <>
              <TableContainer  component={Paper} elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: '#e5e7eb'}}>
                <Table>
                  <TableHead>
                    <TableRow className='bg-grey-200'>
                      {/* Student ID */}
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          py: 2,
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                        onClick={() => handleSort('student_id')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          ID
                          {renderSortIndicator('student_id')}
                        </Box>
                      </TableCell>
                      {/* first name */}
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          py: 2,
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                        onClick={() => handleSort('first_name')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Full Name
                          {renderSortIndicator('first_name')}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          py: 2,
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                        onClick={() => handleSort('gender')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Gender
                          {renderSortIndicator('gender')}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          py: 2,
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                        onClick={() => handleSort('stream')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Stream
                          {renderSortIndicator('stream')}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          py: 2,
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                        onClick={() => handleSort('section')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Section
                          {renderSortIndicator('section')}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row) => (
                        <TableRow key={row?.student_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f9fafb' } }}>
                          {/* Student ID */}
                          <TableCell>
                            <a
                              href={`/dashboard/students/overview/${row?.id}`}
                              style={{ color: '#333333', fontWeight: 500, textDecoration: 'none' }}
                              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {row?.student_id}
                            </a>
                          </TableCell>
                          {/* Name */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#333333' }} variant="square" src={`/photos/${row?.photo}` || ''}>
                                <User size={16} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium" color="#1f2937">
                                  {`${row?.first_name} ${row?.last_name}`}
                                </Typography>
                                <Typography variant="caption" color="#6b7280">
                                  {row?.level}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" color="#4b5563">{row?.gender}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#1f2937">{row?.stream}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row?.section?.charAt(0).toUpperCase() + row?.section?.slice(1)}
                              sx={{
                                backgroundColor: getStatusColor(row?.section) + '20',
                                color: getStatusColor(row?.section),
                                fontWeight: 500
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <CustomIconButton
                                  className="view-btn"
                                  size="small"
                                  onClick={() => openModal(<UpdateStudentModal id={row?.id} />)}
                                >
                                  <Eye size={16} />
                                </CustomIconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <CustomIconButton
                                  className="edit-btn"
                                  size="small"
                                  onClick={() => handleUpdate(row?.id)}
                                >
                                  <Pencil size={16} />
                                </CustomIconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <CustomIconButton
                                  className="delete-btn"
                                  size="small"
                                  onClick={() => handleDelete(row?.id)}
                                >
                                  <Trash2 size={16} />
                                </CustomIconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 4, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Search size={40} color="#d1d5db" />
                            <Typography variant="body1" color="#6b7280">
                              No students found matching your criteria
                            </Typography>
                            <Typography variant="body2" color="#9ca3af">
                              Try adjusting your search or filter parameters
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  mt: 2,
                  '& .MuiTablePagination-select': {
                    borderRadius: 1,
                    border: '1px solid #e5e7eb'
                  },
                  '& .MuiTablePagination-actions button': {
                    color: '#333333'
                  }
                }}
              />
            </>
          )}
        </CardContent>
      </div>
  );
};

export default LearnersTable;