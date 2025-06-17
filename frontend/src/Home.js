import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <div className="home-bg">
      <nav className="navbar">
        <img src="/mslogo.png" alt="Logo" className="navbar-logo" />
       
      </nav>
      <div className="main-content">
        <h1>
          <span className="heading-with-logo">
            <img src="/mslogo.png" alt="Logo" className="heading-logo" />
            <span className="heading-main">M S POWDER COATING</span>
          </span>
          <br />
          {/* Add more content here if needed */}
        </h1>
        <div className="glass-card">
          <div className="subtitle">
             ATTENDANCE{" "}
            <span className="blockchain">APP</span>
          </div>
          <div className="login-title">Login or Register</div>
          <div className="login-desc">
            (Click below to log in or create an account)
          </div>
          <div className="button-group">
            <Link to="/login" className="login-link">
            <button className="ral-btn">Login</button></Link>
            <Link to="/register">
              <button className="ral-btn">Register</button>
             
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;