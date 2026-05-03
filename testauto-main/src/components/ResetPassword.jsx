import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const config = {
        method: "post",
        url: "http://localhost:8000/api/v1/loginRoutes/resetPassword",
        headers: {
          "Content-Type": "application/json",
        },
        data: { token, password },
      };

      const response = await axios.request(config);

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to reset password. Please try again.");
      }
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

      <div className="relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 w-full max-w-md space-y-8">
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Password Reset Complete</h2>
            <p className="text-slate-500 font-medium">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
              <p className="text-slate-500 text-sm font-medium px-4">
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium"
                  required
                  minLength={6}
                />
              </div>
              <div className="group">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400 font-medium"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">
                Remember your password?{" "}
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}