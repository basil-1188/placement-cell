import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const MockTestAttendees = () => {
  const { backendUrl } = useContext(AppContext);
  const [attendeesData, setAttendeesData] = useState({
    attended: [],
    notAttended: [],
    totalAttended: 0,
    totalNotAttended: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/mock-test-attendees`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setAttendeesData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching attendees:', err);
        alert('Failed to load attendees data');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [backendUrl]);

  const uniqueTests = [...new Set(attendeesData.attended.map((student) => student.testName))].map((testName) => ({
    name: testName,
    attendedCount: attendeesData.attended.filter((s) => s.testName === testName).length,
  }));

  const attendedForTest = selectedTest
    ? attendeesData.attended.filter((student) => student.testName === selectedTest)
    : [];

  const attendedStudentIdsForTest = selectedTest
    ? new Set(attendedForTest.map((student) => student.studentId))
    : new Set();

  const notAttendedForTest = selectedTest
    ? [
        ...attendeesData.notAttended.filter((student) => !attendedStudentIdsForTest.has(student.studentId)),
        ...attendeesData.attended
          .filter((student) => !attendedStudentIdsForTest.has(student.studentId))
          .map((student) => ({
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
          })),
      ]
    : [];

  const exportToCSV = (data, filename, headers) => {
    const csvRows = data.map((row) => Object.values(row).map((val) => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-center font-extrabold text-gray-900 mb-10 tracking-tight">
          EXAM ATTENDEES DETAILS
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{attendeesData.totalStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-500">Attended (Any Test)</p>
                <p className="text-3xl font-bold text-green-600">{attendeesData.totalAttended}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-500">Not Attended (Any Test)</p>
                <p className="text-3xl font-bold text-red-600">{attendeesData.totalNotAttended}</p>
              </div>
            </div>

            {!selectedTest ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Tests</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniqueTests.map((test) => (
                    <div
                      key={test.name}
                      className="bg-gradient-to-r from-indigo-100 to-blue-100 p-6 rounded-lg shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                      onClick={() => setSelectedTest(test.name)}
                    >
                      <p className="text-lg font-medium text-indigo-900">{test.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Attended: {test.attendedCount}</p>
                      <p className="text-sm text-gray-600">
                        Not Attended: {attendeesData.totalStudents - test.attendedCount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedTest} - Attendance Overview
                  </h2>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Back to Tests
                  </button>
                </div>

                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium text-gray-700">Attended Students</h3>
                      <button
                        onClick={() =>
                          exportToCSV(
                            attendedForTest.map((s) => ({
                              'Student Name': s.studentName,
                              'Email': s.studentEmail,
                              'Completed At': new Date(s.completedAt).toLocaleString(),
                            })),
                            `${selectedTest}_attended.csv`,
                            'Student Name,Email,Completed At'
                          )
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200"
                      >
                        Export Attended
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                              Completed At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendedForTest.map((student) => (
                            <tr
                              key={`${student.studentId}-${student.mockTestId}`}
                              className="hover:bg-indigo-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.studentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student.studentEmail}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {new Date(student.completedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium text-gray-700">Not Attended Students</h3>
                      <button
                        onClick={() =>
                          exportToCSV(
                            notAttendedForTest.map((s) => ({
                              'Student Name': s.studentName,
                              'Email': s.studentEmail,
                            })),
                            `${selectedTest}_not_attended.csv`,
                            'Student Name,Email'
                          )
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                      >
                        Export Not Attended
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {notAttendedForTest.map((student) => (
                            <tr
                              key={student.studentId}
                              className="hover:bg-red-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.studentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student.studentEmail}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestAttendees;