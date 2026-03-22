var jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config/server-config")

const otpAuth = async (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  try {
      const token = req.header("auth-token");
      console.log(token)
      if (!token) {
          return res.status(401).send({ error: "Please authenticate using a valid token" });
        }
      const data = jwt.verify(token, JWT_SECRET);
     
    req.user = data.user;
    
    next();

  } catch (error) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = otpAuth;
