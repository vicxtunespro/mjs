"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { toProperCase } from '@/utils/helpers';
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
import { Eye, Trash2, Pencil, Download, Search, Filter, ChevronUp, ChevronDown, User, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import useModalStore from '@/store/modalStore';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation'


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

const InterviewTable = ({Data}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { openModal } = useModalStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginatedData, setPaginatedData] = useState([]);
  const open = Boolean(anchorEl);
  const router = useRouter();
  

  // Sample student data with additional fields

  const interviewStatus = [
    'In-Progress',
    'Completed',       
    'Pending'
  ];

  useEffect(() => {
    // Use sample data instead of Firebase fetch
    setStudents(Data);
    setLoading(false);
  }, []);

  const [pdfHeader, setPdfHeader] = useState('Sample Header');

  const handleUpdate = (id) => {
    console.log(id)
    router.push(`/admin/students/admissions/interview-upadate/${id}`)
  };

  //Delete Interview record
  const handleDelete = async (id) => {
    setLoading(true)
    if (window.confirm(`Are you sure you want to delete this candidate wit id: ${id}`)) {
      console.log(Data);
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${id}`, {
          method: 'DELETE'
        });
        alert("Candidate deleted successfully.");
        console.log(`Candidate with ID ${id} deleted successfully.`);
        window.location.reload();
      } catch (error) {
        alert("Error deleting candidate:");
        console.error("Error deleting candidate:", error);
      }
    }
    setLoading(false);
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
      
      'ID': row?.id,
      'Issue Date': row?.createdAt,
      'First Name': toProperCase(row?.firstName),
      'Last Name': toProperCase(row?.lastName),
      'Other Names': toProperCase(row?.otherNames),
      'Previous School': toProperCase(row?.previousSchool),
      'Class': toProperCase(row?.class),
      'Subject': toProperCase(row?.subject),
      'Status': row?.status,
      'Score': row?.score,
      'Issued By': row?.issuedBy,
      // 'Enrollment Date': row?.enrollment_date,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interviews");
    XLSX.writeFile(workbook, "Interviews.xlsx");
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(pdfHeader, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

    const headers = [['SN', 'Full Name', 'Other Names', 'Previous School', 'Class', 'Subject', 'Status', 'Score']];
    const pdfData = filteredData.map(row => [
      row?.id,
      `${toProperCase(row?.firstName)} ${toProperCase(row?.lastName)}`,
      `${toProperCase(row?.otherNames)}`,
      toProperCase(row?.previousSchool),
      toProperCase(row?.class),
      toProperCase(row?.subject),
      row?.status,
      row?.score,
    ]);

    autoTable(doc, {
      head: headers,
      body: pdfData,
      startY: 30,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 1 },
      headStyles: {
        fillColor: [64, 64, 64], // Using your primary color
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
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPdfHeader(`Class List - ${status}`);
    setPage(0);
  };

  // Data filtering, sorting and pagination
  const filteredData = useMemo(() => {
    let result = Data.filter((row) =>
      `${row?.firstName} ${row?.lastName}`.toLowerCase().includes(filter.toLowerCase()) ||
      row?.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      row?.lastName.includes(filter) ||
      row?.previousSchool.toLowerCase().includes(filter.toLowerCase()) ||
      row?.subject.toLowerCase().includes(filter.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(row => row?.status === statusFilter);
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
  }, [students, filter, statusFilter, sortConfig]);

  useEffect(() =>{
    const propData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setPaginatedData(propData);
  }, [filteredData, page, rowsPerPage]);

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#333333'; // success color
      case 'inactive': return '#ef4444'; // error color
      case 'pending': return '#f59e0b'; // warning color
      default: return '#6b7280'; // default gray
    }
  };

  return (
      <Card className='shadow-lg rounded-xl overflow-hidden' sx={{ border: '1px solid #e5e7eb' }}>
        {/* Table Header */}
        <CardContent sx={{ backgroundColor: '#ffffff' }}>
          
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
                    <Search size={20} color="#6b7280" />
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
                  <InputLabel id="student-status-filter-label">Filter by Status</InputLabel>
                  <Select
                    labelId="student-status-filter-label"
                    id="student-status-filter"
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => handleStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {interviewStatus.map((status) => (
                      <MenuItem key={status} value={status.toLowerCase()}>
                        {status}
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
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: '#e5e7eb' }}>
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
                          InterviewID
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
                        onClick={() => handleSort('firstName')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Full Name
                          {renderSortIndicator('firstName')}
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
                          Previous School
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
                        onClick={() => handleSort('subject')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Subject
                          {renderSortIndicator('subject')}
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
                        onClick={() => handleSort('issuedBy')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Issued by
                          {renderSortIndicator('issuedBy')}
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
                        onClick={() => handleSort('statu')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Status
                          {renderSortIndicator('status')}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  {/* Rows */}
                  <TableBody>
                    {Data.length > 0 ? (
                      Data.map((row) => (
                        <TableRow key={row?.firstName} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f9fafb' } }}>
                          {/* Student ID */}
                          <TableCell>
                            <a
                              href={`/dashboard/students/overview/${row?.id}`}
                              style={{ color: '#333333', fontWeight: 500, textDecoration: 'none' }}
                              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {row?.createAt}
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
                                  {`${row?.firstName} ${row?.lastName}`}
                                </Typography>
                                <Typography variant="caption" color="#6b7280">
                                  {row?.class}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" color="#4b5563">{row?.previousSchool}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#1f2937">{row?.subject}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#1f2937">{row?.issuedBy}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row?.status?.charAt(0).toUpperCase() + row?.status?.slice(1)}
                              sx={{
                                backgroundColor: getStatusColor(row?.status) + '20',
                                color: getStatusColor(row?.status),
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
                                  onClick={() => handleUpdate(row?._id)}
                                >
                                  <Eye size={16} />
                                </CustomIconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <CustomIconButton
                                  className="edit-btn"
                                  size="small"
                                  onClick={() => handleUpdate(row?._id)}
                                >
                                  <Pencil size={16} />
                                </CustomIconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <CustomIconButton
                                  className="delete-btn"
                                  size="small"
                                  onClick={() => handleDelete(row?._id)}
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
        
      </Card>
  );
};

export default InterviewTable;