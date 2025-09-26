import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route 
          path="/notes" 
          element={user?.role === "MEMBER" ? <Notes user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin" 
          element={user?.role === "ADMIN" ? <AdminDashboard user={user} /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}

export default App;
