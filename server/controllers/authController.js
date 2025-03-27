import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profileImageUrl = null;
    if (file) {
      try {
        const publicId = `${email}_${Date.now()}`;
        profileImageUrl = await uploadToCloudinary(req.file, "profile", publicId);
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: uploadError.message });
      }
    }
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageUrl,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Place-Pro | Nirmala College MCA Placement Portal",
      html: `
        <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
        <div style="max-width: 600px; margin: auto; padding: 16px">
            <h2 style="font-size: 20px; margin: 16px 0">Welcome to Place-Pro</h2>
            <p style="margin: 0 0 16px">Dear ${name},</p>
            <p style="margin: 0 0 16px">
              Welcome to <strong>Place-Pro</strong>, the official placement portal of the <strong>Nirmala College MCA Department</strong>! 🎉
            </p>
            <p style="margin: 0 0 16px">
              Your account has been successfully created. You can now log in using your registered email to explore job opportunities, attend mock tests, and access training resources.
            </p>
            <p style="margin: 0 0 16px">
              Stay updated with the latest placement activities and make the most of this platform.
            </p>
            <p style="margin: 0 0 16px">
              If you have any questions, feel free to reach out to the placement team.
            </p>
            <p style="margin: 0">
              Best regards,<br />
              <strong>Nirmala College MCA Placement Team</strong>
            </p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and passwords are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    console.log("Clearing token cookie:", req.cookies.token); 
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/", 
    });
    console.log("Token cookie cleared");
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    console.log("isAuthenticated - req.user:", req.user);
    console.log("isAuthenticated - req.cookies.token:", req.cookies.token);
    if (req.user) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: "Not authenticated" });
  } catch (error) {
    console.error("isAuthenticated error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "OTP Verification - Place-Pro Password Reset",
      text: `Your One-Time Password (OTP) for resetting your password is: ${otp}

This OTP is valid for 10 minutes. Please use it to reset your password.

If you did not request this, please ignore this email.

Best regards,  
Nirmala College MCA Placement Team`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
          <div style="max-width: 500px; background-color: #ffffff; padding: 20px; margin: auto; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
            
            <h2 style="color: #1e3a8a; text-align: center; font-size: 22px;">OTP Verification</h2>

            <p style="color: #374151; text-align: center; font-size: 16px;">
              Your One-Time Password (OTP) for resetting your password is:
            </p>

            <div style="background-color: #fef3c7; text-align: center; padding: 10px; font-size: 20px; font-weight: bold; color: #d97706; border-radius: 5px; margin: 15px 0;">
              ${otp}
            </div>

            <p style="color: #6b7280; text-align: center; font-size: 15px;">
              This OTP is valid for <strong>10 minutes</strong>. Please use it to reset your password.
            </p>

            <p style="color: #6b7280; text-align: center; font-size: 15px;">
              If you did not request this, please ignore this email.
            </p>

            <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 20px;">
              Best regards, <br/>
              <strong>Nirmala College MCA Placement Team</strong>
            </p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP, and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Password successfully changed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};