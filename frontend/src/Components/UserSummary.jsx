import { useState, useEffect } from "react";
import "./userSummary.css";
import axios from "axios";

export default function UserSummary() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://localhost:2024/api/user/me");
        setUsers(response.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching user:", e);
        setError("Failed to load user. Please try again.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-list">
      <h1>Bug Tracker</h1>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="user-item"
          >
            {user.name}
          </li>
        ))}
      </ul>
      {selectedUser && (
        <div className="selected-user-details">
          <h2>User Details</h2>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
          <p>Role: {selectedUser.role}</p>
        </div>
      )}
    </div>
  );
}
