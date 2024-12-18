import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const Navbar = ({auth, onLogout}) => {

  const onClickLogout = (evt) => {
    evt.preventDefault();
    onLogout();
  }
  return(
  <>
 <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <a className="navbar-brand" href="#">Navbar</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav w-100">
       
        {auth ? (
        <>
         <li className="nav-item">
          <NavLink className="nav-link active" aria-current="page" to="/">Home</NavLink>
        </li>

         <li className="nav-item">
          <NavLink className="nav-link" to="user/list">Registered Users</NavLink>
        </li>

        <li className="nav-item ms-lg-auto">
          <NavLink className="nav-link" to="bug/list">Bug List</NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link" to="user/me">Welcome {auth.email}</NavLink>
        </li>
          
        <li className="nav-item ms-lg-auto">
          <NavLink className="nav-link" to="bug/report">Report A Bug</NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link" onClick={(evt) => onClickLogout(evt)}>Logout</NavLink>
        </li>
        </> 
        ) : (
        <>
          <li className="nav-item">
            <NavLink to="/login" className='nav-link'>Login</NavLink>
          </li>
          <li className="nav-item">
          <NavLink to="/register" className='nav-link'>Register</NavLink>
        </li>
        </>
         ) }
          
      </ul>
    </div>
  </div>
</nav>
  </>
  );
};

Navbar.propTypes = {
  auth: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
