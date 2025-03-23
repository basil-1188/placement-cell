import { userModel,mockTestModel,studentModel } from "../models/userModel.js";

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

export const getFullStudentDetailsForOfficer = async (req, res) => {
  try {
    console.log("Fetching all student details for officer: ", req.user);
    const officer = await userModel.findById(req.user?._id);
    if (!officer) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user data" });
    }
    if (officer.role !== "placement_officer") {
      return res.status(403).json({ success: false, message: "Access denied: Placement officer role required" });
    }

    const students = await userModel.find({ role: { $eq: "student" } }, "role _id name email profileImage");
    console.log("Returning student users:", students.length);
    console.log("Students from userModel:", students);

    const studentIds = students.map(student => student._id);
    console.log("Student IDs to query studentModel:", studentIds);

    const fullDetails = await studentModel.find(
      { studentId: { $in: studentIds } },
      "studentId admnNo phoneNo dob address degree degreeCgpa plustwoPercent tenthPercent pgMarks resume githubProfile"
    );
    console.log("Full Details from studentModel:", fullDetails);

    const responseData = students.map(student => {
      const details = fullDetails.find(detail => 
        detail.studentId && detail.studentId.toString() === student._id.toString()
      );
      console.log(`Matching student _id: ${student._id} with studentId: ${details ? details.studentId : 'no match'}`);
      console.log(`PG Marks for ${student._id}: ${details ? JSON.stringify(details.pgMarks) : 'undefined'}`);
      return {
        _id: student._id,
        role: student.role,
        name: student.name,
        email: student.email,
        profileImage: student.profileImage,
        ...(details && {
          admnNo: details.admnNo,
          phoneNo: details.phoneNo,
          dob: details.dob,
          address: details.address,
          degree: details.degree,
          degreeCgpa: details.degreeCgpa,
          plustwoPercent: details.plustwoPercent,
          tenthPercent: details.tenthPercent,
          pgMarks: details.pgMarks || [],
          resume: details.resume || 'N/A',
          githubProfile: details.githubProfile || 'N/A',
        }),
      };
    });

    console.log("Final Response Data:", responseData);
    res.status(200).json({ success: true, students: responseData });
  } catch (error) {
    console.error("getFullStudentDetailsForOfficer error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};