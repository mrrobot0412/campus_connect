const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const sendOtp = async ({ email, otp }, res) => {
  try{

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      auth: {
        user: "pushanag@gmail.com",
        pass: process.env.gmail_key,
      },
      // type: "login",
    });
    await transporter.verify((error, success) => {
      if (error) {
        console.log(error);
        return false;
      } else {
        console.log("Ready for message");
        console.log(success);
        return true;
      }
    });
    const info = await transporter.sendMail({
      from: "pushanag@gmail.com",
      // sender address
      to: email, // list of receivers
      subject: "Welcome to Thpapar teacher connect", // Subject line
      html: `Hello, Welcome to Thpapar teacher connect. your otp is ${otp}`, // html body
    });
    console.log(info);
    console.log("Email sent: ", info.messageId);
    return true; 
    // transporter.verify((error, success) => {
    //   if (error) {
    //     console.log(error);
    //     return false;
    //   } else {
    //     console.log("Ready for message");
    //     console.log(success);
    //     return true;
    //   }
    // });
  
  }
  catch(e){
    console.error("Error sending email: ", e);
    return false; // 
  }
  };

  module.exports = {sendOtp};