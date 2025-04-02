import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const StudentLiveClass = () => {
  const { backendUrl } = useContext(AppContext);
  const [liveClasses, setLiveClasses] = useState([]); // Original data
  const [filteredClasses, setFilteredClasses] = useState([]); // Filtered data for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('liveClassRatings')) || {});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        console.log('Fetching from:', `${backendUrl}/api/user/live-link`);
        const response = await axios.get(`${backendUrl}/api/user/live-link`, { withCredentials: true });
        if (response.data.success) {
          setLiveClasses(response.data.data.liveClasses);
          setFilteredClasses(response.data.data.liveClasses); 
        } else {
          setError(response.data.message || 'No live classes available');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load live classes');
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClasses();
  }, [backendUrl]);

  useEffect(() => {
    localStorage.setItem('liveClassRatings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredClasses(liveClasses); 
    } else {
      const filtered = liveClasses.filter((liveClass) =>
        liveClass.title.toLowerCase().includes(term)
      );
      setFilteredClasses(filtered);
    }
  };

  const getStatus = (liveClass) => {
    const now = new Date();
    const schedule = new Date(liveClass.schedule);
    if (liveClass.isLive) return 'Live Now';
    if (schedule < now) return 'Finished';
    return 'Scheduled';
  };

  const getCountdown = (schedule) => {
    const now = new Date();
    const timeLeft = new Date(schedule) - now;
    if (timeLeft <= 0) return 'Starting soon...';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleRating = (classId, rating) => {
    setRatings((prev) => ({ ...prev, [classId]: rating }));
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
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800">Live Classes</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Total Classes: <span className="font-semibold text-teal-600">{filteredClasses.length}</span>
          </p>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-700 text-xl font-medium">No live classes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredClasses.map((liveClass) => {
              const status = getStatus(liveClass);
              return (
                <div
                  key={liveClass._id}
                  className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-teal-500"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">{liveClass.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status === 'Live Now'
                          ? 'bg-green-100 text-green-700'
                          : status === 'Finished'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{liveClass.description || 'No description available'}</p>
                  <p className="text-sm text-teal-600 font-medium mb-2">
                    Scheduled: {new Date(liveClass.schedule).toLocaleString()}
                  </p>
                  {status === 'Scheduled' && (
                    <p className="text-sm text-purple-600 font-medium mb-2">
                      Starts in: <span className="font-bold">{getCountdown(liveClass.schedule)}</span>
                    </p>
                  )}
                  {status === 'Finished' && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-700 font-medium">Class Ended</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-2">Rate this class:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(liveClass._id, star)}
                            className={`text-2xl ${
                              ratings[liveClass._id] >= star ? 'text-yellow-400' : 'text-gray-300'
                            } focus:outline-none`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-700">
                    Link:{' '}
                    <a
                      href={liveClass.thumbnail || '#'}
                      className="text-teal-700 font-bold text-base hover:underline truncate block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {liveClass.thumbnail || 'Not provided'}
                    </a>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLiveClass;