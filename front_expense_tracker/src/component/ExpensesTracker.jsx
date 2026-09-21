import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ExpenseTracker() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const CONTEXT = import.meta.env.VITE_CONTEXT_PATH;
  const API = import.meta.env.VITE_API_URI;

  const location = useLocation();
  const navigate = useNavigate();

  const userType = location.state?.userType;

  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [spendingDate, setSpendingDate] = useState("");
  const [spendingTime, setSpendingTime] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);

  const [loading, setLoading] = useState(true);
  const [addingExpense, setAddingExpense] = useState(false);
  const [updatingExpense, setUpdatingExpense] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Set current date/time
  // --------------------------------------------------

  const setCurrentDateTime = () => {
    const now = new Date();

    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    setSpendingDate(date);
    setSpendingTime(time);
  };

  // --------------------------------------------------
  // Fetch expenses
  // --------------------------------------------------

  const getExpenses = async () => {
    const expenseURL =
      `${BASE_URL}/${CONTEXT}/${API}/user/get_expense_records_user`;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(expenseURL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const expenseData = await response.json();

      setExpenses(expenseData);
    } catch (error) {
      setError(error.message || "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    setCurrentDateTime();
    getExpenses();
  }, []);

  // --------------------------------------------------
  // Add expense
  // --------------------------------------------------

  const addExpense = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter an expense description.");
      return;
    }

    const newExpense = {
      amount,
      description,
      spendingDate,
      spendingTime,
    };

    const addExpenseURL =
      `${BASE_URL}/${CONTEXT}/${API}/user/add_expense`;

    try {
      setAddingExpense(true);

      const response = await fetch(addExpenseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Unable to add expense.");
      }

      await response.json();

      setAmount("");
      setDescription("");

      setCurrentDateTime();

      await getExpenses();

      setSuccess("Expense added successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to add expense.");
    } finally {
      setAddingExpense(false);
    }
  };

  // --------------------------------------------------
  // Start editing
  // --------------------------------------------------

  const editExpense = (expense) => {
    setError("");
    setSuccess("");

    setEditingExpense({
      ...expense,
    });
  };

  // --------------------------------------------------
  // Cancel editing
  // --------------------------------------------------

  const cancelEdit = () => {
    setEditingExpense(null);
    setError("");
  };

  // --------------------------------------------------
  // Update expense
  // --------------------------------------------------

  const updateExpense = async (e) => {
    e.preventDefault();

    if (!editingExpense) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !editingExpense.amount ||
      Number(editingExpense.amount) <= 0
    ) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!editingExpense.description.trim()) {
      setError("Please enter an expense description.");
      return;
    }

    const updateURL =
      `${BASE_URL}/${CONTEXT}/${API}/user/update_expense/${editingExpense.id}`;

    try {
      setUpdatingExpense(true);

      const response = await fetch(updateURL, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingExpense),
      });

      if (!response.ok) {
        throw new Error("Unable to update expense.");
      }

      await getExpenses();

      setEditingExpense(null);

      setSuccess("Expense updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to update expense.");
    } finally {
      setUpdatingExpense(false);
    }
  };

  // --------------------------------------------------
  // Delete expense
  // --------------------------------------------------

  const deleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const deleteURL =
        `${BASE_URL}/${CONTEXT}/${API}/user/delete_expense/${id}`;

      const response = await fetch(deleteURL, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to delete expense.");
      }

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense.id !== id
        )
      );

      setSuccess("Expense deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(error.message || "Unable to delete expense.");
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Dashboard calculations
  // --------------------------------------------------

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const averageExpense = useMemo(() => {
    if (expenses.length === 0) {
      return 0;
    }

    return totalExpenses / expenses.length;
  }, [expenses, totalExpenses]);

  const highestExpense = useMemo(() => {
    if (expenses.length === 0) {
      return 0;
    }

    return Math.max(
      ...expenses.map((expense) =>
        Number(expense.amount || 0)
      )
    );
  }, [expenses]);

  // --------------------------------------------------
  // Format currency
  // --------------------------------------------------

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="bg-slate-950 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-xl">₹</span>
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  Expense Tracker
                </h1>

                <p className="text-xs text-slate-400">
                  Personal Finance Dashboard
                </p>
              </div>

            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">

              {userType === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-slate-800 hover:bg-slate-700 text-sm font-medium
                  transition-colors"
                >
                  <span>👥</span>
                  Manage Users
                </button>
              )}

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white
                border border-red-500/20 text-sm font-medium transition-colors"
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
          MAIN CONTENT
      ================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page heading */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-600 mb-1">
            OVERVIEW
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            My Expenses
          </h2>

          <p className="text-slate-500 mt-1">
            Keep track of your spending and manage your expenses.
          </p>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4
          rounded-xl border border-red-200 bg-red-50 px-4 py-3
          text-sm text-red-700">

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
          rounded-xl border border-green-200 bg-green-50 px-4 py-3
          text-sm text-green-700">

            <span>✓</span>
            <span>{success}</span>

          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

          {/* Total */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Spending
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  ₹{formatCurrency(totalExpenses)}
                </h3>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                💰
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Across all recorded expenses
            </p>

          </div>

          {/* Number of expenses */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Transactions
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {expenses.length}
                </h3>
              </div>

              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                🧾
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Recorded transactions
            </p>

          </div>

          {/* Average */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Expense
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  ₹{formatCurrency(averageExpense)}
                </h3>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                📊
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Average per transaction
            </p>

          </div>

        </div>

        {/* ==================================================
            ADD EXPENSE
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8">

          <div className="px-6 py-5 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                ➕
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Add New Expense
                </h3>

                <p className="text-sm text-slate-500">
                  Record a new transaction
                </p>
              </div>

            </div>

          </div>

          <form
            onSubmit={addExpense}
            className="p-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Amount */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200
                    bg-slate-50 focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent transition"
                  />

                </div>
              </div>

              {/* Description */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Date */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>

                <input
                  type="text"
                  value={spendingDate}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Time */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time
                </label>

                <input
                  type="text"
                  value={spendingTime}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={addingExpense}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700
                text-white font-semibold shadow-lg shadow-blue-600/20
                transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addingExpense
                  ? "Adding..."
                  : "Add Expense"}
              </button>

            </div>

          </form>

        </div>

        {/* ==================================================
            EXPENSE TABLE
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Table heading */}

          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

            <div>
              <h3 className="font-bold text-slate-900">
                Expense History
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {expenses.length} transaction
                {expenses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="hidden sm:block text-sm text-slate-400">
              Highest: ₹{formatCurrency(highestExpense)}
            </div>

          </div>

          {/* Loading */}

          {loading && (
            <div className="p-12 text-center">

              <div className="inline-block w-8 h-8 border-4 border-slate-200
              border-t-blue-600 rounded-full animate-spin" />

              <p className="text-sm text-slate-500 mt-4">
                Loading expenses...
              </p>

            </div>
          )}

          {/* Empty state */}

          {!loading && expenses.length === 0 && (
            <div className="p-12 text-center">

              <div className="text-5xl mb-4">
                🧾
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                No expenses yet
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Add your first expense using the form above.
              </p>

            </div>
          )}

          {/* Desktop table */}

          {!loading && expenses.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Time
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {expenses.map((item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      <td className="px-6 py-4">

                        <span className="font-semibold text-slate-900">
                          ₹{formatCurrency(item.amount)}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span className="text-slate-700">
                          {item.description}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.spendingDate}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.spendingTime}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => editExpense(item)}
                            className="w-9 h-9 rounded-lg bg-blue-50
                            text-blue-600 hover:bg-blue-600 hover:text-white
                            transition-colors"
                            title="Edit expense"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteExpense(item.id)}
                            className="w-9 h-9 rounded-lg bg-red-50
                            text-red-600 hover:bg-red-600 hover:text-white
                            transition-colors"
                            title="Delete expense"
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
          EDIT MODAL
      ================================================== */}

      {editingExpense && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={cancelEdit}
          />

          {/* Modal */}

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl">

            {/* Header */}

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Edit Expense
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Update your transaction details
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
              onSubmit={updateExpense}
              className="p-6 space-y-5"
            >

              {/* Amount */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        amount: e.target.value,
                      })
                    }
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200
                    bg-slate-50 focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent"
                  />

                </div>

              </div>

              {/* Description */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      description: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                  bg-slate-50 focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              {/* Date & time */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>

                  <input
                    type="text"
                    value={editingExpense.spendingDate || ""}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-slate-200
                    bg-slate-100 text-slate-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time
                  </label>

                  <input
                    type="text"
                    value={editingExpense.spendingTime || ""}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-slate-200
                    bg-slate-100 text-slate-500"
                  />

                </div>

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
                  disabled={updatingExpense}
                  className="px-5 py-3 rounded-xl bg-blue-600
                  hover:bg-blue-700 text-white font-semibold
                  transition disabled:opacity-60"
                >
                  {updatingExpense
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

export default ExpenseTracker;