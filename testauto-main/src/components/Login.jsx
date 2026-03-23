import React, { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";


export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem("auth-token")) {
      navigate("/dash");
    }
  }, [navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState("studentLogin");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email);
    console.log(password);
    console.log({ email, password, rememberMe, userType });
    let data = JSON.stringify({
      email: email,
      password: password,
      userType: userType,
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:8000/api/v1/loginRoutes/${userType}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        localStorage.setItem("auth-token", response.data.token);
        if (userType == "studentLogin") {
          navigate("/");
        } else {
          navigate("/teacher_dashboard");
        }
      })
      .catch((error) => {
        if (error.response.data.message == "User not found") {
          alert("USER NOT FOUND");
        }

        if (error.response.request.status == 400) {
          alert("Invalid credentials");
        }
        console.log(error.response);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background soft blobs for a modern feel */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-slate-200/30 blur-3xl"></div>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white w-full max-w-md space-y-6 transition-all duration-300 hover:shadow-blue-100/50"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
        </div>

        <div className="flex p-1 bg-slate-100/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setUserType("studentLogin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              userType === "studentLogin" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType("teacherLogin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              userType === "teacherLogin" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Teacher
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 placeholder-slate-400 font-medium"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/60 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 placeholder-slate-400 font-medium"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500 font-medium">
            New here?{" "}
            <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Register
            </Link>
          </p>
          <button
            type="button"
            className="text-sm text-slate-400 font-medium hover:text-slate-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
