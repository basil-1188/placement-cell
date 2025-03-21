import { userModel } from "../models/userModel.js";

export const getOfficerProfile = async (req, res) => {
  try {
    const userId = req.user?._id; // Change from req.user?.id to req.user?._id
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