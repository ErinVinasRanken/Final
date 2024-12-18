import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { FaSearch, FaPlus, FaFilter, FaPencilAlt } from 'react-icons/fa';

const BugList = () => {
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    classification: '',
    maxAge: '',
    minAge: '',
    closed: '',
    sortBy: 'newest',
  });

  const fetchBugs = async () => {
    try {
      const params = { ...searchParams };
      const response = await axios.get('http://localhost:2024/api/bug/list', { params, withCredentials: true });
      console.log('API Response:', response.data);
      if (response.data.bugs && response.data.bugs.length > 0) {
        setBugs(response.data.bugs);
        setError('');
      } else {
        setBugs([]);
        setError('No bugs found');
      }
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError('Error fetching bugs. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBugs();
  };

  const handleEdit = (bugId) => {
    window.location.href = `/bug/${bugId}`;
  };

  useEffect(() => {
    fetchBugs();
  }, [searchParams]);

  return (
    <div className="container">
      <h1>Bugs</h1>
      <NavLink to="/bug/report" className="btn btn-primary mb-4">
        <FaPlus/>Add Bug
      </NavLink>
      <hr />

      <form onSubmit={handleSearch} className="mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Keywords"
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
              name="classification"
              value={searchParams.classification}
              onChange={handleInputChange}
            >
              <option value="">All Classifications</option>
              <option value="classified">Classified</option>
              <option value="unclassified">Unclassified</option>
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

          <div className="col-md-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="closedCheckbox"
                name="closed"
                checked={searchParams.closed}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="closedCheckbox">
                Include Closed
              </label>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              name="sortBy"
              value={searchParams.sortBy}
              onChange={handleInputChange}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
              <option value="classification">Classification</option>
              <option value="assignedTo">Assigned To</option>
              <option value="createdBy">Reported By</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
        <FaFilter />Apply Filters
        </button>
      </form>

      <div className="row">
        {error && <p className="text-danger">{error}</p>}
        {bugs.length > 0 ? (
          bugs.map((bug) => (
            <div key={bug._id} className="bug-item card p-3 mb-3">
              <h3>{bug.title}</h3>
              <p><strong>Description:</strong> {bug.description}</p>
              <p><strong>Assigned To:</strong> {bug.assignedTo}</p>
              <p><strong>Status:</strong> {bug.status}</p>
              <p><strong>Created By:</strong> {bug.createdBy}</p>
              <p><strong>Created On:</strong> {new Date(bug.createdAt).toLocaleDateString()}</p>
              <h5>Comments:</h5>
              {bug.comments && bug.comments.length > 0 ? (
                <ul className="comments-list">
                  {bug.comments.map((comment) => (
                    <li key={comment.commentId}>
                      <p><strong>{comment.author}:</strong> {comment.comment}</p>
                      <p className="text-muted small">{new Date(comment.date).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments available</p>
              )}
              <h5>Test Cases:</h5>
              {bug.testCases && bug.testCases.length > 0 ? (
                <ul className="test-cases-list">
                  {bug.testCases.map((testCase, index) => (
                    <li key={index}>
                      <p><strong>Description:</strong> {testCase.description}</p>
                      <p><strong>Status:</strong> {testCase.status}</p>
                      <p><strong>Error Message:</strong> {testCase.errorMessage}</p>
                      <p className="text-muted small">Last Updated On: {new Date(testCase.lastUpdatedOn).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No test cases available</p>
              )}
              <div className="mt-2">
                <button className="btn btn-warning" onClick={() => handleEdit(bug._id)}><FaPencilAlt />Edit</button>
              </div>
            </div>
          ))
        ) : (
          <p>No bugs found</p>
        )}
      </div>
    </div>
  );
};

export default BugList;
