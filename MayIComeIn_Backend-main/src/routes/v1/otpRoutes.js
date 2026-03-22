var jwt = require("jsonwebtoken");
const EmailOtp = require("../../models/EmailOtp");
const otpAuth = require("../../middlewares/otpMiddleware")
const { body, validationResult } = require("express-validator");
const {sendOtp} = require("../../utils/otpHelper")
const {JWT_SECRET} = require("../../config/server-config")

const express = require("express");


const router = express.Router();




router.post(
    "/generateOTP",
  
    [
      body("email", "Enter a valid phone ").isEmail()
      .withMessage("Invalid email format")
      .matches(/^[a-zA-Z0-9._%+-]+@thapar\.edu$/)
      .withMessage("Email must be from thapar.edu domain"),
    ],
    async (req, res) => {
      try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const digits = "0123456789";
      let otp = "";
      for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      
      const user = await EmailOtp.findOne({ email: email });
    
      if (!user) {
        
        const gen_otp = await EmailOtp.create({
          email: email,
          OTP: otp,
        });
      }
        else{
          const date =new  Date(user.createdAt)
          date.setSeconds(date.getSeconds() + 30);
          if(Date.now()<date){
            return res.status(400).json({"message":"try after 30 seconds"})
          }

          await EmailOtp.findByIdAndUpdate(user.id, { OTP: otp, createdAt:Date.now() });
        }
       
      
   
      var isSent = await sendOtp( {email, otp},res);

    
      if (isSent) {
        const data = {
          user: {
            email:email,
          },
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
       
       return res.status(200).json({ authtoken: authtoken });
      }
      return res.status(400);
    } catch (e) {
      console.log(e);
      return res.send(500);
    }
    }
  );

  router.post("/verifyotp",otpAuth, [
    body("otp", "Otp cannot be blank").exists(),
  ], async (req, res) => { try {
  
  
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {  otp } = req.body;
    const email = req.user.email
    
    let user = await EmailOtp.findOne({
      email: email,
      OTP: otp,
    });
  
    if (!user) {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }
    else{
      await EmailOtp.findByIdAndDelete(user.id)
    }
    const data = {
      
        email:email,
        verified:true
      
    };
    const authtoken = jwt.sign(data, JWT_SECRET);
     return res.status(200).json({authtoken:authtoken  });
  } catch (error) {
    return res.status(400).json({ error: "server error" });
  }
  })

  module.exports = router