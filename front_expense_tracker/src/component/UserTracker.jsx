import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserTracker() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const CONTEXT = import.meta.env.VITE_CONTEXT_PATH;
  const API = import.meta.env.VITE_API_URI;

  const navigate = useNavigate();

  const emptyUser = {
    name: "",
    email: "",
    password: "",
    role: "USER",
  };

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(emptyUser);

  const [editingUser, setEditingUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // GET USERS
  // ==================================================

  const getUsers = async () => {
    const userURL =
      `${BASE_URL}/${CONTEXT}/${API}/admin/get_users`;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(userURL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }

      const userData = await response.json();

      setUsers(userData);
    } catch (error) {
      setError(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    getUsers();
  }, []);

  // ==================================================
  // ADD USER
  // ==================================================

  const addUser = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user.name.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!user.email.trim()) {
      setError("Please enter the user's email.");
      return;
    }

    if (!user.password.trim()) {
      setError("Please enter a password.");
      return;
    }

    const createUserURL =
      `${BASE_URL}/${CONTEXT}/${API}/admin/create_user`;

    try {
      setAddingUser(true);

      /*
       * Important:
       * Send `user` directly.
       *
       * The old code used setUser(newUser) and then
       * JSON.stringify(user), which can use stale React state.
       */

      const response = await fetch(createUserURL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Unable to add new user.");
      }

      await response.json();

      setUser(emptyUser);

      await getUsers();

      setSuccess("User created successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to add user.");
    } finally {
      setAddingUser(false);
    }
  };

  // ==================================================
  // EDIT USER
  // ==================================================

  const editUser = (selectedUser) => {
    setError("");
    setSuccess("");

    setEditingUser({
      ...selectedUser,
    });
  };

  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const cancelEdit = () => {
    setEditingUser(null);
    setError("");
  };

  // ==================================================
  // UPDATE USER
  // ==================================================

  const updateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) {
      return;
    }

    setError("");
    setSuccess("");

    if (!editingUser.name?.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!editingUser.email?.trim()) {
      setError("Please enter the user's email.");
      return;
    }

    const updateUserURL =
      `${BASE_URL}/${CONTEXT}/${API}/admin/update_user/${editingUser.id}`;

    try {
      setUpdatingUser(true);

      const response = await fetch(updateUserURL, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) {
        throw new Error("Unable to update user.");
      }

      await getUsers();

      setEditingUser(null);

      setSuccess("User updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to update user.");
    } finally {
      setUpdatingUser(false);
    }
  };

  // ==================================================
  // DELETE USER
  // ==================================================

  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const deleteUserURL =
        `${BASE_URL}/${CONTEXT}/${API}/admin/delete_user/${id}`;

      const response = await fetch(deleteUserURL, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to delete user.");
      }

      setUsers((previousUsers) =>
        previousUsers.filter((existingUser) => existingUser.id !== id)
      );

      setSuccess("User deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to delete user.");
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/${CONTEXT}/logout`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to logout");
      }

      navigate("/login");
    } catch (error) {
      setError("Unable to logout. Please try again.");
    }
  };

  // ==================================================
  // USER STATISTICS
  // ==================================================

  const totalUsers = users.length;

  const totalAdmins = useMemo(() => {
    return users.filter((existingUser) => existingUser.role === "ADMIN")
      .length;
  }, [users]);

  const totalRegularUsers = useMemo(() => {
    return users.filter((existingUser) => existingUser.role === "USER")
      .length;
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="bg-slate-950 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            {/* Brand */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-xl">
                  ₹
                </span>
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  Expense Tracker
                </h1>

                <p className="text-xs text-slate-400">
                  Administration
                </p>
              </div>

            </div>

            {/* Actions */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => navigate("/expenses")}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5
                rounded-xl bg-slate-800 hover:bg-slate-700
                text-sm font-medium transition-colors"
              >
                <span>←</span>
                Expenses
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5
                rounded-xl bg-red-500/10 hover:bg-red-500
                text-red-400 hover:text-white
                border border-red-500/20
                text-sm font-medium transition-colors"
              >
                <span>↪</span>

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>

            </div>

          </div>

        </div>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Heading */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-600 mb-1">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            User Management
          </h2>

          <p className="text-slate-500 mt-1">
            Create, manage and maintain application users.
          </p>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4
          rounded-xl border border-red-200 bg-red-50
          px-4 py-3 text-sm text-red-700">

            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800"
            >
              ✕
            </button>

          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2
          rounded-xl border border-green-200 bg-green-50
          px-4 py-3 text-sm text-green-700">

            <span>✓</span>
            <span>{success}</span>

          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* Total */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalUsers}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                👥
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Registered accounts
            </p>

          </div>

          {/* Admin */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Administrators
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalAdmins}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
                🛡️
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Accounts with admin access
            </p>

          </div>

          {/* Regular users */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Regular Users
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalRegularUsers}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                👤
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Standard user accounts
            </p>

          </div>

        </div>

        {/* ==================================================
            CREATE USER
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8">

          <div className="px-6 py-5 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                ➕
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Create New User
                </h3>

                <p className="text-sm text-slate-500">
                  Add a new user or administrator
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={addUser}
            className="p-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter name"
                  value={user.name}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition"
                />

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="user@example.com"
                  value={user.email}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition"
                />

              </div>

              {/* Password */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      password: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition"
                />

              </div>

              {/* Role */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>

                <select
                  value={user.role}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="USER">
                    User
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>

              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={addingUser}
                className="px-6 py-3 rounded-xl bg-blue-600
                hover:bg-blue-700 text-white font-semibold
                shadow-lg shadow-blue-600/20 transition
                disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addingUser
                  ? "Creating..."
                  : "Create User"}
              </button>

            </div>

          </form>

        </div>

        {/* ==================================================
            USERS TABLE
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <h3 className="font-bold text-slate-900">
              Users & Administrators
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Manage existing accounts and their access roles.
            </p>

          </div>

          {/* Loading */}

          {loading && (
            <div className="p-12 text-center">

              <div className="inline-block w-8 h-8 border-4 border-slate-200
              border-t-blue-600 rounded-full animate-spin" />

              <p className="text-sm text-slate-500 mt-4">
                Loading users...
              </p>

            </div>
          )}

          {/* Empty */}

          {!loading && users.length === 0 && (
            <div className="p-12 text-center">

              <div className="text-5xl mb-4">
                👥
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                No users found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Create your first user using the form above.
              </p>

            </div>
          )}

          {/* Table */}

          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {users.map((existingUser) => (

                    <tr
                      key={existingUser.id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      {/* User */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-50
                          text-blue-600 flex items-center justify-center
                          font-semibold">
                            {existingUser.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              {existingUser.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID #{existingUser.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Email */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {existingUser.email}
                      </td>

                      {/* Role */}

                      <td className="px-6 py-4">

                        {existingUser.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5
                          px-3 py-1 rounded-full text-xs font-semibold
                          bg-purple-50 text-purple-700">
                            🛡️ ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5
                          px-3 py-1 rounded-full text-xs font-semibold
                          bg-emerald-50 text-emerald-700">
                            👤 USER
                          </span>
                        )}

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => editUser(existingUser)}
                            className="w-9 h-9 rounded-lg bg-blue-50
                            text-blue-600 hover:bg-blue-600
                            hover:text-white transition-colors"
                            title="Edit user"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUser(existingUser.id)}
                            className="w-9 h-9 rounded-lg bg-red-50
                            text-red-600 hover:bg-red-600
                            hover:text-white transition-colors"
                            title="Delete user"
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

      {/* ==================================================
          EDIT USER MODAL
      ================================================== */}

      {editingUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={cancelEdit}
          />

          {/* Modal */}

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl">

            {/* Header */}

            <div className="px-6 py-5 border-b border-slate-200
            flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Edit User
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Update account details and role.
                </p>

              </div>

              <button
                type="button"
                onClick={cancelEdit}
                className="w-9 h-9 rounded-lg bg-slate-100
                hover:bg-slate-200 text-slate-500 transition"
              >
                ✕
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={updateUser}
              className="p-6 space-y-5"
            >

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              {/* Role */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>

                <select
                  value={editingUser.role || "USER"}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">
                    User
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-3 rounded-xl border border-slate-200
                  text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-3 rounded-xl bg-blue-600
                  hover:bg-blue-700 text-white font-semibold
                  transition disabled:opacity-60"
                >
                  {updatingUser
                    ? "Updating..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default UserTracker;