import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LoginForm from './Components/LoginForm.jsx';
import RegisterForm from './Components/RegisterForm.jsx';
import BugSummary from './Components/BugSummary.jsx';
import BugList from './Components/BugList.jsx'; 
import BugEditor from './Components/BugEditor.jsx';
import UserSummary from './Components/UserSummary.jsx';
import UserList from './Components/UserList.jsx';
import AddEditUser from './Components/AddEditUser.jsx';
import ReportBug from './Components/ReportBug.jsx';
import Navbar from './Components/Navbar.jsx';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import { useState, useEffect } from 'react';


function App() {
  const [auth, setAuth] = useState(null); 
  const navigate = useNavigate();

  function showSuccess(message) {
    toast(message, { type: 'success', position: 'bottom-right' });
  }

  function showError(message) {
    toast(message, { type: 'error', position: 'bottom-right' });
  }

  function onLogout() {
    setAuth(null);
    localStorage.removeItem('auth');
    navigate('/');
    showSuccess('Logged out!');
  }

  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth) {
      setAuth(storedAuth);
    }
  }, []);

  return (
    <div className="container">
      <ToastContainer />
      <header>
        <Navbar auth={auth} onLogout={onLogout} />
      </header>

      <main>
        <Routes>
          <Route 
            path="/" 
            element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth} />} 
          />
          <Route 
            path="/login" 
            element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth} />} 
          />
          <Route 
            path="/register" 
            element={<RegisterForm showSuccess={showSuccess} showError={showError} />} 
          />
           <Route 
            path="bug/summary" 
            element={<BugSummary />}
          />
          <Route 
            path="bug/list" 
            element={<BugList />} 
          />
          <Route 
            path="bug/editor" 
            element={<BugEditor />} 
          />
          <Route 
            path="user/summary" 
            element={<UserSummary />} 
          />
          <Route 
            path="user/list" 
            element={<UserList />} 
          />
          <Route 
            path="user/:userId" 
            element={<AddEditUser />} 
          />
          <Route 
            path="bug/report" 
            element={<ReportBug auth={auth} showSuccess={showSuccess} showError={showError}/>} 
          />
          <Route path="/bug/:bugId" 
          element={<BugEditor auth={auth} showSuccess={showSuccess} showError={showError} />} />
        </Routes>
      </main>

      <footer>
        <p>&copy; 2024 Bug Tracker</p>
      </footer>
    </div>
  );
}

export default App;
