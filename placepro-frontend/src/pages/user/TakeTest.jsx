import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext.jsx';

const TakeTest = () => {
  const { backendUrl } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/attend-test/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setTest(response.data.data);
          setTimeRemaining(response.data.data.timeLimit * 60);
        } else {
          setError('Test not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, backendUrl]);

  useEffect(() => {
    let timer;
    if (isTestStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeRemaining]);

  const canTakeTest = () => {
    if (!test) return false;
    const now = new Date();
    const start = new Date(test.startDate);
    const end = new Date(test.lastDayToAttend);
    return now >= start && now <= end;
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
    setTimeStarted(Date.now());
  };

  const handleAnswerChange = (questionIdx, value) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: value }));
  };

  const handleSubmit = async () => {
    if (!timeStarted) return;
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);
    const startedAt = new Date(timeStarted).toISOString();

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/submit-test/${id}`,
        { answers, timeTaken, startedAt },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        alert('Test submitted successfully!')
        navigate('/'); 
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit test');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading test...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          {!isTestStarted ? (
            <div className="space-y-8">
              <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
                {test.testName}
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4">
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">Time Limit:</span>{' '}
                  {test.timeLimit} minutes
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">Start Date:</span>{' '}
                  {new Date(test.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">Last Day to Attend:</span>{' '}
                  {new Date(test.lastDayToAttend).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">Attempts Remaining:</span>{' '}
                  {test.maxAttempts - (test.attemptsTaken || 0)}
                </p>
              </div>
              {canTakeTest() ? (
                <button
                  onClick={handleStartTest}
                  className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  Start Test Now
                </button>
              ) : (
                <p className="text-center text-red-600 font-medium bg-red-50 p-4 rounded-lg">
                  This test is not available now. Please check the dates or attempt limit.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50 p-4 rounded-lg shadow-sm">
                <h2 className="text-3xl font-bold text-indigo-900 mb-4 sm:mb-0">
                  {test.testName}
                </h2>
                <p className="text-lg font-medium text-gray-800">
                  Time Remaining:{' '}
                  <span className="text-indigo-600 font-semibold">{formatTime(timeRemaining)}</span>
                </p>
              </div>
              <div className="space-y-8">
                {test.questions.map((question, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200"
                  >
                    <p className="text-gray-900 font-semibold text-lg mb-4">
                      {idx + 1}. {question.text}
                    </p>
                    {question.type === 'mcq' ? (
                      <div className="space-y-3">
                        {question.options.map((option, optIdx) => (
                          <label
                            key={optIdx}
                            className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-indigo-50 transition duration-150"
                          >
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              value={option}
                              checked={answers[idx] === option}
                              onChange={(e) => handleAnswerChange(idx, e.target.value)}
                              className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-gray-800 text-base">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[idx] || ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 placeholder-gray-400 resize-none"
                        rows="6"
                        placeholder="Write your code here..."
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Submit Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeTest;