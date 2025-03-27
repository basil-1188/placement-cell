import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const TestHistory = () => {
  const { backendUrl } = useContext(AppContext);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/past-results`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setTestHistory(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch test history');
        }
      } catch (err) {
        console.error('Error fetching test history:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load test history');
      } finally {
        setLoading(false);
      }
    };
    fetchTestHistory();
  }, [backendUrl]);

  const formatTimeTaken = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const exportToCSV = () => {
    const headers = 'Test Name,Marks,Total Questions,Full Marks,Pass Mark,Percentage,Status,Time Taken,Completed At,Attempt Number,Not Answered,Wrong Answers';
    const csvRows = testHistory.map((test) =>
      [
        test.testName,
        test.marks,
        test.totalQuestions,
        test.fullMarks,
        test.passMark,
        test.percentage,
        test.passed ? 'Passed' : 'Failed',
        formatTimeTaken(test.timeTaken),
        new Date(test.completedAt).toLocaleString(),
        test.attemptNumber,
        test.notAnswered,
        test.wrongAnswers,
      ]
        .map((val) => `"${val}"`)
        .join(',')
    ).join('\n');
    const csv = `${headers}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_history.csv';
    a.click();
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index); // Toggle expansion
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading your test history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            TEST RESULTS
          </h1>
          {testHistory.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Export to CSV
            </button>
          )}
        </div>

        {testHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Test History</h2>
            <p className="text-gray-600">You haven’t completed any tests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Completed At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testHistory.map((test, index) => (
                    <React.Fragment key={`${test.testName}-${test.completedAt}-${index}`}>
                      <tr
                        className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => toggleRow(index)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.testName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {test.marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {test.percentage.toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {test.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(test.completedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                          {expandedRow === index ? 'Hide' : 'Show'}
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr className="bg-gray-50">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                              <div>
                                <span className="font-semibold">Total Questions:</span> {test.totalQuestions}
                              </div>
                              <div>
                                <span className="font-semibold">Full Marks:</span> {test.fullMarks}
                              </div>
                              <div>
                                <span className="font-semibold">Pass Mark:</span> {test.passMark}
                              </div>
                              <div>
                                <span className="font-semibold">Time Taken:</span> {formatTimeTaken(test.timeTaken)}
                              </div>
                              <div>
                                <span className="font-semibold">Attempt Number:</span> {test.attemptNumber}
                              </div>
                              <div>
                                <span className="font-semibold">Not Answered:</span> {test.notAnswered}
                              </div>
                              <div>
                                <span className="font-semibold">Wrong Answers:</span> {test.wrongAnswers}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;