var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const loginAuth = async (req, res, next) => {
  // Authenticate request using the existing auth-token header.
  try {
      const token = req.header("auth-token");
      if (!token) {
         return res.status(401).send({ error: "Please authenticate using a valid token" });
        }
      const data = jwt.verify(token, JWT_SECRET);
     
    req.user = data;
    
    next();

  } catch (error) {
    return   res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

const requireRole = (...allowedRoles) => {
  // Authorize authenticated users by role after loginAuth has verified JWT.
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};

module.exports = loginAuth;
module.exports.loginAuth = loginAuth;
module.exports.requireRole = requireRole;
