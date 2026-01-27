"use client";
import React, { useEffect, useState, useMemo } from 'react';
import studentsData from '@/src/data/student_exam_marks.json'; // Assuming merged data with levels, etc.
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
  Box,
  Typography,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Download, Search, ChevronUp, ChevronDown, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { styled } from '@mui/material/styles';
import SectionHeader from '../ui/sectionHeader';

// Custom styled button
const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#333333',
  color: '#ffffff',
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 500,
  padding: '6px 12px',
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: '#ef4444',
  },
}));

// Custom styled icon button
const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: '#333333',
  '&:hover': {
    backgroundColor: '#eef2ff',
  },
}));

const StudentReportsTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [levelFilter, setLevelFilter] = useState('all');
  const [reportType, setReportType] = useState('mid_term');
  const [pdfHeader, setPdfHeader] = useState('Mid-Term Reports - All Levels');
  const open = Boolean(anchorEl);

  const subjects = ['ENG', 'MATH', 'SCI', 'SST'];

  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(studentsData.map(s => s.level))];
    return uniqueLevels.sort();
  }, []);

  useEffect(() => {
    setStudents(studentsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const typeMap = {
      mid_term: 'Mid-Term',
      end_of_term: 'End-of-Term',
      overall: 'Overall',
    };
    const type = typeMap[reportType];
    const lev = levelFilter === 'all' ? 'All Levels' : levelFilter;
    setPdfHeader(`${type} Reports - ${lev}`);
  }, [reportType, levelFilter]);

  const getAgg = (mark) => {
    if (mark > 90) return { agg: 'C1', weight: 1 };
    if (mark > 80) return { agg: 'D2', weight: 2 };
    if (mark > 70) return { agg: 'C3', weight: 3 };
    if (mark > 60) return { agg: 'C4', weight: 4 };
    if (mark > 50) return { agg: 'C5', weight: 5 };
    if (mark > 40) return { agg: 'C6', weight: 6 };
    if (mark > 35) return { agg: 'P7', weight: 7 };
    if (mark > 30) return { agg: 'P8', weight: 8 };
    return { agg: 'F9', weight: 9 };
  };

  const getDivision = (totalWeight) => {
    if (totalWeight === 0) return 'U';
    if (totalWeight >= 4 && totalWeight <= 12) return 'Div1';
    if (totalWeight <= 24) return 'Div2';
    if (totalWeight <= 36) return 'Div3';
    return 'Div4';
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    const dataForExport = filteredData.map(row => {
      const flat = {
        'Student ID': row.student_id,
        'First Name': row.first_name,
        'Last Name': row.last_name,
        'Level': row.level,
      };
      subjects.forEach(sub => {
        flat[`${sub} Mark`] = row.computedAggs[sub].mark;
        flat[`${sub} Agg`] = row.computedAggs[sub].agg;
        flat[`${sub} Weight`] = row.computedAggs[sub].weight;
      });
      flat['Total Marks'] = row.totalMarks;
      flat['Total Weight'] = row.totalWeight;
      flat['Division'] = row.division;
      return flat;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `${pdfHeader.replace(/ /g, '_')}.xlsx`);
    handleExportClose();
  };

  const exportMarksheetToPDF = () => {
    const doc = new jsPDF('landscape'); // Wide table, use landscape
    doc.setFontSize(18);
    doc.text(pdfHeader, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

    const headers = [['ID', 'Name', 'Level']];
    subjects.forEach(sub => {
      headers[0].push(`${sub} Mark`, 'Agg', 'Weight');
    });
    headers[0].push('Total Marks', 'Total Weight', 'Division');

    const pdfData = filteredData.map(row => {
      const dataRow = [
        row.student_id,
        `${row.first_name} ${row.last_name}`,
        row.level,
      ];
      subjects.forEach(sub => {
        dataRow.push(row.computedAggs[sub].mark, row.computedAggs[sub].agg, row.computedAggs[sub].weight);
      });
      dataRow.push(row.totalMarks, row.totalWeight, row.division);
      return dataRow;
    });

    autoTable(doc, {
      head: headers,
      body: pdfData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    doc.save(`${pdfHeader.replace(/ /g, '_')}_Marksheet.pdf`);
    handleExportClose();
  };

  const exportReportCardsToPDF = () => {
    const doc = new jsPDF();
    filteredData.forEach((student, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(18);
      doc.text(pdfHeader, 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`Student: ${student.first_name} ${student.last_name}`, 14, 40);
      doc.text(`ID: ${student.student_id}`, 14, 50);
      doc.text(`Level: ${student.level}`, 14, 60);
      doc.text(`Stream: ${student.stream || 'N/A'}`, 14, 70);
      doc.text(`Section: ${student.section || 'N/A'}`, 14, 80);

      const tableData = subjects.map(sub => [
        sub,
        student.computedAggs[sub].mark,
        student.computedAggs[sub].agg,
        student.computedAggs[sub].weight,
      ]);

      autoTable(doc, {
        head: [['Subject', 'Mark', 'Agg', 'Weight']],
        body: tableData,
        startY: 90,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: 255,
        },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Marks: ${student.totalMarks}`, 14, finalY);
      doc.text(`Total Weights: ${student.totalWeight}`, 14, finalY + 10);
      doc.text(`Division: ${student.division}`, 14, finalY + 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 280);
    });
    doc.save(`${pdfHeader.replace(/ /g, '_')}_Report_Cards.pdf`);
    handleExportClose();
  };

  const exportSingleToPDF = (student) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`${pdfHeader} - Individual Report`, 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Student: ${student.first_name} ${student.last_name}`, 14, 40);
    doc.text(`ID: ${student.student_id}`, 14, 50);
    doc.text(`Level: ${student.level}`, 14, 60);
    doc.text(`Stream: ${student.stream || 'N/A'}`, 14, 70);
    doc.text(`Section: ${student.section || 'N/A'}`, 14, 80);

    const tableData = subjects.map(sub => [
      sub,
      student.computedAggs[sub].mark,
      student.computedAggs[sub].agg,
      student.computedAggs[sub].weight,
    ]);

    autoTable(doc, {
      head: [['Subject', 'Mark', 'Agg', 'Weight']],
      body: tableData,
      startY: 90,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Marks: ${student.totalMarks}`, 14, finalY);
    doc.text(`Total Weights: ${student.totalWeight}`, 14, finalY + 10);
    doc.text(`Division: ${student.division}`, 14, finalY + 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 280);

    doc.save(`${student.first_name}_${student.last_name}_${reportType}_report.pdf`);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleLevelFilter = (level) => {
    setLevelFilter(level);
    setPage(0);
  };

  const filteredData = useMemo(() => {
    let result = students.filter((row) =>
      `${row.first_name} ${row.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
      row.student_id.toLowerCase().includes(filter.toLowerCase())
    );

    if (levelFilter !== 'all') {
      result = result.filter(row => row.level === levelFilter);
    }

    // Compute display data
    result = result.map(student => {
      let termMarks;
      const isOverall = reportType === 'overall';
      if (reportType === 'mid_term') {
        termMarks = student.mid_term || {};
      } else if (reportType === 'end_of_term') {
        termMarks = student.end_of_term || {};
      } else {
        termMarks = {};
        subjects.forEach(sub => {
          const mid = student.mid_term?.[sub] || 0;
          const end = student.end_of_term?.[sub] || 0;
          termMarks[sub] = (mid + end) / 2;
        });
      }

      const computedAggs = {};
      let totalMarks = 0;
      let totalWeight = 0;
      subjects.forEach(sub => {
        const mark = termMarks[sub] || 0;
        totalMarks += mark;
        const { agg, weight } = getAgg(mark);
        computedAggs[sub] = {
          mark: isOverall ? mark.toFixed(2) : mark,
          agg,
          weight,
        };
        totalWeight += weight;
      });
      const division = getDivision(totalWeight);

      return {
        ...student,
        computedAggs,
        totalMarks: isOverall ? totalMarks.toFixed(2) : totalMarks,
        totalWeight,
        division,
      };
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'totalWeight') {
          aVal = a.totalWeight;
          bVal = b.totalWeight;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [students, filter, levelFilter, reportType, sortConfig]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <Card className='shadow-lg rounded-xl overflow-hidden' sx={{ border: '1px solid #e5e7eb' }}>
      <div className='px-4 pt-6'>
        <SectionHeader Icon={UserPlus} title="Student Reports Management" subtitle="View and export student exam reports" />
      </div>
      <CardContent sx={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <TextField
            fullWidth
            placeholder="Search students by name or ID"
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
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333333' },
              }
            }}
          />
          <div className='flex gap-2 w-full md:w-auto'>
            <Box sx={{ minWidth: 140 }}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="mid_term">Mid-Term</MenuItem>
                  <MenuItem value="end_of_term">End-of-Term</MenuItem>
                  <MenuItem value="overall">Overall</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 140 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Level</InputLabel>
                <Select
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
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }
          }}
        >
          <MenuItem onClick={exportToExcel} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Download size={18} color="#333333" />
              <Typography variant="body2">Export as Excel</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={exportMarksheetToPDF} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Download size={18} color="#ef4444" />
              <Typography variant="body2">Export Marksheet PDF</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={exportReportCardsToPDF} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Download size={18} color="#f59e0b" />
              <Typography variant="body2">Export Report Cards PDF</Typography>
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
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell
                      sx={{ fontWeight: 600, cursor: 'pointer', py: 2, color: '#374151' }}
                      onClick={() => handleSort('student_id')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        ID
                        {renderSortIndicator('student_id')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, cursor: 'pointer', py: 2, color: '#374151' }}
                      onClick={() => handleSort('first_name')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Full Name
                        {renderSortIndicator('first_name')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>Level</TableCell>
                    {subjects.map(sub => (
                      <React.Fragment key={sub}>
                        <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>{sub}</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>AGG</TableCell>
                      </React.Fragment>
                    ))}
                    <TableCell
                      sx={{ fontWeight: 600, cursor: 'pointer', py: 2, color: '#374151' }}
                      onClick={() => handleSort('totalMarks')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Total Marks
                        {renderSortIndicator('totalMarks')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, cursor: 'pointer', py: 2, color: '#374151' }}
                      onClick={() => handleSort('totalWeight')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Total Weight
                        {renderSortIndicator('totalWeight')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>Division</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, color: '#374151' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow key={row.student_id} hover sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>{row.student_id}</TableCell>
                        <TableCell>{`${row.first_name} ${row.last_name}`}</TableCell>
                        <TableCell>{row.level}</TableCell>
                        {subjects.map(sub => (
                          <React.Fragment key={sub}>
                            <TableCell>{row.computedAggs[sub].mark}</TableCell>
                            <TableCell>{row.computedAggs[sub].agg}</TableCell>
                          </React.Fragment>
                        ))}
                        <TableCell>{row.totalMarks}</TableCell>
                        <TableCell>{row.totalWeight}</TableCell>
                        <TableCell>{row.division}</TableCell>
                        <TableCell>
                          <Tooltip title="Print Report">
                            <CustomIconButton size="small" onClick={() => exportSingleToPDF(row)}>
                              <Download size={16} />
                            </CustomIconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3 + subjects.length * 3 + 4} sx={{ py: 4, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Search size={40} color="#d1d5db" />
                          <Typography variant="body1" color="#6b7280">
                            No students found
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
                '& .MuiTablePagination-select': { borderRadius: 1, border: '1px solid #e5e7eb' },
                '& .MuiTablePagination-actions button': { color: '#333333' },
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentReportsTable;