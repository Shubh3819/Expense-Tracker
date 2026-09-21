import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Password() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const CONTEXT = import.meta.env.VITE_CONTEXT_PATH;
  const API = import.meta.env.VITE_API_URI;

  const [user, setUser] = useState({
    identifier: "",
    oldPassword: "",
    newPassword: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (user.oldPassword === user.newPassword) {
      setError("Old password and new password cannot be the same.");
      return;
    }

    if (user.newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (user.newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const resetPassURL =
        `${BASE_URL}/${CONTEXT}/${API}/auth/reset_password`;

      const response = await fetch(resetPassURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Unable to reset password.");
      }

      setSuccess("Password updated successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-5">
            <span className="text-3xl">🔐</span>
          </div>

          <h1 className="text-4xl font-bold text-white">
            Reset Password
          </h1>

          <p className="text-slate-400 mt-2">
            Update your account password securely
          </p>

        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-slate-500 hover:text-blue-600 transition mb-6"
          >
            ← Back to login
          </button>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={resetPassword} className="space-y-5">

            {/* Identifier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username or Email
              </label>

              <input
                type="text"
                placeholder="Enter your username or email"
                value={user.identifier}
                onChange={(e) =>
                  setUser({
                    ...user,
                    identifier: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Old password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>

              <input
                type="password"
                placeholder="Enter current password"
                value={user.oldPassword}
                onChange={(e) =>
                  setUser({
                    ...user,
                    oldPassword: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={user.newPassword}
                onChange={(e) =>
                  setUser({
                    ...user,
                    newPassword: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700
              text-white font-semibold shadow-lg shadow-blue-600/20
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating password..." : "Update Password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Password;