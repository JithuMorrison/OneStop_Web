import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFilter, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Events page displaying all events from announcements and exam schedules
 */
const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all'); // all, upcoming, past
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const eventTypes = [
    'All',
    'Events',
    'Hackathons',
    'Workshops',
    'Value-Added Courses',
    'Seminars',
    'Competitions',
    'Cultural',
    'Technical',
    'Sports',
    'Exam',
    'Other'
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedType, selectedTimeFilter, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by type
    if (selectedType && selectedType !== 'All') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Filter by time
    const now = new Date();
    if (selectedTimeFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_date) >= now);
    } else if (selectedTimeFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.end_date) < now);
    } else if (selectedTimeFilter === 'ongoing') {
      filtered = filtered.filter(event => 
        new Date(event.start_date) <= now && new Date(event.end_date) >= now
      );
    }

    // Sort by start date (upcoming first)
    filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    setFilteredEvents(filtered);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <FaCalendarAlt className="inline mr-3" />
            Events Calendar
          </h1>

          {/* Time Filter */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelectedTimeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setSelectedTimeFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedTimeFilter('ongoing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeFilter === 'ongoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setSelectedTimeFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeFilter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Past
            </button>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type === 'All' ? '' : type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  (type === 'All' && !selectedType) || selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {selectedType || selectedTimeFilter !== 'all'
                ? 'No events found matching your filters'
                : 'No events scheduled yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const status = getEventStatus(event.start_date, event.end_date);
              return (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Event Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {event.type}
                    </span>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Event Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {event.name}
                  </h3>

                  {/* Date Range */}
                  <div className="flex items-start gap-2 text-gray-600 mb-2">
                    <FaClock className="mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Start: {formatDate(event.start_date)}</p>
                      <p className="font-medium">End: {formatDate(event.end_date)}</p>
                    </div>
                  </div>

                  {/* Source Type */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-4 pt-4 border-t">
                    <FaMapMarkerAlt />
                    <span className="capitalize">
                      {event.source_type === 'announcement' ? 'Announcement Event' : 'Exam Schedule'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
