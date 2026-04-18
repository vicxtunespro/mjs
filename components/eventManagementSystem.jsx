'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Filter, 
  Printer, 
  X, 
  Save,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin
} from 'lucide-react';

// Sample initial events data
const initialEvents = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    description: 'Quarterly meeting with parents to discuss student progress',
    date: '2023-10-15',
    startTime: '14:00',
    endTime: '16:00',
    location: 'School Auditorium',
    category: 'academic',
    reminder: true,
    participants: ['All Teachers', 'Parents']
  },
  {
    id: '2',
    title: 'Sports Day',
    description: 'Annual inter-house sports competition',
    date: '2023-10-20',
    startTime: '09:00',
    endTime: '15:00',
    location: 'School Grounds',
    category: 'sports',
    reminder: true,
    participants: ['All Students', 'Staff']
  },
  {
    id: '3',
    title: 'Science Fair',
    description: 'Exhibition of student science projects',
    date: '2023-10-25',
    startTime: '10:00',
    endTime: '14:00',
    location: 'Science Building',
    category: 'academic',
    reminder: false,
    participants: ['Science Students', 'Teachers']
  },
  {
    id: '4',
    title: 'Staff Meeting',
    description: 'Monthly staff meeting to discuss school operations',
    date: '2023-11-05',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Conference Room',
    category: 'administration',
    reminder: true,
    participants: ['Teaching Staff', 'Admin Staff']
  }
];

