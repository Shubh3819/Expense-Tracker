import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Password from "./pages/Password";

import ExpenseTracker from "./component/ExpensesTracker";
import UserTracker from "./component/UserTracker";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset_password" element={<Password />} />

        {/* Application */}
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/users" element={<UserTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;