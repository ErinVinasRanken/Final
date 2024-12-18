import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { FaSave } from "react-icons/fa";


const ReportBug = ({ auth, showSuccess, showError }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try {
      if (!auth || !auth.token) {
        return showError("You are not logged in!");
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bug/report`,
        { title, description, classification, status },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,  
          },
          withCredentials: true, 
        }
      );

      showSuccess("Bug reported successfully!");
      setTitle("");
      setDescription("");
      setClassification("");
      setStatus("");
    } catch (error) {
      console.error("Error reporting bug:", error.response || error);
      if (error.response?.status === 403) {
        showError("You do not have permission to report bugs.");
      } else {
        showError("Failed to report the bug. Please try again.");
      }
    }
  };

  return (
    <div className="container">
      <h1>Report a New Bug</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="bugTitle" className="form-label">Title</label>
          <input
            type="text"
            id="bugTitle"
            className="form-control"
            value={title}
            onChange={(evt) => setTitle(evt.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="bugDescription" className="form-label">Description</label>
          <textarea
            id="bugDescription"
            className="form-control"
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
            rows="5"
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="bugClassification" className="form-label">Classification</label>
          <select
            id="bugClassification"
            className="form-select"
            value={classification}
            onChange={(evt) => setClassification(evt.target.value)}
          >
            <option value="">Select a Classification</option>
            <option value="classified">Classified</option>
            <option value="unclassified">Unclassified</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="bugStatus" className="form-label">Status</label>
          <select
            id="bugStatus"
            className="form-select"
            value={status}
            onChange={(evt) => setStatus(evt.target.value)}
          >
            <option value="">Select a status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary"><FaSave /> Submit Bug</button>
      </form>
    </div>
  );
};

ReportBug.propTypes = {
  auth: PropTypes.object.isRequired,
  showSuccess: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
};

export default ReportBug;