// Event categories with colors
const eventCategories = {
  academic: { name: 'Academic', color: 'bg-red-100 text-gray-800 border-blue-300' },
  sports: { name: 'Sports', color: 'bg-green-100 text-green-800 border-green-300' },
  social: { name: 'Social', color: 'bg-primary text-secondary  dark:text-primary border-secondary-midtone' },
  administration: { name: 'Administration', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  holiday: { name: 'Holiday', color: 'bg-red-100 text-cta border-cta-midtone' }
};

const EventManagementSystem = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showReminders, setShowReminders] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    category: 'academic',
    reminder: false,
    participants: ''
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('schoolEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(initialEvents);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('schoolEvents', JSON.stringify(events));
  }, [events]);

  // Check for upcoming events and show reminders
  useEffect(() => {
    const today = new Date();
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const timeDiff = eventDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 7; // Events in the next 7 days
    });

    if (upcomingEvents.length > 0) {
      setShowReminders(true);
    }
  }, [events]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : event
      ));
      setEditingEvent(null);
    } else {
      // Add new event
      const event = {
        ...newEvent,
        id: Date.now().toString()
      };
      setEvents([...events, event]);
    }
    setShowEventForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      category: 'academic',
      reminder: false,
      participants: ''
    });
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const filteredEvents = filterCategory === 'all' 
    ? events 
    : events.filter(event => event.category === filterCategory);

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => event.date === date);
  };

  const printEvents = () => {
    const printContent = `
      <div style="padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 20px;">School Events Calendar</h1>
        <div>
          ${filteredEvents.map(event => `
            <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid; page-break-inside: avoid;">
              <h3 style="margin: 0 0 5px 0;">${event.title}</h3>
              <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${event.date} | ${event.startTime} - ${event.endTime}</p>
              <p style="margin: 0 0 5px 0;"><strong>Location:</strong> ${event.location}</p>
              <p style="margin: 0;">${event.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>School Events</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Get current date info for the calendar header
  const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();

  return (
    <div className="min-h-screen bg-primary dark:bg-secondary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-secondary dark:text-primary">School Event Calendar</h1>
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center bg-red-600 text-primary dark:text-secondary px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Plus size={18} className="mr-2" />
            Add Event
          </button>
        </div>

        {/* Reminders Section */}
        {showReminders && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <Bell className="text-yellow-600 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">Upcoming Events</h3>
                  <div className="mt-2 text-yellow-700">
                    {events
                      .filter(event => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        const timeDiff = eventDate.getTime() - today.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        return daysDiff >= 0 && daysDiff <= 7;
                      })
                      .map(event => (
                        <div key={event.id} className="mb-2 flex items-center">
                          <span className="font-medium">{event.title}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(event.date).toLocaleDateString()} • {event.startTime}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowReminders(false)} className="text-yellow-600 hover:text-yellow-800">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-primary dark:bg-secondary rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-secondary dark:text-primary">
                {currentMonth} {currentYear}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1 rounded ${view === 'month' ? 'bg-red-100 text-gray-800' : 'text-secondary  dark:text-primary hover:bg-primary'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1 rounded ${view === 'week' ? 'bg-red-100 text-gray-800' : 'text-secondary  dark:text-primary hover:bg-primary'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView('day')}
                  className={`px-3 py-1 rounded ${view === 'day' ? 'bg-red-100 text-gray-800' : 'text-secondary  dark:text-primary hover:bg-primary'}`}
                >
                  Day
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter size={18} className="text-primary dark:text-secondary mr-2" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(eventCategories).map(([key, category]) => (
                    <option key={key} value={key}>{category.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={printEvents}
                className="flex items-center text-secondary  dark:text-primary hover:text-secondary  dark:text-primary px-3 py-1 rounded hover:bg-primary dark:bg-secondary"
              >
                <Printer size={18} className="mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-primary dark:bg-secondary rounded-lg shadow p-4 mb-6">
          {view === 'month' && <MonthView events={filteredEvents} onEdit={handleEdit} onDelete={handleDelete} />}
          {view === 'week' && <WeekView events={filteredEvents} onEdit={handleEdit} onDelete={handleDelete} />}
          {view === 'day' && <DayView events={filteredEvents} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>

        {/* Upcoming Events List */}
        <div className="bg-primary dark:bg-secondary rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-secondary  dark:text-primary mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {filteredEvents
              .filter(event => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map(event => (
                <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-secondary bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary dark:bg-secondary rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-secondary dark:text-primary">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => { setShowEventForm(false); setEditingEvent(null); resetForm(); }} className="text-primary dark:text-secondary hover:text-secondary dark:text-primary">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Category</label>
                  <select
                    name="category"
                    value={newEvent.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(eventCategories).map(([key, category]) => (
                      <option key={key} value={key}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={newEvent.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={newEvent.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">Participants</label>
                <input
                  type="text"
                  name="participants"
                  value={newEvent.participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Teachers, Students, Parents"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={newEvent.reminder}
                  onChange={handleInputChange}
                  id="reminder"
                  className="h-4 w-4 text-gray-600 focus:ring-blue-500 border-primary-plus rounded"
                />
                <label htmlFor="reminder" className="ml-2 block text-sm text-secondary dark:text-primary">
                  Set reminder for this event
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEventForm(false); setEditingEvent(null); resetForm(); }}
                  className="px-4 py-2 border border-primary-plus rounded-md text-secondary  dark:text-primary hover:bg-primary dark:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-primary dark:text-secondary rounded-md hover:bg-red-700 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Month View Component
const MonthView = ({ events, onEdit, onDelete }) => {
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Generate days for the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="month-view">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-primary dark:text-secondary py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter(event => event.date === dateStr);
          const isToday = day === currentDate && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          
          return (
            <div
              key={day}
              className={`min-h-24 p-2 border rounded-lg ${isToday ? 'bg-red-50 border-blue-200' : 'border-primary'}`}
            >
              <div className={`text-right font-medium ${isToday ? 'text-gray-600' : 'text-secondary dark:text-primary'}`}>
                {day}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${eventCategories[event.category].color} border`}
                    onClick={() => onEdit(event)}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-primary">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component (simplified)
const WeekView = ({ events, onEdit, onDelete }) => {
  return (
    <div className="week-view">
      <div className="text-center py-10 text-primary">
        Week view implementation would go here
      </div>
    </div>
  );
};

// Day View Component (simplified)
const DayView = ({ events, onEdit, onDelete }) => {
  return (
    <div className="day-view">
      <div className="text-center py-10 text-primary">
        Day view implementation would go here
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onEdit, onDelete }) => {
  const category = eventCategories[event.category];

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${category.color} border`}>
              {category.name}
            </span>
            {event.reminder && (
              <Bell size={14} className="ml-2 text-yellow-500" />
            )}
          </div>
          <h3 className="font-semibold text-secondary  dark:text-primary mb-1">{event.title}</h3>
          <p className="text-sm text-secondary  dark:text-primary mb-2">{event.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(event)}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Edit event"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="text-cta hover:text-cta"
            aria-label="Delete event"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-primary dark:text-secondary mt-3">
        <CalendarIcon size={14} className="mr-1" />
        <span>{new Date(event.date).toLocaleDateString()}</span>
        <Clock size={14} className="ml-3 mr-1" />
        <span>{event.startTime} - {event.endTime}</span>
      </div>
      
      {event.location && (
        <div className="flex items-center text-sm text-primary dark:text-secondary mt-1">
          <MapPin size={14} className="mr-1" />
          <span>{event.location}</span>
        </div>
      )}
      
      {event.participants && (
        <div className="flex items-center text-sm text-primary dark:text-secondary mt-1">
          <Users size={14} className="mr-1" />
          <span>{event.participants}</span>
        </div>
      )}
    </div>
  );
};

export default EventManagementSystem;