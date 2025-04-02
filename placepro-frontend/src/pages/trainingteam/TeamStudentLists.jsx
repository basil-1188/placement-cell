import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const TeamStudentLists = () => {
  const { backendUrl } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/team/get-user-details`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setStudents(response.data.students);
          setFilteredStudents(response.data.students);
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        (student.admnNo && student.admnNo.toLowerCase().includes(term))
    );
    setFilteredStudents(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-bounce h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
            S
          </div>
          <p className="text-gray-800 text-lg font-semibold">Loading Students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center border-t-4 border-red-500">
          <p className="text-red-600 text-2xl font-bold">{error}</p>
          <p className="text-gray-600 mt-2">Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by name, email, or admission no..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-4 pl-12 rounded-lg bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-lg border border-gray-200"
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

        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-12">
          Student Directory
        </h1>

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
                key={student._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={student.profileImage || 'https://via.placeholder.com/48?text=S'}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{student.name}</h2>
                      <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-teal-600 font-medium">
                          <span className="font-medium text-teal-600">ADMN NO: </span>
                          {student.admnNo || 'N/A'}
                        </p>
                    </div>
                  </div>
                </div>
                {expandedStudent === student._id && (
                  <div className="p-6 bg-teal-50 animate-slide-down">
                    <div className="space-y-2 text-gray-700">
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">Phone:</span>{' '}
                        {student.phoneNo || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">DOB:</span>{' '}
                        {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">Address:</span>{' '}
                        {student.address || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">Degree:</span>{' '}
                        {student.degree || 'N/A'} {student.degreeCgpa ? `(${student.degreeCgpa})` : ''}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">Plus Two:</span>{' '}
                        {student.plustwoPercent ? `${student.plustwoPercent}%` : 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-teal-600">Tenth:</span>{' '}
                        {student.tenthPercent ? `${student.tenthPercent}%` : 'N/A'}
                      </p>
                      {student.pgMarks && student.pgMarks.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-teal-600">PG Marks:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {student.pgMarks.map((mark, idx) => (
                              <li key={idx}>
                                Sem {mark.semester}: {mark.cgpa || 'N/A'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toggleDetails(student._id)}
                  className="w-full p-3 bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                >
                  {expandedStudent === student._id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStudentLists;

const styles = `
  .animate-slide-down {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;