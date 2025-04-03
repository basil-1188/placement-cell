import { userModel, studentModel,mockTestModel,mockTestResultModel,jobModel,jobApplicationModel,Blog,StudyMaterial,Video,ResumeReview } from "../models/userModel.js";
import { uploadToCloudinary,deleteResumeByUrl,deleteFromCloudinary } from "../utils/Cloudinary.js";

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
        if (isNaN(semester) || semester < 1 || semester > 4) {
          return res.status(400).json({ success: false, message: "Semester must be a number between 1 and 4" });
        }
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          return res.status(400).json({ success: false, message: "Postgraduate CGPA must be a number between 0 and 10" });
        }
      }
    }

    const studentId = req.user._id;
    let resumeUrl = null;

    const existingStudent = await studentModel.findOne({ studentId });

    if (req.file) {
      if (existingStudent?.resume) {
        console.log("Old resume URL:", existingStudent.resume);
        try {
          await deleteResumeByUrl(existingStudent.resume);
          console.log(`Deleted old resume from Cloudinary`);
        } catch (deleteError) {
          console.error("Failed to delete old resume (continuing anyway):", deleteError.message);
        }
      }
      const allowedResumeTypes = ["application/pdf"];
      if (!allowedResumeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, message: "Only PDF files are allowed for resumes" });
      }
      const publicId = `${admnNo}_${Date.now()}`;
      console.log("Uploading new resume with publicId:", publicId);
      const uploadResult = await uploadToCloudinary(req.file, "resumes", publicId);
      resumeUrl = uploadResult.url;
      console.log("addStudentDetails - New Resume URL:", resumeUrl);
      if (!resumeUrl.endsWith(".pdf")) {
        console.error("Uploaded resume is not a PDF:", resumeUrl);
        throw new Error("Uploaded resume is not stored as a PDF");
      }
    } else {
      resumeUrl = existingStudent?.resume || null;
    }

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
        resume: resumeUrl,
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

