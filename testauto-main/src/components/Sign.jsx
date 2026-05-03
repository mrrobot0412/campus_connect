import React, { useState } from "react";
import { FiUser, FiLock, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: "",lastName:"", email: "", rollNo: "", password: "", confirmPassword: "", otp:"" });
  const [otpVerfifed, setOtpVerified]= useState(true);
  const [verifyotp, setOtpVerifyotp]= useState(true);
  const [token, setToken]= useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async  (e) => {
    e.preventDefault();
    let data = JSON.stringify({
      "firstName": formData.firstName,
      "lastName": formData.lastName,
      "roll": formData.rollNo,
      "password": formData.password,
    });
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/v1/loginRoutes/registerStudent`,
      headers: { 
        "auth-token": token, 
        "Content-Type": "application/json"
      },
      data : data
    };
    
    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      navigate("/login")
    })
    .catch((error) => {
      if(error.response.data.message=="user already exists"){
        alert("user alrady exists")
      }
      console.log(error);
    });
    console.log(formData);
  };

  const handleEmail =async (e)=>{
    e.preventDefault();
    let data = JSON.stringify({
      "email": formData.email
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/v1/otp/generateOTP`,
      headers: { 
        "Content-Type": "application/json"
      },
      data : data
    };
    axios.request(config)
.then((response) => {
  
  setToken(response.data.authtoken);
  setOtpVerifyotp(false)

})
.catch((error) => {
  console.log(error);
});

  }

  const handleOtp =async (e)=>{
    e.preventDefault();
    console.log(formData.otp)
    let data = JSON.stringify({
      "otp": formData.otp
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/v1/otp/verifyotp`,
      headers: { 
        "auth-token": token, 
        "Content-Type": "application/json", 
       
      },
    data:data}
    axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
  setToken(response.data.authtoken);
  setOtpVerified(false)

})
.catch((error) => {
  console.log(error);
});

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-sky-200/40 to-blue-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 w-full max-w-md transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        {otpVerfifed ? (
          verifyotp ? (
            <form onSubmit={handleEmail} className="space-y-6">
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register</h2>
                <p className="text-slate-500 text-sm font-medium">Enter your email to get started.</p>
              </div>

              <div className="relative group">
                <FiMail className="absolute top-1/2 -translate-y-1/2 left-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300">
                Send OTP
              </button>

              <p className="text-center text-sm text-slate-500 font-medium tracking-wide">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify Secure Code</h2>
                <p className="text-slate-500 text-sm font-medium px-4">Check your email for the 6-digit code we sent you.</p>
              </div>

              <div className="relative group">
                <FiLock className="absolute top-1/2 -translate-y-1/2 left-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium tracking-widest text-lg"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300">
                Verify Identity
              </button>

              <p className="text-center text-sm text-slate-500 font-medium tracking-wide">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign in</Link>
              </p>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Profile</h2>
              <p className="text-slate-500 text-sm font-medium">Almost there! We just need a few more details.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium text-sm"
                  required
                />
              </div>
              <div className="relative group">
                <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-100/60 border border-slate-200/50 rounded-xl text-slate-500 cursor-not-allowed font-medium text-sm opacity-80"
                readOnly
              />
            </div>

            <div className="relative group">
              <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium text-sm"
                required
              />
            </div>

            <div className="relative group">
              <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium text-sm"
                required
              />
            </div>

            <div className="relative group">
              <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium text-sm"
                required
              />
            </div>

            <button type="submit" className="w-full mt-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300">
              Create Account
            </button>

            <p className="text-center text-sm text-slate-500 font-medium mt-6 tracking-wide">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
