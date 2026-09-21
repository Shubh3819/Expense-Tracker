import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const CONTEXT = import.meta.env.VITE_CONTEXT_PATH;
  const API = import.meta.env.VITE_API_URI;

  const navigate = useNavigate();

  const addUser = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (user.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (user.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    const registerURL = `${BASE_URL}/${CONTEXT}/${API}/auth/register`;

    try {
      const response = await fetch(registerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Unable to create account.");
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-5">
            <span className="text-3xl">₹</span>
          </div>

          <h1 className="text-4xl font-bold text-white">
            Expense Tracker
          </h1>

          <p className="text-slate-400 mt-2">
            Start taking control of your expenses
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Create account
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter your details to get started
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={addUser} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={user.name}
                onChange={(e) =>
                  setUser({
                    ...user,
                    name: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) =>
                  setUser({
                    ...user,
                    email: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={user.password}
                onChange={(e) =>
                  setUser({
                    ...user,
                    password: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700
              text-white font-semibold shadow-lg shadow-blue-600/20
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 pt-6 border-t border-slate-200 text-center">

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-2 text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              ← Back to Sign In
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;