export const deleteStudentResume = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await studentModel.findOne({ studentId });
    if (!student || !student.resume) {
      return res.status(404).json({ success: false, message: "No resume found to delete" });
    }

    console.log("Resume URL from database:", student.resume);

    const deleteResult = await deleteResumeByUrl(student.resume);

    if (deleteResult.success || deleteResult.notFound) {
      student.resume = null;
      await student.save();
      console.log("Resume cleared from database");
      res.status(200).json({ success: true, message: "Resume deleted successfully" });
    } else {
      throw new Error("Unexpected deletion result");
    }
  } catch (error) {
    console.error("Error deleting resume:", error.message);
    res.status(500).json({ success: false, message: `Failed to delete resume: ${error.message}` });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not authenticated" });
    }

    console.log("updateProfileImage - req.user:", req.user); // Log to verify email
    const userId = req.user._id;
    const existingUser = await userModel.findById(userId);

    let profileImageUrl = null;

    if (req.file) {
      if (existingUser?.profileImage) {
        console.log("Old profile image URL:", existingUser.profileImage);
        try {
          const urlParts = existingUser.profileImage.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const publicId = `${urlParts[urlParts.length - 3]}/${urlParts[urlParts.length - 2]}/${fileName.split(".")[0]}`;
          await deleteFromCloudinary(publicId, "image");
          console.log(`Deleted old profile image from Cloudinary: ${publicId}`);
        } catch (deleteError) {
          console.error("Failed to delete old profile image (continuing anyway):", deleteError.message);
        }
      }

      const publicId = `${req.user.email || "user_" + userId}_${Date.now()}`; // Fallback if email is missing
      console.log("Uploading new profile image with publicId:", publicId);
      const uploadResult = await uploadToCloudinary(req.file, "profile", publicId);
      profileImageUrl = uploadResult.url;
      console.log("updateProfileImage - New Profile Image URL:", profileImageUrl);

      await userModel.findByIdAndUpdate(userId, { profileImage: profileImageUrl });
    } else {
      return res.status(400).json({ success: false, message: "No profile image provided" });
    }

    res.status(200).json({ success: true, message: "Profile image updated successfully", profileImage: profileImageUrl });
  } catch (error) {
    console.error("Error updating profile image:", error.message);
    if (error.message.includes("Only image files")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: `Failed to update profile image: ${error.message}` });
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
      lastDayToAttend: { $gte: now }, 
    }).select('testName startDate lastDayToAttend maxAttempts description');

    const availableTests = [];
    for (const test of tests) {
      const previousAttempts = await mockTestResultModel.countDocuments({
        studentId,
        mockTestId: test._id,
      });
      if (previousAttempts < test.maxAttempts) {
        const isAvailableNow = now >= new Date(test.startDate);
        availableTests.push({
          _id: test._id,
          testName: test.testName,
          startDate: test.startDate,
          lastDayToAttend: test.lastDayToAttend,
          attemptsRemaining: test.maxAttempts - previousAttempts,
          description: test.description,
          isAvailableNow, 
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

    if (now < startDate || now > lastDayToAttend) {
      return res.status(403).json({
        success: false,
        message: 'This test is not available at this time',
      });
    }

    const previousResults = await mockTestResultModel.findOne({
      studentId,
      mockTestId: id,
      status: 'started',
    });

    if (previousResults) {
      return res.status(403).json({
        success: false,
        message: 'You have an ongoing test attempt. Please complete it or it will be auto-submitted.',
      });
    }

    const previousAttempts = await mockTestResultModel.countDocuments({
      studentId,
      mockTestId: id,
      status: 'completed',
    });

    if (previousAttempts >= test.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `You have exceeded the maximum attempts (${test.maxAttempts}) for this test`,
      });
    }

    const initialResult = new mockTestResultModel({
      studentId,
      mockTestId: id,
      mark: 0,
      timeTaken: 0,
      questionsAnswered: [],
      notAnswered: test.questions.length,
      wrongAnswers: 0,
      totalQuestions: test.questions.length,
      status: 'started',
      attemptNumber: previousAttempts + 1,
      percentage: 0,
      passed: false,
      startedAt: new Date(),
    });
    await initialResult.save();

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
    const { answers = {}, timeTaken, startedAt } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found' });
    }

    const test = await mockTestModel.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const existingResult = await mockTestResultModel.findOne({
      studentId,
      mockTestId: id,
      status: 'started',
    });

    if (!existingResult) {
      return res.status(403).json({
        success: false,
        message: 'No active test session found. Start the test first.',
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
        answerObj.selectedAnswer = studentAnswer || null;
        if (studentAnswer) {
          answerObj.isCorrect = studentAnswer === question.correctAnswer;
          if (answerObj.isCorrect) mark += 1;
          else wrongAnswers += 1;
        } else {
          notAnswered += 1;
        }
      } else if (question.type === 'coding') {
        answerObj.codingAnswer = studentAnswer || null;
        if (studentAnswer) {
          const testCaseResults = question.codingDetails.testCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
            passed: false, 
          }));
          answerObj.testCaseResults = testCaseResults;
          answerObj.isCorrect = testCaseResults.every(() => true); // Placeholder
          if (answerObj.isCorrect) mark += 1;
          else wrongAnswers += 1;
        } else {
          answerObj.testCaseResults = [];
          notAnswered += 1;
        }
      }

      questionsAnswered.push(answerObj);
    });

    const percentage = (mark / totalQuestions) * 100;
    const passed = mark >= test.passMark;


    existingResult.mark = mark;
    existingResult.timeTaken = timeTaken;
    existingResult.questionsAnswered = questionsAnswered;
    existingResult.notAnswered = notAnswered;
    existingResult.wrongAnswers = wrongAnswers;
    existingResult.totalQuestions = totalQuestions;
    existingResult.completedAt = new Date();
    existingResult.status = 'completed';
    existingResult.percentage = percentage;
    existingResult.passed = passed;
    existingResult.startedAt = new Date(startedAt);

    await existingResult.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        mark,
        totalQuestions,
        percentage,
        passed,
        attemptNumber: existingResult.attemptNumber,
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

