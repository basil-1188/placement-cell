import { userModel, studentModel,mockTestModel,mockTestResultModel } from "../models/userModel.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

export const addStudentDetails = async (req, res) => {
  try {
    console.log("addStudentDetails - req.user:", req.user);

    if (!req.user || !req.user._id) {
      console.log("addStudentDetails - User authentication failed:", req.user);
      return res.status(401).json({ success: false, message: "Unauthorized: User not authenticated" });
    }

    const {
      admnNo,
      phoneNo,
      dob,
      address,
      degree,
      degreeCgpa,
      plustwoPercent,
      tenthPercent,
      githubProfile,
      pgMarks,
    } = req.body;

    if (!admnNo || !phoneNo || !dob || !address || !degree || !degreeCgpa || !plustwoPercent || !tenthPercent) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({ success: false, message: "Phone number must be a 10-digit number" });
    }

    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (isNaN(dobDate.getTime()) || age < 18) {
      return res.status(400).json({ success: false, message: "Invalid date of birth or user must be at least 18 years old" });
    }

    const cgpa = parseFloat(degreeCgpa);
    const plusTwo = parseFloat(plustwoPercent);
    const tenth = parseFloat(tenthPercent);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ success: false, message: "Degree CGPA must be a number between 0 and 10" });
    }
    if (isNaN(plusTwo) || plusTwo < 0 || plusTwo > 100) {
      return res.status(400).json({ success: false, message: "Plus Two percentage must be a number between 0 and 100" });
    }
    if (isNaN(tenth) || tenth < 0 || tenth > 100) {
      return res.status(400).json({ success: false, message: "Tenth percentage must be a number between 0 and 100" });
    }

    if (githubProfile && !/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+$/.test(githubProfile)) {
      return res.status(400).json({ success: false, message: "Invalid GitHub profile URL" });
    }

    let parsedPgMarks = [];
    if (pgMarks) {
      parsedPgMarks = JSON.parse(pgMarks);
      if (!Array.isArray(parsedPgMarks)) {
        return res.status(400).json({ success: false, message: "Postgraduate marks must be an array" });
      }
      for (const mark of parsedPgMarks) {
        if (!mark.semester || !mark.cgpa) {
          return res.status(400).json({ success: false, message: "Each postgraduate mark must have a semester and CGPA" });
        }
        const semester = parseInt(mark.semester);
        const cgpa = parseFloat(mark.cgpa);
        if (isNaN(semester) || semester < 1 || semester > 8) {
          return res.status(400).json({ success: false, message: "Semester must be a number between 1 and 8" });
        }
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          return res.status(400).json({ success: false, message: "Postgraduate CGPA must be a number between 0 and 10" });
        }
      }
    }

    let resumeUrl = null;
    if (req.file) {
      try {
        const publicId = `${admnNo}_${Date.now()}`;
        resumeUrl = await uploadToCloudinary(req.file, "resumes", publicId);
        console.log("addStudentDetails - Resume URL:", resumeUrl);
      } catch (uploadError) {
        console.error("addStudentDetails - Upload error:", uploadError.message);
        return res.status(500).json({ success: false, message: `Failed to upload resume: ${uploadError.message}` });
      }
    }

    const studentId = req.user._id;
    console.log("addStudentDetails - studentId:", studentId);

    const studentDetails = await studentModel.findOneAndUpdate(
      { studentId },
      {
        admnNo,
        phoneNo,
        dob,
        address,
        degree,
        degreeCgpa: cgpa,
        plustwoPercent: plusTwo,
        tenthPercent: tenth,
        resume: resumeUrl || undefined,
        githubProfile,
        pgMarks: parsedPgMarks,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log("addStudentDetails - Updated studentDetails:", studentDetails);

    res.status(201).json({ success: true, message: "Student details added/updated successfully", data: studentDetails });
  } catch (error) {
    console.error("Error adding student details:", error.message);
    if (error.message.includes("File too large")) {
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }
    if (error.message.includes("Only PDF and DOC/DOCX files")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const studentId = req.user._id;
    console.log("getStudentDetails - Fetching details for studentId:", studentId);
    const studentDetails = await studentModel.findOne({ studentId });
    if (!studentDetails) {
      console.log("getStudentDetails - No details found for studentId:", studentId);
      return res.status(200).json({ success: false, message: "No student details found" });
    }
    console.log("getStudentDetails - Found details:", studentDetails);
    res.status(200).json({ success: true, data: studentDetails });
  } catch (error) {
    console.error("Error fetching student details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAvailableMockTests = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found' });
    }

    const now = new Date();
    const tests = await mockTestModel.find({
      isPublished: true,
      startDate: { $lte: now },
      lastDayToAttend: { $gte: now },
    }).select('testName startDate lastDayToAttend maxAttempts description');

    const availableTests = [];
    for (const test of tests) {
      const previousAttempts = await mockTestResultModel.countDocuments({
        studentId,
        mockTestId: test._id,
      });
      if (previousAttempts < test.maxAttempts) {
        availableTests.push({
          _id: test._id,
          testName: test.testName,
          startDate: test.startDate,
          lastDayToAttend: test.lastDayToAttend,
          attemptsRemaining: test.maxAttempts - previousAttempts,
          description: test.description,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Available mock tests retrieved successfully',
      data: availableTests,
    });
  } catch (error) {
    console.error('Error in getAvailableMockTests:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available tests',
      error: error.message,
    });
  }
};
export const attendMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found' });
    }

    const test = await mockTestModel.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (!test.isPublished) {
      return res.status(403).json({ success: false, message: 'This test is not yet published' });
    }

    const now = new Date();
    const startDate = new Date(test.startDate);
    const lastDayToAttend = new Date(test.lastDayToAttend);

    if (now < startDate) {
      return res.status(403).json({
        success: false,
        message: `This test is not available yet. It starts on ${startDate.toLocaleDateString()}`,
      });
    }

    if (now > lastDayToAttend) {
      return res.status(403).json({
        success: false,
        message: `This test is no longer available. It ended on ${lastDayToAttend.toLocaleDateString()}`,
      });
    }

    const previousAttempts = await mockTestResultModel.countDocuments({
      studentId,
      mockTestId: id,
    });

    if (previousAttempts >= test.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `You have exceeded the maximum attempts (${test.maxAttempts}) for this test`,
      });
    }

    const testDetails = {
      testName: test.testName,
      testType: test.testType,
      questions: test.questions.map((q) => ({
        _id: q._id,
        type: q.type,
        text: q.text,
        ...(q.type === 'mcq' ? { options: q.options } : { codingDetails: { testCases: q.codingDetails.testCases } }),
      })),
      timeLimit: test.timeLimit,
      startDate: test.startDate,
      lastDayToAttend: test.lastDayToAttend,
      description: test.description,
      maxAttempts: test.maxAttempts,
      passMark: test.passMark,
      totalQuestions: test.questions.length,
    };

    res.status(200).json({
      success: true,
      message: 'Test loaded successfully',
      data: testDetails,
    });
  } catch (error) {
    console.error('Error in attendMockTest:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while loading test',
      error: error.message,
    });
  }
};

