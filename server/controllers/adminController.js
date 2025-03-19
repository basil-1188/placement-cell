import { userModel } from "../models/userModel.js";

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