import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext.jsx';

const TakeTestList = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableTests = async () => {
      try {
        console.log('Fetching from:', `${backendUrl}/api/user/available-tests`);
        const response = await axios.get(`${backendUrl}/api/user/available-tests`, {
          withCredentials: true,
        });
        console.log('Fetch response:', response.data);
        if (response.data.success) {
          setTests(response.data.data);
        } else {
          setError('No available tests found');
        }
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load available tests');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableTests();
  }, [backendUrl]);

  const handleTestClick = (testId) => {
    console.log('Navigating to:', `/user/mock-tests/take-test/${testId}`);
    navigate(`/user/mock-tests/take-test/${testId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading available tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mt-12 mb-10 tracking-tight">
          Available Mock Tests
        </h1>
        {tests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg font-medium">
              No tests available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                onClick={() => handleTestClick(test._id)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-indigo-900 mb-3 truncate">
                  {test.testName}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                <div className="space-y-2 text-gray-700">
                  <p className="text-sm">
                    <span className="font-medium text-indigo-600">Start Date:</span>{' '}
                    {new Date(test.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-indigo-600">Last Day:</span>{' '}
                    {new Date(test.lastDayToAttend).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-indigo-600">Attempts Left:</span>{' '}
                    {test.attemptsRemaining}
                  </p>
                </div>
                <button
                  className="mt-6 w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200"
                >
                  Take Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeTestList;