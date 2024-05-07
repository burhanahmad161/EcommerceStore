import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/userSignIn.css';
import UserParent from './UserParent';
import AdminParent from './AdminParent'; // Import the AdminParent component
import UserSignUpPage from './userSignUp'; // Import the UserSignUpPage component

export default function UserSignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // State to store user role
  const [showSignUp, setShowSignUp] = useState(false); // State to show SignUp component

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login successful');
        setLoggedIn(true);
        setUserRole(responseData.user.Role);
        setError('');
      } else {
        const responseData = await response.json();
        setError(responseData.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    setShowSignUp(true); // Set the state to show SignUp component
  };

  return (
    <div id="mainDiv1">
      {loggedIn ? (
        <div>
          {userRole === 'Customer' ? (
            <UserParent />
          ) : userRole === 'Admin' ? (
            <AdminParent />
          ) : null}
        </div>
      ) : showSignUp ? (
        <UserSignUpPage />
      ) : (
        <div className="mainForm1">
          <h1 id="headerh1">Login Here!</h1>
          <Fade>
            <section>
              <form className="form-registration" onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Enter your Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Enter your Password" value={formData.password} onChange={handleChange} required />
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Submit'}
                </button>
                {error && <div className="error-message1">{error}</div>}
              </form>
            </section>
            <p className="aProp1" onClick={handleSignUpClick}>Don't have an account? SignUp Here...</p>
          </Fade>
        </div>
      )}
    </div>
  );
}
