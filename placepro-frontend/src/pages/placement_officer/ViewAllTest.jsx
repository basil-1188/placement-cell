import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const ViewAllTest = () => {
  const { backendUrl } = useContext(AppContext);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/view-all-tests`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setTests(response.data.tests);
        } else {
          setError(response.data.message || 'No tests found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [backendUrl]);

  const toggleDetails = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  const handlePublish = async (testId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/officer/publish-test/${testId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setTests(tests.map(test =>
          test._id === testId ? { ...test, isPublished: true } : test
        ));
        alert('Test published successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading tests...</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mt-12 mb-10 tracking-tight">
          All Mock Tests
        </h1>
        {tests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg font-medium">No tests available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded-xl shadow-md p-6 transition duration-300 ease-in-out border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-indigo-900 truncate mb-2">
                  {test.testName}
                </h2>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-medium text-indigo-600">Type:</span> {test.testType}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  <span className="font-medium text-indigo-600">Status:</span>{' '}
                  <span className={test.isPublished ? 'text-green-600' : 'text-red-600'}>
                    {test.isPublished ? 'Published' : 'Not Published'}
                  </span>
                </p>
                {/* Full Details */}
                {expandedTest === test._id && (
                  <div className="mt-4 space-y-4 text-gray-700 animate-fade-in">
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Start Date:</span>{' '}
                      {new Date(test.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Last Day:</span>{' '}
                      {new Date(test.lastDayToAttend).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Time Limit:</span>{' '}
                      {test.timeLimit} minutes
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Max Attempts:</span>{' '}
                      {test.maxAttempts}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Pass Mark:</span>{' '}
                      {test.passMark}
                    </p>
                    <div>
                      <p className="text-sm font-medium text-indigo-600 mb-2">Questions:</p>
                      {test.questions.map((question, idx) => (
                        <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-md">
                          <p className="text-sm font-semibold">{idx + 1}. {question.text}</p>
                          <p className="text-sm">
                            <span className="font-medium">Type:</span> {question.type}
                          </p>
                          {question.type === 'mcq' && (
                            <>
                              <p className="text-sm">
                                <span className="font-medium">Options:</span>{' '}
                                {question.options.join(', ')}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Correct Answer:</span>{' '}
                                {question.correctAnswer}
                              </p>
                            </>
                          )}
                          {question.type === 'coding' && (
                            <div>
                              <p className="text-sm font-medium">Test Cases:</p>
                              <ul className="list-disc list-inside text-sm">
                                {question.codingDetails?.testCases?.map((tc, tcIdx) => (
                                  <li key={tcIdx}>
                                    Input: {tc.input}, Output: {tc.output}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => toggleDetails(test._id)}
                    className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200"
                  >
                    {expandedTest === test._id ? 'Hide Details' : 'View Details'}
                  </button>
                  {!test.isPublished && (
                    <button
                      onClick={() => handlePublish(test._id)}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllTest;

// Add to src/index.css if not already present
const styles = `
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;