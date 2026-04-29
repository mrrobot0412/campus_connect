import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {API_BASE_URL} from "../config"; 

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("auth-token")) {
      navigate("/dash");
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("studentLogin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${API_BASE_URL}/api/v1/loginRoutes/${userType}`;

    try {
      const response = await axios.post(
        url,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("auth-token", response.data.token);

      if (userType === "studentLogin") {
        navigate("/dash");
      } else {
        navigate("/teacher_dashboard");
      }
    } catch (error) {
      if (error.response?.data?.message === "User not found") {
        alert("USER NOT FOUND");
      } else if (error.response?.status === 400) {
        alert("Invalid credentials");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-sky-200/40 to-blue-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 w-full max-w-md space-y-8 transition-all duration-500 hover:shadow-[0_8px_30pxrgb(0,0,0,0.08)]"
      >
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Connect</h2>
          <p className="text-slate-500 text-sm font-medium px-4">Log in to manage your appointments and schedule effortlessly.</p>
        </div>

        <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setUserType("studentLogin")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              userType === "studentLogin"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType("teacherLogin")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              userType === "teacherLogin"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            }`}
          >
            Teacher
          </button>
        </div>

        <div className="space-y-5">
          <div className="group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium"
              required
            />
          </div>
          <div className="group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            New here?{" "}
            <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Request access
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="text-sm text-slate-400 font-medium hover:text-slate-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300"
        >
          Sign In to Portal
        </button>
      </form>
    </div>
  );
}