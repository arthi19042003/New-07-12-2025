const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.id || decoded.userId;
      req.user = await User.findById(userId).select("-password"); 
      req.userId = userId; 

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      
      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;