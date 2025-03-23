import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const StudentLists = () => {
  const { backendUrl } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/get-user-details`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setStudents(response.data.students);
        } else {
          setError(response.data.message || 'No student details found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetails();
  }, [backendUrl]);

  const toggleDetails = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading student details...</p>
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
          Student Details
        </h1>
        {students.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg font-medium">
              No student details available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-xl shadow-md p-6 transition duration-300 ease-in-out border border-gray-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={student.profileImage || 'https://via.placeholder.com/50'}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-indigo-900 truncate">
                      {student.name}
                    </h2>
                    <p className="text-gray-600 text-sm">{student.email}</p>
                  </div>
                </div>
                {/* Minimal Details */}
                <div className="space-y-2 text-gray-700">
                  <p className="text-sm">
                    <span className="font-medium text-indigo-600">Admission No:</span>{' '}
                    {student.admnNo || 'N/A'}
                  </p>
                </div>
                {/* Full Details */}
                {expandedStudent === student._id && (
                  <div className="mt-4 space-y-2 text-gray-700 animate-fade-in">
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Phone:</span>{' '}
                      {student.phoneNo || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">DOB:</span>{' '}
                      {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Address:</span>{' '}
                      {student.address || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Degree:</span>{' '}
                      {student.degree || 'N/A'} {student.degreeCgpa ? `(${student.degreeCgpa})` : ''}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Plus Two:</span>{' '}
                      {student.plustwoPercent ? `${student.plustwoPercent}%` : 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Tenth:</span>{' '}
                      {student.tenthPercent ? `${student.tenthPercent}%` : 'N/A'}
                    </p>
                    {student.pgMarks && student.pgMarks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-indigo-600">PG Marks:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {student.pgMarks.map((mark, idx) => (
                            <li key={idx}>
                              Semester {mark.semester}: {mark.cgpa || 'N/A'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Resume:</span>{' '}
                      {student.resume ? (
                        <a href={student.resume} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                          View Resume
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">GitHub:</span>{' '}
                      {student.githubProfile ? (
                        <a href={student.githubProfile} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                          {student.githubProfile}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => toggleDetails(student._id)}
                  className="mt-4 w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200"
                >
                  {expandedStudent === student._id ? 'Hide Details' : 'View Full Details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLists;

// Ensure this CSS is in your global stylesheet (e.g., src/index.css)
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