"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth, googleProvider, storage } from "../../config/firebase"
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { FaGoogle } from "react-icons/fa"
import "./AuthContainer.css"
import { GoogleAuthProvider } from "firebase/auth"

const AuthContainer = () => {
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is already signed in:", user)
        setIsAuthenticated(true)
        // Remove automatic navigation
      } else {
        setIsAuthenticated(false)
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleToggle = () => {
    if (isAuthenticated) {
      // If user is already authenticated, navigate to upload page
      navigate("/upload")
    } else {
      setIsActive(!isActive)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    try {
      setUploading(true)
      setError("")
      setUploadProgress(0)
      const user = auth.currentUser
      
      if (!user) {
        setError("You must be logged in to upload files")
        return
      }

      // Generate a unique file name to prevent conflicts
      const uniqueFileName = generateUniqueFileName(file.name)
      
      // Create a reference to the file in Google Cloud Storage
      const storageRef = ref(storage, `users/${user.uid}/files/${uniqueFileName}`)
      
      // Create metadata for the file
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId: user.uid,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size.toString()
        }
      }

      // Use uploadBytesResumable for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)
      
      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
          console.log('Upload is ' + progress + '% done')
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('Upload error:', error)
          setError(`Error uploading file: ${error.message}`)
          setUploading(false)
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the public URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            setUploadSuccess("File uploaded successfully!")
            setFile(null)
            setUploadProgress(100)
            
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]')
            if (fileInput) fileInput.value = ''
          } catch (error) {
            console.error('Error getting download URL:', error)
            setError(`Error getting download URL: ${error.message}`)
          } finally {
            setUploading(false)
          }
        }
      )
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(`Error uploading file: ${error.message}`)
      setUploading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      console.log("Starting Google authentication...")
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      console.log("Google authentication successful:", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      })
      
      setIsAuthenticated(true)
      navigate("/upload")
    } catch (error) {
      console.error("Google authentication error:", error)
      setError(error.message)
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    
    try {
      setError("")
      await signInWithEmailAndPassword(auth, email, password)
      setIsAuthenticated(true)
      navigate("/upload")
    } catch (error) {
      console.error("Error signing in with email:", error)
      setError(error.message)
    }
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    if (!email || !password || !name) {
      setError("Please fill in all fields")
      return
    }
    
    try {
      setError("")
      await createUserWithEmailAndPassword(auth, email, password)
      setIsAuthenticated(true)
      navigate("/upload")
    } catch (error) {
      console.error("Error signing up with email:", error)
      setError(error.message)
    }
  }

  // If user is already authenticated, show a message and redirect button
  if (isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="already-authenticated">
          <h1>You're Already Signed In</h1>
          <p>You're already authenticated. Click the button below to go to the upload page.</p>
          <button 
            className="primary-button"
            onClick={() => navigate("/upload")}
          >
            Go to Upload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`auth-container ${isActive ? "active" : ""}`}>
      {/* Sign-In Form */}
      <div className={`signin-form ${isActive ? "active" : ""}`}>
        <form onSubmit={handleEmailSignIn}>
          <h1>Sign In</h1>
          <div className="social-container">
            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="google-sign-in-button"
            >
              <FaGoogle className="google-icon" />
              Sign in with Google
            </button>
          </div>
          <span className="form-subtitle">or use your email for login</span>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="#" className="forgot-password">
            Forgot Your Password?
          </a>
          <button type="submit" className="primary-button">
            Sign In
          </button>
        </form>
      </div>

      {/* Sign-Up Form */}
      <div className={`signup-form ${isActive ? "active" : ""}`}>
        <form onSubmit={handleEmailSignUp}>
          <h1>Create Account</h1>
          <div className="social-container">
            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="google-sign-in-button"
            >
              <FaGoogle className="google-icon" />
              Sign up with Google
            </button>
          </div>
          <span className="form-subtitle">or use your email for registration</span>
          <input 
            type="text" 
            placeholder="Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="primary-button">
            Sign Up
          </button>
        </form>
      </div>

      {/* Toggle Panel */}
      <div className={`toggle-container ${isActive ? "active" : ""}`}>
        <div className={`toggle-panel toggle-left ${isActive ? "active" : ""}`}>
          <h1>Welcome Back!</h1>
          <p>Enter your personal details to use all of the site's features</p>
          <button className="secondary-button" onClick={handleToggle}>
            Sign In
          </button>
        </div>
        <div className={`toggle-panel toggle-right ${isActive ? "active" : ""}`}>
          <h1>Hello, Friend!</h1>
          <p>Register to access all site features</p>
          <button className="secondary-button" onClick={handleToggle}>
            Sign Up
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  )
}

export default AuthContainer

