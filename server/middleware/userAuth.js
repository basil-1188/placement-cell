import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("userAuth - Cookie token:", token);

    if (!token) {
      console.log("No token found in cookies");
      return res.status(401).json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("userAuth - Decoded token:", decoded);

    req.user = { _id: decoded.id };
    console.log("userAuth - req.user:", req.user);

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

export default userAuth;