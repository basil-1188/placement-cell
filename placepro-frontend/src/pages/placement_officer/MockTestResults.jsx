import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { useLocation } from "react-router-dom";

const MockTestResults = () => {
  const { backendUrl } = useContext(AppContext);
  const [resultsData, setResultsData] = useState({
    tests: [],
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const location = useLocation();

  console.log("MockTestResults - Current location:", location.pathname);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/check-results`, {
          withCredentials: true,
        });
        console.log("API Response:", response.data);
        if (response.data.success) {
          const tests = Array.isArray(response.data.data.tests) ? response.data.data.tests : [];
          setResultsData({
            tests,
            totalStudents: response.data.data.totalStudents || 0,
          });
        } else {
          throw new Error(response.data.message || "API request failed");
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load results data");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [backendUrl]);

  const uniqueTests = [...new Set((resultsData.tests || []).map((test) => test.testName))].map((testName) => {
    const testResults = (resultsData.tests || []).filter((t) => t.testName === testName);
    return {
      name: testName,
      participants: testResults.length,
    };
  });

  const testResults = selectedTest
    ? (resultsData.tests || [])
        .filter((test) => test.testName === selectedTest)
        .sort((a, b) => b.marks - a.marks)
        .map((test, index) => ({
          ...test,
          rank: index + 1,
        }))
    : [];

  const selectedTestDetails = selectedTest
    ? resultsData.tests.find((test) => test.testName === selectedTest) || {}
    : {};

  const overallRanking = (resultsData.tests || [])
    .reduce((acc, test) => {
      const existing = acc.find((s) => s.studentId === test.studentId);
      const percentage = (test.marks / test.fullMarks) * 100; // Calculate percentage for this test
      if (existing) {
        existing.totalMarks += test.marks;
        existing.totalFullMarks += test.fullMarks;
        existing.testPercentages.push(percentage);
        existing.testsTaken += 1;
      } else {
        acc.push({
          studentId: test.studentId,
          studentName: test.studentName,
          studentEmail: test.studentEmail,
          totalMarks: test.marks,
          totalFullMarks: test.fullMarks,
          testPercentages: [percentage],
          testsTaken: 1,
        });
      }
      return acc;
    }, [])
    .map((student) => ({
      ...student,
      totalPercentage: (
        student.testPercentages.reduce((sum, perc) => sum + perc, 0) / student.testsTaken
      ).toFixed(2), // Average of all test percentages
    }))
    .sort((a, b) => b.totalPercentage - a.totalPercentage)
    .map((student, index) => ({ ...student, rank: index + 1 }));

  const exportToCSV = (data, filename, headers) => {
    const csvRows = data.map((row) => Object.values(row).map((val) => `"${val}"`).join(",")).join("\n");
    const csv = `${headers}\n${csvRows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Error</h1>
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-center font-extrabold text-gray-900 mb-10 tracking-tight">
          Mock Test Results
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{resultsData.totalStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-500">Tests Conducted</p>
                <p className="text-3xl font-bold text-blue-600">{uniqueTests.length}</p>
              </div>
            </div>

            {!selectedTest ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Test Summary</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uniqueTests.map((test) => (
                      <div
                        key={test.name}
                        className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                        onClick={() => setSelectedTest(test.name)}
                      >
                        <p className="text-lg font-medium text-blue-900">{test.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Participants: {test.participants}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Overall Student Ranking</h2>
                    <button
                      onClick={() =>
                        exportToCSV(
                          overallRanking.map((s) => ({
                            Rank: s.rank,
                            "Student Name": s.studentName,
                            Email: s.studentEmail,
                            "Total Marks": s.totalMarks,
                            "Tests Taken": s.testsTaken,
                            "Total Percentage": s.totalPercentage,
                          })),
                          "overall_ranking.csv",
                          "Rank,Student Name,Email,Total Marks,Tests Taken,Total Percentage"
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                    >
                      Export Overall Ranking
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Total Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Tests Taken
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                            Total Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overallRanking.map((student) => (
                          <tr
                            key={student.studentId}
                            className="hover:bg-blue-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {student.studentEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {student.totalMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {student.testsTaken}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {student.totalPercentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedTest} - Results{" "}
                    <span className="text-sm text-gray-600">
                      (Total Questions: {selectedTestDetails.totalQuestions}, Full Marks:{" "}
                      {selectedTestDetails.fullMarks}, Pass Mark: {selectedTestDetails.passMark})
                    </span>
                  </h2>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                  >
                    Back to Tests
                  </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium text-gray-700">Student Scores & Ranking</h3>
                  <button
                    onClick={() =>
                      exportToCSV(
                        testResults.map((s) => ({
                          Rank: s.rank,
                          "Student Name": s.studentName,
                          Email: s.studentEmail,
                          Marks: s.marks,
                          Percentage: s.percentage,
                          "Completed At": new Date(s.completedAt).toLocaleString(),
                          Status: s.passed ? "Passed" : "Failed",
                        })),
                        `${selectedTest}_results.csv`,
                        "Rank,Student Name,Email,Marks,Percentage,Completed At,Status"
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200"
                  >
                    Export Results
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Completed At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((student) => (
                        <tr
                          key={`${student.studentId}-${student.mockTestId}`}
                          className="hover:bg-green-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.studentEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.marks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(student.completedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.passed ? "Passed" : "Failed"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestResults;