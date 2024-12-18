import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaBan } from "react-icons/fa";

export default function AddEditUser() {
  const [user, setUser] = useState({
    userGivenName: "",
    userFamilyName: "",
    userEmail: "",
    userRole: "",
  });

  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    (() => {
      "use strict";
      
      const forms = document.querySelectorAll(".needs-validation");

      Array.from(forms).forEach((form) => {
        form.addEventListener(
          "submit",
          (event) => {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }

            form.classList.add("was-validated");
          },
          false
        );
      });
    })();
    console.log('Fetching User....');
    
    const fetchUser = async () => {
      if (userId) {
        try {
          const axiosResult = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${userId}`, { withCredentials: true });
          const fetchedUser = axiosResult.data.profile || {};
          console.log("Fetched User:", fetchedUser); 
          setUser({
            userGivenName: fetchedUser.givenName || "",
            userFamilyName: fetchedUser.familyName || "",
            userEmail: fetchedUser.email || "",
            userRole: (fetchedUser.role && fetchedUser.role.join(", ")) || "",
          });
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    fetchUser();
  }, [userId]);

  const addEditUser = async (evt) => {
    evt.preventDefault();
    try {
      const userData = {
        givenName: user.userGivenName || null,
        familyName: user.userFamilyName || null,
        email: user.userEmail || null,
        role: user.userRole.split(",").map((role) => role.trim()),
      };
  
      if (userId) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/user/${userId}`, userData, { withCredentials: true });
        navigate('user/list');
      } else {
        const axiosResult = await axios.post(`${import.meta.env.VITE_API_URL}/api/user`, userData, { withCredentials: true });
        if (axiosResult.data.message) {
          navigate('user/list');
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };
  

  return (
    <div className="container">
      <h1>{userId ? "Edit User" : "Add User"}</h1>
      <form className="needs-validation" noValidate onSubmit={addEditUser}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="txtUserGivenName" className="form-label">User Given Name</label>
            <input
              type="text"
              className="form-control"
              id="txtUserGivenName"
              required
              value={user.userGivenName}
              onChange={(e) => setUser({ ...user, userGivenName: e.target.value })}
            />
            <div className="valid-feedback">Looks good!</div>
            <div className="invalid-feedback">Please enter your given name.</div>
          </div>
          <div className="col-md-4">
            <label htmlFor="txtUserFamilyName" className="form-label">User Family Name</label>
            <input
              type="text"
              className="form-control"
              id="txtUserFamilyName"
              required
              value={user.userFamilyName}
              onChange={(e) => setUser({ ...user, userFamilyName: e.target.value })}
            />
            <div className="valid-feedback">Looks good!</div>
            <div className="invalid-feedback">Please enter your family name.</div>
          </div>
          <div className="col-md-4">
            <label htmlFor="txtUserEmail" className="form-label">User Email</label>
            <input
              type="email"
              className="form-control"
              id="txtUserEmail"
              required
              value={user.userEmail}
              onChange={(e) => setUser({ ...user, userEmail: e.target.value })}
            />
            <div className="valid-feedback">Looks good!</div>
            <div className="invalid-feedback">Please enter your email address.</div>
          </div>
          <div className="col-md-4">
            <label htmlFor="txtUserRole" className="form-label">User Role</label>
            <select
              className="form-control"
              id="txtUserRole"
              required
              value={user.userRole}
              onChange={(e) => setUser({ ...user, userRole: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="developer">Developer</option>
              <option value="businessAnalyst">Business Analyst</option>
              <option value="qualityAnalyst">Quality Analyst</option>
              <option value="productManager">Project Manager</option>
              <option value="technicalManager">Technical Manager</option>
            </select>
            <div className="valid-feedback">Looks good!</div>
            <div className="invalid-feedback">Please select a role.</div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3" onClick={() => navigate("/user/list")}><FaSave /> Submit Form</button>
        <button type="button" className="btn btn-secondary ms-3 mt-3" onClick={() => navigate("/user/list")}><FaBan /> Cancel</button>
      </form>
    </div>
  );
}
