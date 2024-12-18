// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";

// export default function EditBug() {
//   const [bug, setBug] = useState({
//     bugComment: "",
//     bugAddComment: "",
//     bugClassify: "",
//     bugAssign: "",
//     bugClose: "",
//     bugOpen: "",
//   });

//   const [comments, setComments] = useState([]);
//   const navigate = useNavigate();
//   const { bugId } = useParams();

//   useEffect(() => {
//     const fetchBug = async () => {
//       if (bugId) {
//         try {
//           const axiosResult = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}`, { withCredentials: true });
//           const fetchedBug = axiosResult.data.profile || {};
//           setBug({
//             bugComment: fetchedBug.bugComment || "",
//             bugAddComment: fetchedBug.bugAddComment || "",
//             bugClassify: fetchedBug.bugClassify || "",
//             bugAssign: fetchedBug.bugAssign || "", 
//             bugClose: fetchedBug.bugClose || "",
//             bugOpen: fetchedBug.bugOpen || "",
//           });
//           setComments(fetchedBug.comments || []);
//         } catch (error) {
//           console.error("Error fetching bug:", error);
//         }
//       }
//     };
//     fetchBug();
//   }, [bugId]);

//   const editBug = async (evt) => {
//     evt.preventDefault();
//     try {
//       const bugData = {
//         bugComment: bug.bugComment || null,
//         bugAddComment: bug.bugAddComment || null,
//         bugClassify: bug.bugClassify || null,
//         bugAssign: bug.bugAssign || null, 
//         bugClose: bug.bugClose || null,
//         bugOpen: bug.bugOpen || null,
//       };

//       if (bugId) {
//         await axios.patch(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}`, bugData, { withCredentials: true });
//         navigate('/bug/list');
//       }
//     } catch (error) {
//       console.error("Error saving bug:", error);
//     }
//   };

//   const addComment = async (comment) => {
//     try {
//       const newComment = { comment };
//       const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}/comment`, newComment, { withCredentials: true });
//       setComments([...comments, result.data.comment]);
//     } catch (error) {
//       console.error("Error adding comment:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Edit Bug</h1>
//       <form className="needs-validation" noValidate onSubmit={editBug}>
//         <div className="row mb-3">
//           <div className="col-md-4">
//             <label htmlFor="txtBugClassify" className="form-label">Bug Classify</label>
//             <select
//               className="form-select"
//               id="txtBugClassify"
//               value={bug.bugClassify}
//               onChange={(e) => setBug({ ...bug, bugClassify: e.target.value })}
//               required
//             >
//               <option value="">Select Classification</option>
//               <option value="bug">Bug</option>
//               <option value="feature">Feature</option>
//               <option value="improvement">Improvement</option>
//             </select>
//           </div>

//           <div className="col-md-4">
//             <label htmlFor="txtBugAssign" className="form-label">Bug Assign</label>
//             <select
//               className="form-select"
//               id="txtBugAssign"
//               value={bug.bugAssign}
//               onChange={(e) => setBug({ ...bug, bugAssign: e.target.value })}
//               required
//             >
//               <option value="">Select Assignee</option>
//               <option value="user1">User 1</option>
//               <option value="user2">User 2</option>
//               <option value="user3">User 3</option>
//             </select>
//           </div>

//           <div className="col-md-4">
//             <label htmlFor="txtBugClose" className="form-label">Bug Status</label>
//             <select
//               className="form-select"
//               id="txtBugClose"
//               value={bug.bugClose}
//               onChange={(e) => setBug({ ...bug, bugClose: e.target.value })}
//               required
//             >
//               <option value="">Select Status</option>
//               <option value="open">Open</option>
//               <option value="closed">Closed</option>
//             </select>
//           </div>

//           <div className="col-md-4">
//             <label htmlFor="txtBugOpen" className="form-label">Bug Open/Close</label>
//             <select
//               className="form-select"
//               id="txtBugOpen"
//               value={bug.bugOpen}
//               onChange={(e) => setBug({ ...bug, bugOpen: e.target.value })}
//               required
//             >
//               <option value="">Select Status</option>
//               <option value="open">Open</option>
//               <option value="closed">Closed</option>
//             </select>
//           </div>
//         </div>
//         <button type="submit" className="btn btn-primary mt-3">Save Changes</button>
//         <button type="button" className="btn btn-secondary ms-3 mt-3" onClick={() => navigate("/bug/list")}>Cancel</button>
//       </form>

//       <hr />

//       <div>
//         <h2>Comments</h2>
//         {comments.length > 0 ? (
//           <ul className="list-group">
//             {comments.sort((a, b) => new Date(a.date) - new Date(b.date)).map(comment => (
//               <li key={comment.id} className="list-group-item">
//                 <p>{comment.text}</p>
//                 <p className="text-muted small">{new Date(comment.date).toLocaleString()}</p>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No comments available</p>
//         )}
//       </div>

//       <hr />

//       <form onSubmit={(e) => {
//         e.preventDefault();
//         addComment(e.target.comment.value);
//         e.target.reset();
//       }}>
//         <div className="input-group mb-3">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Add a comment"
//             name="comment"
//             required
//           />
//           <button className="btn btn-primary" type="submit">Post</button>
//         </div>
//       </form>
//     </div>
//   );
// }
