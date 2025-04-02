import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const StudentFeedback = () => {
  const { backendUrl } = useContext(AppContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/resume/manual-feedbacks`, { withCredentials: true });
        if (response.data.success) {
          setFeedbacks(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load feedback');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-800 text-lg font-medium">Loading Feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-red-500 max-w-md">
          <p className="text-red-600 text-2xl font-semibold mb-2">{error}</p>
          <p className="text-gray-600">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-12">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
          My Resume Feedback
        </h1>
        <p className="text-center text-gray-600 mb-10">Insights from the training team to enhance your resume</p>

        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600 text-lg">No feedback available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((feedback, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-t-4 border-indigo-500"
              >
                <p className="text-gray-800 mb-4">
                  <span className="font-semibold text-indigo-600">Feedback:</span>{' '}
                  <span className="bg-yellow-100 px-2 py-1 rounded-md text-gray-900 font-medium">
                    {feedback.feedback}
                  </span>
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-semibold text-indigo-600">Reviewed By:</span>{' '}
                  {feedback.reviewedBy}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-semibold text-indigo-600">Date:</span>{' '}
                  {feedback.reviewedAt
                    ? new Date(feedback.reviewedAt).toLocaleString()
                    : 'Pending'}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold text-indigo-600">Type:</span>{' '}
                  {feedback.reviewType}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;