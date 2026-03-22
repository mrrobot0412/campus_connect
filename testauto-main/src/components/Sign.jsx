import React, { useState } from "react";
import { FiUser, FiLock, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios"
import { useNavigate } from 'react-router-dom';

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
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:8000/api/v1/loginRoutes/registerStudent',
      headers: { 
        'auth-token': token, 
        'Content-Type': 'application/json'
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
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:8000/api/v1/otp/generateOTP',
      headers: { 
        'Content-Type': 'application/json'
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
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:8000/api/v1/otp/verifyotp',
      headers: { 
        'auth-token': token, 
        'Content-Type': 'application/json', 
       
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-200/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white w-full max-w-md transition-all duration-300 hover:shadow-cyan-100/50">
        {otpVerfifed ? (
          verifyotp ? (
            <form onSubmit={handleEmail} className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Register</h2>
                <p className="text-slate-500 text-sm font-medium">Enter your email to get started.</p>
              </div>

              <div className="relative">
                <FiMail className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-3.5 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all duration-200">
                Send OTP
              </button>

              <p className="text-center text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-600 font-bold hover:text-cyan-700 transition-colors">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Enter OTP</h2>
                <p className="text-slate-500 text-sm font-medium">Check your email for the code we sent.</p>
              </div>

              <div className="relative">
                <FiLock className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-3.5 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all duration-200">
                Verify OTP
              </button>

              <p className="text-center text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-600 font-bold hover:text-cyan-700 transition-colors">Sign in</Link>
              </p>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complete Profile</h2>
              <p className="text-slate-500 text-sm font-medium">Almost there! Complete your details.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <FiUser className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium text-sm"
                  required
                />
              </div>
              <div className="relative">
                <FiUser className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <FiMail className="absolute top-4 left-4 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-5 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                readOnly
              />
            </div>

            <div className="relative">
              <FiUser className="absolute top-4 left-4 text-slate-400" />
              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full pl-12 pr-5 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium"
                required
              />
            </div>

            <div className="relative">
              <FiLock className="absolute top-4 left-4 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-5 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium"
                required
              />
            </div>

            <div className="relative">
              <FiLock className="absolute top-4 left-4 text-slate-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-5 py-3 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 placeholder-slate-400 font-medium"
                required
              />
            </div>

            <button type="submit" className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all duration-200">
              Complete Registration
            </button>

            <p className="text-center text-sm text-slate-500 font-medium mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-600 font-bold hover:text-cyan-700 transition-colors">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
