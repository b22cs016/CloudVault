import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Navbar from "./components/Navbar";
import AuthContainer from "./pages/Auth/AuthContainer";
import ThemeToggle from "./components/ThemeToggle";
import FileUpload from './pages/FileUpload/FileUpload';
import TestUpload from './pages/FileUpload/TestUpload';
import { auth } from './config/firebase';

import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<AuthContainer />} />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/test-upload" 
          element={
            <ProtectedRoute>
              <TestUpload />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;