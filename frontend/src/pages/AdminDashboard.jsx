
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all users in tenant
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  }, [token]);

  // Add new user
  const addUser = async () => {
    if (!name || !email || !role || !password) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/users",
        { name, email, role, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Immediately update UI
      setUsers((prev) => [...prev, res.data]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error adding user");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Upgrade user to PRO
  const upgradeUser = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/${id}/upgrade`,
        {}, // empty body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Immediately update UI
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? { ...u, tenant: { ...u.tenant, plan: "PRO" } }
            : u
        )
      );
      alert("User upgraded to PRO!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upgrade user");
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [user, fetchUsers]);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="add-user-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button onClick={addUser}>Add User</button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((u) => (
            <div key={u._id} className="user-card">
              <span>
                {u.name} - {u.email} - {u.role} -{" "}
                {u.tenant?.plan || "FREE"}
              </span>
              <button onClick={() => deleteUser(u._id)}>Delete</button>
              {u.role === "MEMBER" && u.tenant?.plan !== "PRO" && (
                <button onClick={() => upgradeUser(u._id)}>
                  Upgrade to PRO
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
