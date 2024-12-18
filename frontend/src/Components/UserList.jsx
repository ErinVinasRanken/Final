import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserItem from './UserItem.jsx';
import { NavLink } from 'react-router-dom';
import { FaSearch, FaPlus, FaFilter } from 'react-icons/fa';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    role: '',
    maxAge: '',
    minAge: '',
    sortBy: 'givenName',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await axios.get(`http://localhost:2024/api/user/list?${query}`, {
        withCredentials: true,
      });

      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err.message);
      setError('Error fetching users. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchParams);
  };

  return (
    <div className="container">
      <h1>Users</h1>
      <NavLink to="/register" className="btn btn-primary mb-4">
      <FaPlus /> Add User
      </NavLink>
      <hr />

      <form onSubmit={handleSearch} className="mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by keywords"
                name="keywords"
                value={searchParams.keywords}
                onChange={handleInputChange}
              />
              <button type="submit" className="btn btn-outline-primary">
              <FaSearch /> Search
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              name="role"
              value={searchParams.role}
              onChange={handleInputChange}
            >
              <option value="">All Roles</option>
              <option value="Developer">Developer</option>
              <option value="businessAnalyst">Business Analyst</option>
              <option value="QualityAnalyst">Quality Analyst</option>
              <option value="ProductManager">Product Manager</option>
              <option value="TechnicalManager">Technical Manager</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Max Age (days)"
              name="maxAge"
              value={searchParams.maxAge}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Min Age (days)"
              name="minAge"
              value={searchParams.minAge}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              name="sortBy"
              value={searchParams.sortBy}
              onChange={handleInputChange}
            >
              <option value="givenName">Given Name</option>
              <option value="familyName">Family Name</option>
              <option value="role">Role</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
        <FaFilter />Apply Filters
        </button>
      </form>

      <div className="row">
        {error && <p className="text-danger">{error}</p>}
        {users.length > 0 ? (
          users.map((user) => (
            <UserItem key={user._id} user={user} />
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
