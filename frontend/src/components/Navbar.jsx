import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#007acc",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #005fa3",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "20px" }}>SaaS Notes App</div>
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            {user.role === "ADMIN" && (
              <Link style={{ color: "white", textDecoration: "none" }} to="/admin">
                Admin Dashboard
              </Link>
            )}
            {user.role === "MEMBER" && (
              <Link style={{ color: "white", textDecoration: "none" }} to="/notes">
                Notes
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                background: "#e63946",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link style={{ color: "white", textDecoration: "none" }} to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