export const submitMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?._id;
    const { answers, timeTaken, startedAt } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found' });
    }

    if (!answers || typeof answers !== 'object' || !timeTaken || !startedAt) {
      return res.status(400).json({ success: false, message: 'Answers, timeTaken, and startedAt are required' });
    }

    const test = await mockTestModel.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const previousAttempts = await mockTestResultModel.countDocuments({
      studentId,
      mockTestId: id,
    });

    if (previousAttempts >= test.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `You have exceeded the maximum attempts (${test.maxAttempts}) for this test`,
      });
    }

    let mark = 0;
    let wrongAnswers = 0;
    let notAnswered = 0;
    const totalQuestions = test.questions.length;
    const questionsAnswered = [];

    test.questions.forEach((question, idx) => {
      const studentAnswer = answers[idx.toString()];
      const answerObj = { questionIndex: idx, isCorrect: false };

      if (question.type === 'mcq') {
        answerObj.selectedAnswer = studentAnswer || null; // Null for unanswered MCQs
        if (studentAnswer) {
          answerObj.isCorrect = studentAnswer === question.correctAnswer;
          if (answerObj.isCorrect) mark += 1;
          else wrongAnswers += 1;
        } else {
          notAnswered += 1;
        }
      } else if (question.type === 'coding') {
        answerObj.codingAnswer = studentAnswer || null; // Null for unanswered coding
        if (studentAnswer) {
          const testCaseResults = question.codingDetails.testCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
            passed: false, // Replace with actual evaluation logic
          }));
          answerObj.testCaseResults = testCaseResults;
          answerObj.isCorrect = testCaseResults.every(() => true); // Placeholder
          if (answerObj.isCorrect) mark += 1;
          else wrongAnswers += 1;
        } else {
          answerObj.testCaseResults = []; // Empty array for unanswered coding
          notAnswered += 1;
        }
      }

      questionsAnswered.push(answerObj);
    });

    const percentage = (mark / totalQuestions) * 100;
    const passed = mark >= test.passMark;

    const result = new mockTestResultModel({
      studentId,
      mockTestId: id,
      mark,
      timeTaken,
      questionsAnswered,
      notAnswered,
      wrongAnswers,
      totalQuestions,
      completedAt: new Date(),
      status: 'completed',
      attemptNumber: previousAttempts + 1,
      percentage,
      passed,
      startedAt: new Date(startedAt),
      feedback: passed ? 'Good job!' : 'Review your answers and try again.',
    });

    // Populate mockTestId before saving to ensure validation works
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        mark,
        totalQuestions,
        percentage,
        passed,
        attemptNumber: previousAttempts + 1,
      },
    });
  } catch (error) {
    console.error('Error in submitMockTest:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting test',
      error: error.message,
    });
  }
};