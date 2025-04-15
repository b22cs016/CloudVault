import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
              <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth" className="btn-signin">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 