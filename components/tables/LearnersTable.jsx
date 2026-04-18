'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Filter, Download, Maximize } from 'lucide-react';

// Sample data for demonstration
const initialData = [
  { id: 1, name: 'Emma Johnson', grade: '10', class: 'A', enrollmentDate: '2023-08-15', status: 'Active', gpa: 3.8 },
  { id: 2, name: 'Noah Smith', grade: '9', class: 'B', enrollmentDate: '2023-08-12', status: 'Active', gpa: 3.2 },
  { id: 3, name: 'Olivia Davis', grade: '11', class: 'C', enrollmentDate: '2023-08-10', status: 'Active', gpa: 3.9 },
  { id: 4, name: 'Liam Brown', grade: '10', class: 'A', enrollmentDate: '2023-08-14', status: 'Active', gpa: 3.5 },
  { id: 5, name: 'Ava Wilson', grade: '9', class: 'B', enrollmentDate: '2023-08-11', status: 'Active', gpa: 3.7 },
  { id: 6, name: 'William Taylor', grade: '12', class: 'D', enrollmentDate: '2023-08-09', status: 'Graduated', gpa: 3.6 },
  { id: 7, name: 'Sophia Martinez', grade: '11', class: 'C', enrollmentDate: '2023-08-13', status: 'Active', gpa: 4.0 },
  { id: 8, name: 'Mason Anderson', grade: '10', class: 'A', enrollmentDate: '2023-08-16', status: 'Active', gpa: 3.4 },
  { id: 9, name: 'Isabella Thomas', grade: '9', class: 'B', enrollmentDate: '2023-08-08', status: 'Active', gpa: 3.1 },
  { id: 10, name: 'James Jackson', grade: '12', class: 'D', enrollmentDate: '2023-08-07', status: 'Graduated', gpa: 3.9 },
];

const LearnersTable = () => {
  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Function to handle filtering
  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Apply sorting and filtering
  const processedData = useMemo(() => {
    let filteredData = data;
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      filteredData = data.filter(item => {
        return Object.keys(filters).every(key => {
          if (!filters[key]) return true;
          return item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
        });
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [data, filters, sortConfig]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Function to handle export
  const handleExport = (format) => {
    // In a real application, this would generate and download the file
    alert(`Exporting data as ${format.toUpperCase()} format`);
  };

  // Function to toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`bg-primary dark:bg-secondary rounded-lg shadow-md p-6 ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {/* Table Header with Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-secondary dark:text-primary">Learner Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-3 py-2 bg-red-100 text-gray-700 rounded-md hover:bg-red-200 transition"
          >
            <Download size={16} className="mr-1" />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
          >
            <Download size={16} className="mr-1" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center px-3 py-2 bg-red-100 text-cta rounded-md hover:bg-cta-low transition"
          >
            <Download size={16} className="mr-1" />
            PDF
          </button>
          <button
            onClick={toggleFullScreen}
            className="flex items-center px-3 py-2 bg-primary dark:bg-secondary text-secondary  dark:text-primary rounded-md hover:bg-grey-200 transition"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>

      {/* Table Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Name</label>
          <input
            type="text"
            placeholder="Filter by name"
            onChange={(e) => handleFilter('name', e.target.value)}
            className="w-full px-3 py-2 border border-primary-plus rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Grade</label>
          <input
            type="text"
            placeholder="Filter by grade"
            onChange={(e) => handleFilter('grade', e.target.value)}
            className="w-full px-3 py-2 border border-primary-plus rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Class</label>
          <input
            type="text"
            placeholder="Filter by class"
            onChange={(e) => handleFilter('class', e.target.value)}
            className="w-full px-3 py-2 border border-primary-plus rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Status</label>
          <select
            onChange={(e) => handleFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-primary-plus rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary">
          <thead className="bg-primary dark:bg-secondary">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortConfig.key === 'name' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('grade')}
              >
                <div className="flex items-center">
                  Grade
                  {sortConfig.key === 'grade' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('class')}
              >
                <div className="flex items-center">
                  Class
                  {sortConfig.key === 'class' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('enrollmentDate')}
              >
                <div className="flex items-center">
                  Enrollment Date
                  {sortConfig.key === 'enrollmentDate' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === 'status' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-primary dark:text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('gpa')}
              >
                <div className="flex items-center">
                  GPA
                  {sortConfig.key === 'gpa' ? (
                    sortConfig.direction === 'ascending' ? 
                    <ChevronUp size={16} className="ml-1" /> : 
                    <ChevronDown size={16} className="ml-1" />
                  ) : (
                    <ChevronUp size={16} className="ml-1 opacity-30" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary dark:bg-secondary divide-y divide-primary">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-primary dark:bg-secondary">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary dark:text-primary">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{item.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{item.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{item.enrollmentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{item.gpa}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-primary">
                  No learners found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <span className="text-sm text-secondary  dark:text-primary mr-4">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {indexOfLastItem > processedData.length ? processedData.length : indexOfLastItem}
            </span> of{' '}
            <span className="font-medium">{processedData.length}</span> results
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 border border-primary-plus rounded-md text-sm"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-primary dark:bg-secondary text-secondary-minus' : 'bg-grey-200 text-secondary  dark:text-primary hover:bg-primary-hover'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-primary dark:bg-secondary text-secondary-minus' : 'bg-grey-200 text-secondary  dark:text-primary hover:bg-primary-hover'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnersTable;