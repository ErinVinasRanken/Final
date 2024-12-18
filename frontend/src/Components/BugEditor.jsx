import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaBan, FaArrowAltCircleRight } from "react-icons/fa";

export default function EditBug() {
  const [bug, setBug] = useState({
    title: '',
    classification: '',
    assignedTo: '',
    status: '',
    comments: [],
  });

  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const { bugId } = useParams();

  useEffect(() => {
    const fetchBug = async () => {
      if (bugId) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}`, { withCredentials: true });
          const fetchedBug = response.data.bug || {};
          console.log("Fetched Bug Data:", fetchedBug);
  
          setBug({
            title: fetchedBug.title || '',
            classification: fetchedBug.classification || '',
            assignedTo: fetchedBug.assignedTo || '',
            status: fetchedBug.status || '',
            comments: fetchedBug.comments || [],
          });
          setComments(fetchedBug.comments || []);
  
        } catch (error) {
          console.error('Error fetching bug:', error.response ? error.response.data : error.message);
          if (error.response && error.response.data && error.response.data.error) {
            console.error('Permissions error details:', error.response.data.error);
          }
        }
      }
    };
  
    fetchBug();
  }, [bugId]);
  

  const editBug = async (evt) => {
    evt.preventDefault();
    try {
      const bugData = {
        title: bug.title || undefined,
        classification: bug.classification || undefined,
        assignedTo: bug.assignedTo || undefined,
        status: bug.status || undefined,
      };
  
      if (bugId) {
        const response = await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/bug/${bugId}`,
          bugData,
          { withCredentials: true }
        );
        console.log('Bug updated successfully:', response.data);
        navigate('/bug/list');
      }
    } catch (error) {
      console.error('Error saving bug:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data) {
        console.error('Validation errors:', error.response.data);
      }
    }
  }

  const addComment = async (commentText) => {
    try {
      const newComment = { comment: commentText };
      const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}/comments`, newComment, { withCredentials: true });
      setComments([...comments, result.data.comment]);
    } catch (error) {
      console.error('Error adding comment:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="container">
      <h1>Edit Bug</h1>
      <form className="needs-validation" noValidate onSubmit={editBug}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="txtTitle" className="form-label"> Bug Title</label>
            <input
              type="text"
              className="form-control"
              id="txtTitle"
              value={bug.title}
              onChange={(e) => setBug({ ...bug, title: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="txtClassification" className="form-label"> Classify Bug</label>
            <select
              className="form-select"
              id="txtClassification"
              value={bug.classification}
              onChange={(e) => setBug({ ...bug, classification: e.target.value })}
              required
            >
              <option value="">Select Classification</option>
              <option value="classified">classified</option>
              <option value="unclassified">Non-Classified</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="txtAssignedTo" className="form-label"> Assign Bug</label>
            <select
              className="form-select"
              id="txtAssignedTo"
              value={bug.assignedTo}
              onChange={(e) => setBug({ ...bug, assignedTo: e.target.value })}
              required
            >
              <option value="">Select Assignee</option>
              <option value="janeDoe">Jane Doe</option>
              <option value="johnSmith">John Smith</option>
              <option value="samFrancis">Sam Francis</option>
              <option value="evanGudmestad">Evan Gudmestad</option>
              <option value="johnDoe">John Doe</option>
              <option value="brockReece">Brock Reece</option>
              <option value="remiLong">Remi Long</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="txtStatus" className="form-label">Bug Open/Close</label>
            <select
              className="form-select"
              id="txtStatus"
              value={bug.status}
              onChange={(e) => setBug({ ...bug, status: e.target.value })}
              required
            >
              <option value="">Select Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3"onClick={() => navigate("/bug/list")}><FaSave /> Save Changes</button>
        <button type="button" className="btn btn-secondary ms-3 mt-3" onClick={() => navigate("/bug/list")}><FaBan /> Cancel</button>
      </form>

      <hr />

      <div>
        <h2>Comments</h2>
        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment._id}>
                <p><strong>{comment.author}:</strong> {comment.comment}</p>
                <p className="text-muted small">{new Date(comment.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments available</p>
        )}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        addComment(e.target.comment.value);
        e.target.reset();
      }}>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Add a comment"
            name="comment"
            required
          />
          <button className="btn btn-primary" type="submit"><FaArrowAltCircleRight /> Post</button>
        </div>
      </form>
    </div>
  );
}
