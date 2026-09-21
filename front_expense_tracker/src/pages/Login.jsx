import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const CONTEXT = import.meta.env.VITE_CONTEXT_PATH;
  const API = import.meta.env.VITE_API_URI;

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const loginURL = `${BASE_URL}/${CONTEXT}/${API}/auth/login`;

    try {
      const response = await fetch(loginURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Invalid username/email or password");
      }

      const result = await response.json();

      navigate("/expenses", {
        state: { userType: result.role },
      });
    } catch (error) {
      setError(error.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-5">
            <span className="text-3xl">₹</span>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight">
            Expense Tracker
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your money. Track your spending.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username or Email
              </label>

              <input
                type="text"
                placeholder="Enter your username or email"
                value={user.username}
                onChange={(e) =>
                  setUser({
                    ...user,
                    username: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/reset_password")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={user.password}
                onChange={(e) =>
                  setUser({
                    ...user,
                    password: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700
              text-white font-semibold shadow-lg shadow-blue-600/20
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-7 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mt-2 text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              Create an account →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Securely manage your personal expenses
        </p>
      </div>
    </div>
  );
}

export default Login;