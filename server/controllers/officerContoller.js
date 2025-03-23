import { userModel,mockTestModel } from "../models/userModel.js";

export const getOfficerProfile = async (req, res) => {
  try {
    const userId = req.user?._id; 
    console.log("getOfficerProfile - userId:", userId); // Add this log
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const user = await userModel.findById(userId, "name email role profileImage");
    if (!user) {
      return res.status(404).json({ success: false, message: "Officer not found" });
    }

    if (user.role !== "placement_officer") {
      return res.status(403).json({ success: false, message: "Access denied: Placement Officer role required" });
    }

    console.log("Returning officer profile data:", {
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });

    res.json({
      success: true,
      profileData: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("getOfficerProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addQuestions = async (req, res) => {
  try {
    const userId = req.user?._id;
    console.log("Mocktest - userId:", userId);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const {
      testName,
      testType,
      questions,
      timeLimit,
      lastDayToAttend, 
      isPublished,
      startDate,
      description,
      maxAttempts,
      passMark 
    } = req.body;

    if (!testName || !testType || !questions || !timeLimit || !lastDayToAttend || 
        isPublished === undefined || !startDate || !description || !maxAttempts || !passMark) {
      return res.status(400).json({ success: false, message: "All top-level fields are required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Questions must be a non-empty array" });
    }

    for (const question of questions) {
      if (question.type !== testType) {
        return res.status(400).json({ success: false, message: "All questions must match testType" });
      }
      if (testType === 'mcq') {
        if (!question.text || !question.options || !question.correctAnswer || 
            !Array.isArray(question.options) || question.options.length !== 4 || 
            !question.options.includes(question.correctAnswer)) {
          return res.status(400).json({ success: false, message: "Invalid MCQ question format" });
        }
      } else if (testType === 'coding') {
        if (!question.text || !question.codingDetails || !Array.isArray(question.codingDetails.testCases) || 
            question.codingDetails.testCases.length === 0) {
          return res.status(400).json({ success: false, message: "Invalid coding question format" });
        }
        for (const testCase of question.codingDetails.testCases) {
          if (!testCase.input || !testCase.output) {
            return res.status(400).json({ success: false, message: "Test cases must have input and output" });
          }
        }
      }
    }

    const newMockTest = new mockTestModel({
      testName,
      testType,
      questions,
      timeLimit,
      createdBy: userId, 
      lastDayToAttend,
      isPublished,
      startDate,
      description,
      maxAttempts,
      passMark
    });

    const savedMockTest = await newMockTest.save();

    return res.status(201).json({
      success: true,
      message: "Mock test created successfully",
      data: savedMockTest
    });

  } catch (error) {
    console.error("Error in addQuestions:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while creating mock test",
      error: error.message 
    });
  }
};