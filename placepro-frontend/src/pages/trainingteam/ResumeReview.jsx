import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext.jsx';

const ResumeReview = () => {
  const { backendUrl } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching from:', `${backendUrl}/api/team/students`);
        const response = await axios.get(`${backendUrl}/api/team/students`, { withCredentials: true });
        console.log('API Response:', response.data);
        if (response.data.success) {
          setStudents(response.data.data);
          setFilteredStudents(response.data.data);
          console.log('Students set:', response.data.data);
        } else {
          setError(response.data.message || 'Failed to load students');
        }
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [backendUrl]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleSelectStudent = (studentId) => {
    console.log('Toggling student:', studentId, 'Current selected:', selectedStudentId);
    setSelectedStudentId(selectedStudentId === studentId ? null : studentId);
    setFeedback('');
    setSuccessMessage('');
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback = async (studentId) => {
    if (!feedback) {
      setError('Feedback cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/team/submit-feedback`,
        { studentId, feedback },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccessMessage(`Feedback submitted for ${students.find(s => s._id === studentId).name}`);
        setFeedback('');
        const updatedStudents = await axios.get(`${backendUrl}/api/team/students`, { withCredentials: true });
        setStudents(updatedStudents.data.data);
        setFilteredStudents(updatedStudents.data.data);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 rounded-full border-t-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 text-xl font-semibold">Loading Students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center border-l-4 border-red-600">
          <p className="text-red-600 text-xl font-bold">{error}</p>
          <p className="text-gray-600 mt-2">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="relative mb-10">
          <h1 className="text-5xl font-extrabold text-gray-800 text-center tracking-tight">
            <span className="relative inline-block">
              Resume Review Portal
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600 rounded-full"></span>
            </span>
          </h1>
          <p className="text-center text-gray-600 mt-2">Evaluate and provide feedback on student resumes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg mx-auto p-3 rounded-full bg-white text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-100 p-4 rounded-lg text-green-700 text-center shadow-md">
            {successMessage}
          </div>
        )}

        {/* Student Cards - Two per row */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredStudents.length === 0 ? (
            <p className="text-gray-600 text-center col-span-full">No students found.</p>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student._id}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 ${
                  selectedStudentId === student._id ? 'h-auto' : 'h-24 overflow-hidden'
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleSelectStudent(student._id)}
                >
                  <h3 className="text-xl font-semibold text-gray-800 truncate">{student.name}</h3>
                  <span className="text-blue-600 font-medium">
                    {selectedStudentId === student._id ? 'Close' : 'Open'}
                  </span>
                </div>

                {/* Expanded content only for the selected student */}
                {selectedStudentId === student._id && (
                  <div className="mt-4 space-y-4">
                    {/* Resume Section */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700 font-medium">
                        <span className="text-blue-600">Resume:</span>{' '}
                        {student.resume ? (
                          <a
                            href={student.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-gray-500">Not Uploaded</span>
                        )}
                      </p>
                    </div>

                    {/* Past Feedback Section */}
                    {student.feedbacks && student.feedbacks.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-700 font-medium text-yellow-600">Past Feedback:</p>
                        <ul className="mt-2 space-y-2">
                          {student.feedbacks.map((fb, index) => (
                            <li key={index} className="text-gray-600 text-sm">
                              <span className="font-semibold">"{fb.text}"</span> -{' '}
                              <span className="text-gray-500">
                                {new Date(fb.timestamp).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Feedback Form */}
                    <textarea
                      value={feedback}
                      onChange={handleFeedbackChange}
                      placeholder="Enter your feedback here..."
                      className="w-full p-3 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                    <button
                      onClick={() => handleSubmitFeedback(student._id)}
                      disabled={submitting}
                      className={`w-full py-2 rounded-lg text-white font-semibold shadow-md ${
                        submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;