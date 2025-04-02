import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const LiveClass = () => {
  const { backendUrl } = useContext(AppContext);
  const [liveClasses, setLiveClasses] = useState([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', description: '', schedule: '', thumbnail: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/team/live-class`, { withCredentials: true });
        if (response.data.success) {
          setLiveClasses(response.data.data.liveClasses);
          setFilteredClasses(response.data.data.liveClasses);
          setTotalClasses(response.data.data.totalClasses);
        } else {
          setError(response.data.message || 'No live classes found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load live classes');
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClasses();
  }, [backendUrl]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = liveClasses.filter((liveClass) =>
      liveClass.title.toLowerCase().includes(term)
    );
    setFilteredClasses(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading state
    try {
      const response = await axios.post(
        `${backendUrl}/api/team/live-class`,
        { newClass },
        { withCredentials: true }
      );
      if (response.data.success) {
        setLiveClasses(response.data.data.liveClasses);
        setFilteredClasses(response.data.data.liveClasses);
        setTotalClasses(response.data.data.totalClasses);
        setNewClass({ title: '', description: '', schedule: '', thumbnail: '' });
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule live class');
    } finally {
      setIsSubmitting(false); // End loading state
    }
  };

  const getStatus = (liveClass) => {
    const now = new Date();
    const schedule = new Date(liveClass.schedule);
    if (liveClass.isLive) return 'Live Now';
    if (schedule < now) return 'Finished';
    return 'Scheduled';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-teal-500 mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading Live Classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center border-l-4 border-red-500">
          <p className="text-red-600 text-2xl font-bold">{error}</p>
          <p className="text-gray-600 mt-2">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by class title..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-3 pl-10 pr-4 rounded-full bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-200"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
          >
            + New Class
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800">Live Classes</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Total Classes: <span className="font-semibold text-teal-600">{totalClasses}</span>
          </p>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-700 text-xl font-medium">No live classes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredClasses.map((liveClass) => (
              <div
                key={liveClass._id}
                className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-teal-500"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 truncate">{liveClass.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getStatus(liveClass) === 'Live Now'
                        ? 'bg-green-100 text-green-700'
                        : getStatus(liveClass) === 'Finished'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {getStatus(liveClass)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{liveClass.description || 'No description available'}</p>
                <p className="text-sm text-teal-600 font-medium mb-2">
                  Scheduled: {new Date(liveClass.schedule).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  Link: <a href={liveClass.thumbnail || '#'} className="text-teal-600 hover:underline truncate block" target="_blank" rel="noopener noreferrer">
                    {liveClass.thumbnail || 'Not provided'}
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl p-6 z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Add New Live Class</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newClass.title}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={newClass.description}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="4"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <input
                  type="datetime-local"
                  name="schedule"
                  value={newClass.schedule}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Live Class Link</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={newClass.thumbnail}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., https://zoom.us/j/123456789"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className={`w-full p-3 font-medium rounded-lg transition duration-200 ${
                  isSubmitting
                    ? 'bg-teal-400 text-white cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scheduling...
                  </span>
                ) : (
                  'Schedule Class'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClass;