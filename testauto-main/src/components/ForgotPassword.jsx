import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/loginRoutes/forgotPassword`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setMessage("If that email exists, a password reset link has been sent. Check your inbox.");
        setEmail("");
      }
    } catch (err) {
      setMessage("If that email exists, a password reset link has been sent. Check your inbox.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-sky-200/40 to-blue-200/40 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30pxrgb(0,0,0,0.04)] border border-white/50 w-full max-w-md space-y-8">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-slate-500 text-sm font-medium px-4">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">
            Remember your password?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}