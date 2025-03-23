import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const CreateTest = () => {
  const navigate = useNavigate();

  const [testData, setTestData] = useState({
    testName: '',
    testType: 'mcq',
    questions: [],
    timeLimit: '',
    lastDayToAttend: '',
    isPublished: false,
    startDate: '',
    description: '',
    maxAttempts: 1,
    passMark: '',
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    codingDetails: { testCases: [{ input: '', output: '' }], sampleSolution: '' },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData({ ...testData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'text') {
      setCurrentQuestion({ ...currentQuestion, text: value });
    } else if (name.startsWith('option')) {
      const optionIndex = parseInt(name.split('-')[1], 10);
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    } else if (name === 'correctAnswer') {
      setCurrentQuestion({ ...currentQuestion, correctAnswer: value });
    } else if (name.startsWith('testCaseInput')) {
      const testCaseIndex = parseInt(name.split('-')[1], 10);
      const newTestCases = [...currentQuestion.codingDetails.testCases];
      newTestCases[testCaseIndex].input = value;
      setCurrentQuestion({
        ...currentQuestion,
        codingDetails: { ...currentQuestion.codingDetails, testCases: newTestCases },
      });
    } else if (name.startsWith('testCaseOutput')) {
      const testCaseIndex = parseInt(name.split('-')[1], 10);
      const newTestCases = [...currentQuestion.codingDetails.testCases];
      newTestCases[testCaseIndex].output = value;
      setCurrentQuestion({
        ...currentQuestion,
        codingDetails: { ...currentQuestion.codingDetails, testCases: newTestCases },
      });
    } else if (name === 'sampleSolution') {
      setCurrentQuestion({
        ...currentQuestion,
        codingDetails: { ...currentQuestion.codingDetails, sampleSolution: value },
      });
    }
  };

  const addTestCase = () => {
    setCurrentQuestion({
      ...currentQuestion,
      codingDetails: {
        ...currentQuestion.codingDetails,
        testCases: [...currentQuestion.codingDetails.testCases, { input: '', output: '' }],
      },
    });
  };

  const addQuestionToTest = () => {
    if (!currentQuestion.text) {
      alert('Question text is required');
      return;
    }
    if (testData.testType === 'mcq') {
      if (currentQuestion.options.some(opt => !opt) || !currentQuestion.correctAnswer) {
        alert('All options and correct answer are required for MCQ');
        return;
      }
      const mcqQuestion = {
        type: testData.testType,
        text: currentQuestion.text,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
      };
      setTestData({
        ...testData,
        questions: [...testData.questions, mcqQuestion],
      });
    } else if (testData.testType === 'coding') {
      if (currentQuestion.codingDetails.testCases.some(tc => !tc.input || !tc.output)) {
        alert('All test cases must have input and output');
        return;
      }
      const codingQuestion = {
        type: testData.testType,
        text: currentQuestion.text,
        codingDetails: {
          testCases: currentQuestion.codingDetails.testCases,
          sampleSolution: currentQuestion.codingDetails.sampleSolution,
        },
      };
      setTestData({
        ...testData,
        questions: [...testData.questions, codingQuestion],
      });
    }
    setCurrentQuestion({
      type: testData.testType,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      codingDetails: { testCases: [{ input: '', output: '' }], sampleSolution: '' },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (testData.questions.length === 0) {
      alert('At least one question is required');
      return;
    }

    console.log('Submitting to:', `${backendUrl}/api/officer/mock-test`);
    console.log('Payload:', JSON.stringify(testData, null, 2));

    try {
      const response = await axios.post(
        `${backendUrl}/api/officer/mock-test`,
        testData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('Response:', response.data);
      if (response.data.success) {
        alert('Mock test created successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating mock test:', error);
      console.log('Error response:', error.response?.data);
      if (error.code === 'ERR_NETWORK') {
        alert(`Cannot connect to ${backendUrl}. Is the server running on port 4000?`);
      } else {
        alert(error.response?.data?.message || 'Failed to create mock test');
      }
    }
  };

  return (
    <div className="max-w-5xl mt-15 mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Mock Test</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                name="testName"
                value={testData.testName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter test name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                name="testType"
                value={testData.testType}
                onChange={(e) => {
                  setTestData({ ...testData, testType: e.target.value, questions: [] });
                  setCurrentQuestion({ ...currentQuestion, type: e.target.value });
                }}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="mcq">MCQ (Aptitude)</option>
                <option value="coding">Coding</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
              <input
                type="number"
                name="timeLimit"
                value={testData.timeLimit}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={testData.startDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Day to Attend</label>
              <input
                type="date"
                name="lastDayToAttend"
                value={testData.lastDayToAttend}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Mark</label>
              <input
                type="number"
                name="passMark"
                value={testData.passMark}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
              <input
                type="number"
                name="maxAttempts"
                value={testData.maxAttempts}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={testData.isPublished}
                onChange={handleInputChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Publish Immediately</label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={testData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              placeholder="Provide a brief description of the test"
              required
            />
          </div>

          {/* Question Section */}
          <div className="bg-gray-100 p-6 rounded-md shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Question</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <input
                type="text"
                name="text"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your question here"
              />
            </div>
            {testData.testType === 'mcq' ? (
              <div className="mt-6 space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option {index + 1}</label>
                    <input
                      type="text"
                      name={`option-${index}`}
                      value={option}
                      onChange={(e) => handleQuestionChange(e, index)}
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select
                    name="correctAnswer"
                    value={currentQuestion.correctAnswer}
                    onChange={handleQuestionChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Correct Answer</option>
                    {currentQuestion.options.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt || `Option ${idx + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {currentQuestion.codingDetails.testCases.map((testCase, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input {index + 1}</label>
                      <input
                        type="text"
                        name={`testCaseInput-${index}`}
                        value={testCase.input}
                        onChange={(e) => handleQuestionChange(e, index)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Input for test case"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output {index + 1}</label>
                      <input
                        type="text"
                        name={`testCaseOutput-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleQuestionChange(e, index)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Expected output"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTestCase}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Test Case
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample Solution (Optional)</label>
                  <textarea
                    name="sampleSolution"
                    value={currentQuestion.codingDetails.sampleSolution}
                    onChange={handleQuestionChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    placeholder="Provide a sample solution (optional)"
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={addQuestionToTest}
              className="mt-6 w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Question to Test
            </button>
          </div>

          {/* Added Questions */}
          {testData.questions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Added Questions</h3>
              <ul className="space-y-4">
                {testData.questions.map((q, idx) => (
                  <li key={idx} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                    <p className="text-gray-800 font-medium">{q.text}</p>
                    {q.type === 'mcq' ? (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Correct Answer:</span> {q.correctAnswer}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Test Cases:</span> {q.codingDetails.testCases.length}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
          >
            Create Mock Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTest;