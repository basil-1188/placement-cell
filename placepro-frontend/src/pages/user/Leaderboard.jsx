import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const Leaderboard = () => {
  const { backendUrl } = useContext(AppContext);
  const [overallRankings, setOverallRankings] = useState([]);
  const [testRankings, setTestRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState('overall'); 

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/ranks`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOverallRankings(response.data.data.overallRankings);
          setTestRankings(response.data.data.testRankings);
        } else {
          throw new Error(response.data.message || 'Failed to fetch rankings');
        }
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen mt-15 bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topThree = overallRankings.slice(0, 3);

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-900 text-center mb-12">Leaderboard</h1>

        {overallRankings.length > 0 && (
          <div className="flex justify-center gap-6 mb-12">
            {topThree.map((student, index) => (
              <div
                key={student.studentEmail}
                className={`flex flex-col items-center p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 ${
                  index === 0 ? 'bg-yellow-100 order-2 mt-0 h-64 w-48' :
                  index === 1 ? 'bg-gray-200 order-1 mt-12 h-56 w-40' :
                  'bg-orange-100 order-3 mt-16 h-48 w-36'
                }`}
              >
                <div className="text-3xl font-bold text-indigo-900 mb-2">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="text-xl font-semibold text-gray-800">{student.studentName}</div>
                <div className="text-sm text-gray-600">{student.studentEmail}</div>
                <div className="text-lg font-medium text-indigo-700 mt-2">{student.averagePercentage}%</div>
                <div className="text-sm text-gray-500">Avg. Percentage</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-2">Select Rankings</label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            >
              <option value="overall">Overall Rankings</option>
              {Object.entries(testRankings).map(([testId, { testName }]) => (
                <option key={testId} value={testId}>{testName}</option>
              ))}
            </select>
          </div>

          {selectedTest === 'overall' ? (
            overallRankings.length === 0 ? (
              <p className="text-center text-gray-600">No overall rankings available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Total Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Tests Taken</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Avg. Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overallRankings.map((student) => (
                      <tr key={student.studentEmail} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.studentEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.totalMarks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.testsTaken}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.averagePercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            testRankings[selectedTest]?.rankings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testRankings[selectedTest].rankings.map((student) => (
                      <tr key={student.studentEmail} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.studentEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.mark}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600">No rankings available for this test.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;