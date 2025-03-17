import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("Returning user data:", {
      name: user.name,
      role: user.role,
    });

    res.json({
      success: true,
      userData: {
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("getUserData error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};