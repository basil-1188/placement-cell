import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const MockTestMarks = () => {
  const { backendUrl } = useContext(AppContext);
  const [testResults, setTestResults] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/team/marks`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const groupedByStudent = response.data.data.tests.reduce((acc, result) => {
            const studentId = result.studentId;
            if (!acc[studentId]) {
              acc[studentId] = {
                studentId,
                studentName: result.studentName,
                studentEmail: result.studentEmail,
                tests: [],
              };
            }
            acc[studentId].tests.push({
              testName: result.testName,
              marks: result.marks,
              fullMarks: result.fullMarks,
              percentage: result.percentage,
              passMark: result.passMark,
              passed: result.passed,
              completedAt: result.completedAt,
            });
            return acc;
          }, {});
          const studentList = Object.values(groupedByStudent);
          setTestResults(studentList);
          setFilteredStudents(studentList);
          setTotalStudents(response.data.data.totalStudents);
        } else {
          setError(response.data.message || 'No test results found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };
    fetchTestResults();
  }, [backendUrl]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = testResults.filter(
      (student) =>
        student.studentName.toLowerCase().includes(term) ||
        student.studentEmail.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  const openModal = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-teal-500 mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading Test Results...</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-4 pl-12 pr-4 rounded-lg bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-200"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-teal-600"
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
          <h1 className="text-4xl font-extrabold text-gray-800">Mock Test Results</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Total Students: <span className="font-semibold text-teal-600">{totalStudents}</span> | 
            Students with Tests: <span className="font-semibold text-teal-600">{testResults.length}</span>
          </p>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-700 text-xl font-medium">
              No students found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div
                key={student.studentId}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl">
                      {student.studentName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{student.studentName}</h2>
                      <p className="text-sm text-gray-600">{student.studentEmail}</p>
                      <p className="text-sm text-teal-600 font-medium mt-1">
                        Tests Taken: {student.tests.length}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openModal(student)}
                  className="w-full p-3 bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
                >
                  View Test Details
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{selectedStudent.studentName}'s Test Results</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {selectedStudent.tests.map((test, idx) => (
                    <div
                      key={idx}
                      className="bg-teal-50 rounded-md p-4 border border-teal-200 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-teal-700">{test.testName}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            test.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {test.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                        <p>
                          <span className="font-medium text-teal-600">Marks:</span> {test.marks}/{test.fullMarks}
                        </p>
                        <p>
                          <span className="font-medium text-teal-600">Percentage:</span> {test.percentage.toFixed(0)}%
                        </p>
                        <p>
                          <span className="font-medium text-teal-600">Pass Mark:</span> {test.passMark}
                        </p>
                        <p>
                          <span className="font-medium text-teal-600">Completed:</span> {new Date(test.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestMarks;