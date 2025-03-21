import { userModel } from "../models/userModel.js";

export const getTeamProfile = async (req, res) => {
  try {
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const user = await userModel.findById(userId, "name email role profileImage");
    if (!user) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    if (user.role !== "training_team") {
      return res.status(403).json({ success: false, message: "Access denied: Training Team role required" });
    }

    console.log("Returning team profile data:", {
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
    console.error("getTeamProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};