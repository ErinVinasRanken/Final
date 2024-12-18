import { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './LoginForm.css';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; 

export default function LoginForm({ showSuccess, showError, setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (() => {
      'use strict';

      const forms = document.querySelectorAll('.needs-validation');

      Array.from(forms).forEach((form) => {
        form.addEventListener('submit', (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add('was-validated');
        }, false);
      });
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let response = await axios.post(
        `http://localhost:2024/api/user/login`, { email, password }, { withCredentials: true });
        console.log(import.meta.env.VITE_API_URL);
        if (response.status === 200) {
          if(response.data.message == 'Invalid email or password'){
            showError(response.data.message);
          }else{
          showSuccess(response.data.message);
          setAuth(response.data);
          localStorage.setItem('auth', JSON.stringify(response.data));
          navigate('/user/list');
        }
        }
      } catch (e) {
        console.error(`Catch Block: ${e.response ? e.response.data : e.message}`);
        showError(e.response?.data?.message || 'An error occurred while logging in.');
      }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Login</h2>
          <form className="needs-validation login-form" noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text" id="email-addon">
                  <i className="bi bi-envelope-fill input-icon"></i>
                </span>

              <input type="email" className="form-control input-field" id="email" aria-describedby="email-addon" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
                <div className="invalid-feedback">Please enter a valid email address.</div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text" id="password-addon">
                  <i className="bi bi-lock-fill input-icon"></i>
                </span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control input-field"
                  id="password"
                  aria-describedby="password-addon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={5} 
                />

                <span className="input-group-text" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`input-icon bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </span>
                <div className="invalid-feedback">
                Please enter a password at least 5 characters long.
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          
          </form>
          </div>
          </div>
          </>
  );
}

LoginForm.propTypes = {
  showSuccess: PropTypes.func.isRequired, 
  showError: PropTypes.func.isRequired,   
  setAuth: PropTypes.func.isRequired,     
};
