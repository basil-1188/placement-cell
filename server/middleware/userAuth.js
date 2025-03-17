import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    console.log("userAuth - Cookie token:", req.cookies.token);
    const token = req.cookies.token;
    if (!token) {
      console.log("No token found in cookies");
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("userAuth error:", error.message);
    return next();
  }
};

export default userAuth;