import { studentModel, userModel } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    console.log("getAllUsers - req.user:", req.user);
    const admin = await userModel.findById(req.user?._id);
    console.log("getAllUsers - Found user:", admin);
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const users = await userModel.find({ role: { $ne: "admin" } }, "name email role profileImage");
    console.log("Returning non-admin users:", users.length);
    res.json({ success: true, users });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    console.log("updateRole - req.user:", req.user);
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user data" });
    }
    const admin = await userModel.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { userId, role } = req.body;
    console.log("Received body:", { userId, role });
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "User ID and role are required" });
    }

    if (!["placement_officer", "training_team"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Allowed: placement_officer, training_team" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    console.log("Role updated for user:", { userId, newRole: role });
    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("updateRole error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


export const getFullUserDetails = async (req, res) => {
  try {
    console.log("Fetching all user details for admin: ", req.user);
    const admin = await userModel.findById(req.user?._id);
    if (!admin) {
      return res.json({ success: false, message: "Unauthorized: No user data" });
    }
    if (admin.role !== "admin") {
      return res.json({ success: false, message: "Access denied: Admin role required" });
    }

    const users = await userModel.find({ role: { $eq: "student" } }, "role _id name email profileImage");
    console.log("Returning student users:", users.length);
    console.log("Users from userModel:", users);

    const studentIds = users.map(user => user._id);
    console.log("Student IDs to query studentModel:", studentIds);

    const fullDetails = await studentModel.find(
      { studentId: { $in: studentIds } },
      "studentId admnNo phoneNo dob address degree degreeCgpa plustwoPercent tenthPercent pgMarks" // Changed to pgMarks
    );
    console.log("Full Details from studentModel:", fullDetails);

    const responseData = users.map(user => {
      const details = fullDetails.find(detail => 
        detail.studentId && detail.studentId.toString() === user._id.toString()
      );
      console.log(`Matching user _id: ${user._id} with studentId: ${details ? details.studentId : 'no match'}`);
      console.log(`PG Marks for ${user._id}: ${details ? JSON.stringify(details.pgMarks) : 'undefined'}`); // Changed to pgMarks
      return {
        _id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        ...(details && {
          admnNo: details.admnNo,
          phoneNo: details.phoneNo,
          dob: details.dob,
          address: details.address,
          degree: details.degree,
          degreeCgpa: details.degreeCgpa,
          plustwoPercent: details.plustwoPercent,
          tenthPercent: details.tenthPercent,
          pgMarks: details.pgMarks || [], // Changed to pgMarks
        }),
      };
    });

    console.log("Final Response Data:", responseData);
    res.json({ success: true, users: responseData });
  } catch (error) {
    console.error("getFullUserDetails error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


export const getAdminIndex = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const totalUsers = await userModel.countDocuments();
    const totalStudents = await userModel.countDocuments({ role: "student" });
    const totalOfficers = await userModel.countDocuments({ role: "placement_officer" });
    const totalTrainingTeam = await userModel.countDocuments({ role: "training_team" });

    const adminData = {
      totalUsers,
      totalStudents,
      totalOfficers,
      totalTrainingTeam,
    };

    return res.json({
      success: true,
      message: "Admin dashboard data retrieved",
      data: adminData,
    });
  } catch (error) {
    console.error("Error in getAdminIndex:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};