// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function EditUser() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     role: "",
//   });

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const { data } = await axios.get(
//           `${import.meta.env.VITE_API_URL}user/${id}`,
//           { withCredentials: true }
//         );
//         setFormData(data);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       }
//     };
//     fetchUser();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}user/${id}`,
//         formData,
//         { withCredentials: true }
//       );
//       navigate("/users");
//     } catch (error) {
//       console.error("Error updating user:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Edit User</h1>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label htmlFor="name" className="form-label">Name</label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             className="form-control"
//             value={formData.name}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="mb-3">
//           <label htmlFor="email" className="form-label">Email</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             className="form-control"
//             value={formData.email}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="mb-3">
//           <label htmlFor="role" className="form-label">Role</label>
//           <input
//             type="text"
//             id="role"
//             name="role"
//             className="form-control"
//             value={formData.role}
//             onChange={handleChange}
//           />
//         </div>
//         <button type="submit" className="btn btn-primary">Save Changes</button>
//       </form>
//     </div>
//   );
// }