export const pastResults = async (req, res) => {
  const studentId = req.user?._id;
  if (!studentId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found' });
  }

  try {
    const testResults = await mockTestResultModel
      .find({ studentId }) 
      .populate("mockTestId", "testName questions passMark timeLimit") 
      .lean();

    if (!testResults || testResults.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No past test results found for this student',
      });
    }

    const pastResultsData = testResults.map((result) => {
      const totalQuestions = result.mockTestId.questions.length;
      const fullMarks = totalQuestions; 
      return {
        testName: result.mockTestId.testName,
        marks: result.mark,
        totalQuestions,
        fullMarks,
        passMark: result.mockTestId.passMark,
        percentage: result.percentage,
        passed: result.passed,
        timeTaken: result.timeTaken, 
        completedAt: result.completedAt,
        attemptNumber: result.attemptNumber,
        timeLimit: result.mockTestId.timeLimit, 
        notAnswered: result.notAnswered,
        wrongAnswers: result.wrongAnswers,
        questionsAnswered: result.questionsAnswered.map((qa) => ({
          questionIndex: qa.questionIndex,
          selectedAnswer: qa.selectedAnswer,
          codingAnswer: qa.codingAnswer,
          isCorrect: qa.isCorrect,
          testCaseResults: qa.testCaseResults, 
        })),
        startedAt: result.startedAt,
        feedback: result.feedback || 'No feedback provided',
      };
    });

    res.status(200).json({
      success: true,
      data: pastResultsData,
      message: 'Past test results retrieved successfully',
    });
  } catch (error) {
    console.error("pastResults error:", error.stack);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getRanks = async (req, res) => {
  try {
    const testResults = await mockTestResultModel
      .find({}, "studentId mark mockTestId completedAt passed")
      .populate("studentId", "name email")
      .populate("mockTestId", "testName questions") 
      .lean();

    if (!testResults || testResults.length === 0) {
      return res.status(200).json({
        success: true,
        data: { overallRankings: [], testRankings: {} },
        message: "No test results available for ranking",
      });
    }

    const overallRankings = testResults
      .reduce((acc, result) => {
        const studentId = result.studentId._id.toString();
        const totalMarks = result.mockTestId.questions.length; 
        const percentage = (result.mark / totalMarks) * 100;
        const existing = acc.find((s) => s.studentId === studentId);
        if (existing) {
          existing.totalMarks += result.mark;
          existing.testsTaken += 1;
          existing.percentages.push(percentage);
          existing.latestCompletedAt = result.completedAt > existing.latestCompletedAt
            ? result.completedAt
            : existing.latestCompletedAt;
        } else {
          acc.push({
            studentId,
            studentName: result.studentId.name,
            studentEmail: result.studentId.email,
            totalMarks: result.mark,
            testsTaken: 1,
            percentages: [percentage],
            latestCompletedAt: result.completedAt,
          });
        }
        return acc;
      }, [])
      .map((student) => ({
        ...student,
        averagePercentage: (student.percentages.reduce((a, b) => a + b, 0) / student.testsTaken).toFixed(2),
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .map((student, index) => ({
        rank: index + 1,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        totalMarks: student.totalMarks,
        testsTaken: student.testsTaken,
        averagePercentage: student.averagePercentage,
        latestCompletedAt: student.latestCompletedAt,
      }));

    const testRankingsMap = testResults.reduce((acc, result) => {
      const testId = result.mockTestId._id.toString();
      const testName = result.mockTestId.testName;
      if (!acc[testId]) {
        acc[testId] = { testName, results: [] };
      }
      const studentId = result.studentId._id.toString();
      const totalMarks = result.mockTestId.questions.length;
      const existing = acc[testId].results.find((s) => s.studentId === studentId);
      if (existing) {
        if (result.mark > existing.mark) {
          existing.mark = result.mark;
          existing.completedAt = result.completedAt;
          existing.percentage = (result.mark / totalMarks) * 100;
        }
      } else {
        acc[testId].results.push({
          studentId,
          studentName: result.studentId.name,
          studentEmail: result.studentId.email,
          mark: result.mark,
          completedAt: result.completedAt,
          percentage: (result.mark / totalMarks) * 100,
        });
      }
      return acc;
    }, {});

    const testRankings = Object.keys(testRankingsMap).reduce((acc, testId) => {
      acc[testId] = {
        testName: testRankingsMap[testId].testName,
        rankings: testRankingsMap[testId].results
          .sort((a, b) => b.mark - a.mark)
          .map((student, index) => ({
            rank: index + 1,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            mark: student.mark,
            percentage: student.percentage.toFixed(2),
            completedAt: student.completedAt,
          })),
      };
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overallRankings,
        testRankings,
      },
      message: "Leaderboard rankings retrieved successfully",
    });
  } catch (error) {
    console.error("getRanks error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const jobOpening = async (req, res) => {
  const studentId = req.user?._id;
  if (!studentId) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
  }

  try {
    const jobs = await jobModel.find({ status: "open" }).select(
      "title company description eligibility applicationDeadline applyLink isCampusDrive" // Add isCampusDrive
    );
    console.log("Fetched jobs:", jobs);

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ success: true, message: "No open job postings found", data: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Job openings fetched successfully",
      data: jobs,
    });
  } catch (error) {
    console.error("getjobopening error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getStudentMarks = async (req, res) => {
  const studentId = req.user?._id;
  if (!studentId) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
  }

  try {
    const student = await studentModel.findOne({ studentId: studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student details not found" });
    }

    const marks = {
      pg: student.pgMarks.map((sem) => sem.cgpa).filter((cgpa) => cgpa !== undefined), 
      degreeCgpa: parseFloat(student.degreeCgpa) || null,
      plustwoPercent: parseFloat(student.plustwoPercent) || null,
    };

    console.log("Fetched student marks:", marks); // Debug
    return res.status(200).json({ success: true, marks });
  } catch (error) {
    console.error("getStudentMarks error:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const applyForCampusDrive = async (req, res) => {
  try {
    const student = await userModel.findById(req.user?._id);
    if (!student || student.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { jobId } = req.body;
    const job = await jobModel.findById(jobId);
    if (!job || !job.isCampusDrive) {
      return res.status(400).json({ success: false, message: "Invalid or non-campus drive job" });
    }

    const existingApplication = await jobApplicationModel.findOne({ jobId, studentId: student._id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: "You have already applied" });
    }

    const application = new jobApplicationModel({
      jobId,
      studentId: student._id,
    });
    await application.save();

    return res.status(201).json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error in applyForCampusDrive:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getStudentBlogs = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const blogs = await Blog.find({ status: "published" })
      .populate("author", "name") 
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, message: "Published blogs fetched successfully", data: blogs });
  } catch (error) {
    console.error("Error in getStudentBlogs:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId, status: "published" }).populate("author", "name");
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found or not published" });
    }

    return res.status(200).json({ success: true, message: "Blog fetched successfully", data: blog });
  } catch (error) {
    console.error("Error in getBlogById:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getUserMaterials = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const materials = await StudyMaterial.find({ status: "published", type: "study_material" })
      .select("title content description tags thumbnail createdAt updatedAt")
      .lean(); 

    return res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error("Error in getUserMaterials:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const showUserVideos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const videos = await Video.find({ status: "published" })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      data: videos,
    });
  } catch (error) {
    console.error("Error in showUserVideos:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getStudentQA = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const qas = await StudyMaterial.find({ type: "qa", status: "published" })
      .populate("author", "name role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Q&A fetched successfully",
      data: qas,
    });
  } catch (error) {
    console.error("Error in getStudentQA:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getLiveLink = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const liveClasses = await StudyMaterial
      .find({ type: "live_class", status: "published" })
      .select('title description schedule isLive thumbnail')
      .lean();

    if (!liveClasses.length) {
      return res.status(200).json({ success: true, data: { liveClasses: [], message: "No live classes available" } });
    }

    res.status(200).json({ success: true, data: { liveClasses } });
  } catch (error) {
    console.error("Error in getLiveLink:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const manualResumeFeedback = async (req, res) => {
  try {
    console.log('Checking userModel availability:', !!userModel);
    console.log('Checking ResumeReview availability:', !!ResumeReview);

    const user = await userModel.findById(req.user?._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user data" });
    }
    if (user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }
    const student = await studentModel.findOne({ studentId: req.user._id }).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    const feedbacks = await ResumeReview.find({ studentId: student._id })
      .select('feedback reviewedAt reviewedBy reviewType')
      .populate('reviewedBy', 'name')
      .lean();
    res.status(200).json({
      success: true,
      data: feedbacks.map(f => ({
        feedback: f.feedback,
        reviewedAt: f.reviewedAt,
        reviewedBy: f.reviewedBy ? f.reviewedBy.name : 'Pending',
        reviewType: f.reviewType,
      })),
    });
  } catch (error) {
    console.error("manualResumeFeedback error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};