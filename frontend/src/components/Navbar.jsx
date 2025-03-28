import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="logo">
            CloudVault
          </Link>
          <div className="nav-links">
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Contact
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Dashboard
                </NavLink>
                <NavLink to="/files" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Files
                </NavLink>
                <NavLink to="/upload" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Upload
                </NavLink>
              </>
            )}
          </div>
        </div>
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="auth-buttons">
              <button className="btn-profile">Profile</button>
              <button className="btn-signout">Sign Out</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-signin">Sign In</Link>
              <Link to="/signup" className="btn-signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 