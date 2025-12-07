import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService.jsx';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

/**
 * CalendarEvents page component
 * Displays a monthly calendar view with events
 * Allows teachers to create exam schedules
 */
const CalendarEvents = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Exam form state
  const [examForm, setExamForm] = useState({
    exam_name: '',
    date: '',
    year: new Date().getFullYear(),
    semester: 1,
    number_of_exams: 1
  });

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch events for current month
  useEffect(() => {
    fetchMonthEvents();
  }, [currentDate]);

  const fetchMonthEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get first and last day of current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch regular events
      const fetchedEvents = await eventService.getEvents(
        firstDay.toISOString(),
        lastDay.toISOString()
      );

      // Fetch exam timetables
      const token = localStorage.getItem('token');
      const examResponse = await fetch('http://localhost:5000/api/exam-timetables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (examResponse.ok) {
        const examTimetables = await examResponse.json();
        
        // Convert exam timetables to event format
        const examEvents = [];
        examTimetables.forEach(timetable => {
          timetable.exams.forEach(exam => {
            const examDate = new Date(exam.exam_date);
            
            // Only include exams in current month
            if (examDate >= firstDay && examDate <= lastDay) {
              examEvents.push({
                name: `${exam.subject_id?.subject_name || 'Exam'} (${exam.subject_id?.subject_code || ''})`,
                type: 'Exam',
                start_date: exam.exam_date,
                end_date: exam.exam_date,
                source_type: 'exam_timetable',
                time: `${exam.start_time} - ${exam.end_time}`,
                room: exam.room,
                department: timetable.department,
                semester: timetable.semester,
                batch_year: timetable.batch_year
              });
            }
          });
        });

        // Combine regular events and exam events
        setEvents([...fetchedEvents, ...examEvents]);
      } else {
        setEvents(fetchedEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];

    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const checkDate = new Date(date);

      // Reset time to compare dates only
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  // Handle date click
  const handleDateClick = async (date) => {
    if (!date) return;

    setSelectedDate(date);
    setShowEventDetails(true);

    try {
      // Get regular events for this date
      const dateEvents = await eventService.getEventsForDate(date.toISOString());
      
      // Get exam timetable events for this date
      const token = localStorage.getItem('token');
      const examResponse = await fetch('http://localhost:5000/api/exam-timetables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (examResponse.ok) {
        const examTimetables = await examResponse.json();
        
        // Filter exams for selected date
        const examEvents = [];
        examTimetables.forEach(timetable => {
          timetable.exams.forEach(exam => {
            const examDate = new Date(exam.exam_date);
            const selectedDateOnly = new Date(date);
            
            // Reset time for comparison
            examDate.setHours(0, 0, 0, 0);
            selectedDateOnly.setHours(0, 0, 0, 0);
            
            if (examDate.getTime() === selectedDateOnly.getTime()) {
              examEvents.push({
                name: `${exam.subject_id?.subject_name || 'Exam'} (${exam.subject_id?.subject_code || ''})`,
                type: 'Exam',
                start_date: exam.exam_date,
                end_date: exam.exam_date,
                source_type: 'exam_timetable',
                time: `${exam.start_time} - ${exam.end_time}`,
                room: exam.room,
                department: timetable.department,
                semester: timetable.semester,
                batch_year: timetable.batch_year
              });
            }
          });
        });

        setSelectedDateEvents([...dateEvents, ...examEvents]);
      } else {
        setSelectedDateEvents(dateEvents);
      }
    } catch (err) {
      console.error('Error fetching date events:', err);
      setError(err.message);
    }
  };

  // Handle exam form submission
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await eventService.createExamSchedule(examForm);
      
      // Reset form
      setExamForm({
        exam_name: '',
        date: '',
        year: new Date().getFullYear(),
        semester: 1,
        number_of_exams: 1
      });

      setShowExamForm(false);
      
      // Refresh events
      await fetchMonthEvents();
      
      alert('Exam schedule created successfully!');
    } catch (err) {
      console.error('Error creating exam schedule:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Calendar & Events
          </h1>

          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowExamForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Exam Schedule
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Month navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>

            <h2 className="text-2xl font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((date, index) => {
              const dateEvents = date ? getEventsForDate(date) : [];
              const hasEvents = dateEvents.length > 0;
              const hasExam = dateEvents.some(e => e.source_type === 'exam_schedule' || e.source_type === 'exam_timetable');

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-24 p-2 border rounded-lg cursor-pointer transition
                    ${!date ? 'bg-gray-50 cursor-default' : ''}
                    ${isToday(date) ? 'bg-blue-50 border-blue-500' : 'border-gray-200'}
                    ${hasEvents ? 'hover:bg-gray-50' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </div>
                      
                      {hasEvents && (
                        <div className="space-y-1">
                          {dateEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-2 py-1 rounded truncate ${
                                event.source_type === 'exam_schedule' || event.source_type === 'exam_timetable'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                              title={event.name}
                            >
                              {event.name}
                            </div>
                          ))}
                          {dateEvents.length > 2 && (
                            <div className="text-xs text-gray-500 px-2">
                              +{dateEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Details Modal */}
        {showEventDetails && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Events on {selectedDate.toLocaleDateString()}
                  </h3>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500">No events on this date.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          event.source_type === 'exam_schedule' || event.source_type === 'exam_timetable'
                            ? 'bg-red-50 border-red-500'
                            : 'bg-green-50 border-green-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-800">
                              {event.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: <span className="font-medium">{event.type}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(event.start_date).toLocaleDateString()}
                              {event.start_date !== event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                            </p>
                            {event.time && (
                              <p className="text-sm text-gray-600 mt-1">
                                Time: <span className="font-medium">{event.time}</span>
                              </p>
                            )}
                            {event.room && (
                              <p className="text-sm text-gray-600">
                                Room: <span className="font-medium">{event.room}</span>
                              </p>
                            )}
                            {event.source_type === 'exam_timetable' && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">
                                  {event.department} - Batch {event.batch_year} - Semester {event.semester}
                                </span>
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.source_type === 'exam_schedule' || event.source_type === 'exam_timetable'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {event.source_type === 'exam_schedule' || event.source_type === 'exam_timetable' ? 'Exam' : 'Event'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exam Schedule Form Modal */}
        {showExamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Create Exam Schedule
                  </h3>
                  <button
                    onClick={() => setShowExamForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <form onSubmit={handleExamSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      value={examForm.exam_name}
                      onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={examForm.date}
                      onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={examForm.year}
                      onChange={(e) => setExamForm({ ...examForm, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="2020"
                      max="2100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester *
                    </label>
                    <select
                      value={examForm.semester}
                      onChange={(e) => setExamForm({ ...examForm, semester: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Exams *
                    </label>
                    <input
                      type="number"
                      value={examForm.number_of_exams}
                      onChange={(e) => setExamForm({ ...examForm, number_of_exams: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowExamForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEvents;
