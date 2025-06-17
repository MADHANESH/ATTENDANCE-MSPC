import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import "./App.css";
import Dashboard from "./Dashboard";
import Addemployee from "./Addemployee";
import Viewemployee from "./Viewemployee";
import Attendance from "./Attendance";
import Setsalary from "./Setsalary";
import Salaryslip from "./Salaryslip";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
<Route path="/addemployee" element={<Addemployee />} />
<Route path = "/viewemployee" element={<Viewemployee />} />
<Route path="/attendance" element={<Attendance />} />
<Route path="/setsalary" element={<Setsalary />} />
<Route path="/salaryslip" element={<Salaryslip />} />
      </Routes>
    </Router>
  );
}

export default App;
