import { userModel, studentModel } from "../models/userModel.js";
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