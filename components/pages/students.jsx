"use client";
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
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
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import { Eye, Trash2, Pencil, Download, Search, Filter, ChevronUp, ChevronDown, User, X } from 'lucide-react';

// Sample data from your JSON
const studentsData = [
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
  {"name":{"first_name":"Brian","last_name":"Kato","other_names":"Michael"},"class":{"name":"P.6","stream":"Blue"},"residence":{"region":"Central","district":"Wakiso","village":"Kira"},"_id":"69429661595cc274384c133d","gender":"Male","date_of_birth":"2013-04-18T00:00:00.000Z","religion":"Christian","section":"Primary","house":"Nile","club":"Science Club","photo":"https://example.com/photos/brian-kato.jpg"}
];

const EnhancedStudentTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterExpanded, setFilterExpanded] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
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
  const uniqueValues = useMemo(() => {
    return {
      classes: [...new Set(studentsData.map(s => s.class?.name).filter(Boolean))].sort(),
      religions: [...new Set(studentsData.map(s => s.religion).filter(Boolean))].sort(),
      streams: [...new Set(studentsData.map(s => s.class?.stream).filter(Boolean))].sort(),
      regions: [...new Set(studentsData.map(s => s.residence?.region).filter(Boolean))].sort(),
      districts: [...new Set(studentsData.map(s => s.residence?.district).filter(Boolean))].sort(),
      sections: [...new Set(studentsData.map(s => s.section).filter(Boolean))].sort(),
      genders: [...new Set(studentsData.map(s => s.gender).filter(Boolean))].sort(),
      houses: [...new Set(studentsData.map(s => s.house).filter(Boolean))].sort(),
    };
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = studentsData.filter((student) => {
      const fullName = `${student.name?.first_name} ${student.name?.last_name} ${student.name?.other_names || ''}`.toLowerCase();
      const searchMatch = fullName.includes(searchTerm.toLowerCase()) ||
        student.registration_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.residence?.village?.toLowerCase().includes(searchTerm.toLowerCase());

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
        let aVal, bVal;
        
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aVal = keys.reduce((obj, key) => obj?.[key], a);
          bVal = keys.reduce((obj, key) => obj?.[key], b);
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, filters, sortConfig]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleFilterChange = (filterKey, value) => {
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
      s.registration_id,
      s.name?.first_name,
      s.name?.last_name,
      s.name?.other_names || '',
      s.gender,
      s.class?.name,
      s.class?.stream || '',
      s.section,
      s.religion,
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
    setAnchorEl(null);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const getSectionColor = (section) => {
    const colors = {
      'Primary': '#10b981',
      'Pre-Primary': '#f59e0b',
      'Day Care': '#3b82f6',
    };
    return colors[section] || '#6b7280';
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Student Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Students: {filteredData.length} {activeFilterCount > 0 && `(${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
          </Typography>
        </Box>

        {/* Search and Export */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, ID, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ minWidth: 120, bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
          >
            Export
          </Button>
        </Box>

        {/* Advanced Filters */}
        <Accordion expanded={filterExpanded} onChange={() => setFilterExpanded(!filterExpanded)} sx={{ mb: 2 }}>
          <AccordionSummary>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Filter size={18} />
              <Typography>Advanced Filters</Typography>
              {activeFilterCount > 0 && (
                <Chip label={activeFilterCount} size="small" color="primary" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={filters.class} label="Class" onChange={(e) => handleFilterChange('class', e.target.value)}>
                    <MenuItem value="all">All Classes</MenuItem>
                    {uniqueValues.classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stream</InputLabel>
                  <Select value={filters.stream} label="Stream" onChange={(e) => handleFilterChange('stream', e.target.value)}>
                    <MenuItem value="all">All Streams</MenuItem>
                    {uniqueValues.streams.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={filters.section} label="Section" onChange={(e) => handleFilterChange('section', e.target.value)}>
                    <MenuItem value="all">All Sections</MenuItem>
                    {uniqueValues.sections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select value={filters.gender} label="Gender" onChange={(e) => handleFilterChange('gender', e.target.value)}>
                    <MenuItem value="all">All Genders</MenuItem>
                    {uniqueValues.genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Religion</InputLabel>
                  <Select value={filters.religion} label="Religion" onChange={(e) => handleFilterChange('religion', e.target.value)}>
                    <MenuItem value="all">All Religions</MenuItem>
                    {uniqueValues.religions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Region</InputLabel>
                  <Select value={filters.region} label="Region" onChange={(e) => handleFilterChange('region', e.target.value)}>
                    <MenuItem value="all">All Regions</MenuItem>
                    {uniqueValues.regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>District</InputLabel>
                  <Select value={filters.district} label="District" onChange={(e) => handleFilterChange('district', e.target.value)}>
                    <MenuItem value="all">All Districts</MenuItem>
                    {uniqueValues.districts.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>House</InputLabel>
                  <Select value={filters.house} label="House" onChange={(e) => handleFilterChange('house', e.target.value)}>
                    <MenuItem value="all">All Houses</MenuItem>
                    {uniqueValues.houses.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button startIcon={<X size={16} />} onClick={clearAllFilters} size="small">
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Table */}
        <TableContainer component={Paper} sx={{ border: 1, borderColor: '#e5e7eb' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => handleSort('registration_id')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    ID {renderSortIcon('registration_id')}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => handleSort('name.first_name')}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Name {renderSortIcon('name.first_name')}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class/Stream</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {student.registration_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={student.photo} sx={{ width: 32, height: 32, bgcolor: '#333' }}>
                          <User size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.name?.first_name} {student.name?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.religion}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.class?.name}</Typography>
                      {student.class?.stream && (
                        <Chip label={student.class.stream} size="small" sx={{ mt: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.section}
                        size="small"
                        sx={{
                          bgcolor: getSectionColor(student.section) + '20',
                          color: getSectionColor(student.section),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {student.residence?.district}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.residence?.region}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton size="small" sx={{ color: '#3b82f6' }}>
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{ color: '#10b981' }}>
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Search size={40} color="#d1d5db" />
                      <Typography variant="body1" color="text.secondary">
                        No students found matching your criteria
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Try adjusting your search or filter parameters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />

        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <MenuItem onClick={exportToCSV} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Download size={18} color="#10b981" />
              <Typography variant="body2">Export as CSV</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            alert('PDF export feature - integrate jsPDF here');
            setAnchorEl(null);
          }} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Download size={18} color="#ef4444" />
              <Typography variant="body2">Export as PDF</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default EnhancedStudentTable;