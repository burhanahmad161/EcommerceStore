import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/userSignUp.css';
import UserSignInPage from './userSignIn'; // Assuming the file name and import are correct

export default function UserSignUpPage() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    age: '',
    gender: '',
    role: '',
    registrationDate: '', // Include registrationDate in formData
  });
  const [error, setError] = useState('');
  const [isSignInClicked, setIsSignInClicked] = useState(false); // State to track if "Already Registered?" is clicked

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignInClick = () => {
    setIsSignInClicked(true); // Set the state to indicate "Already Registered?" is clicked
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentDate = new Date().toISOString().slice(0, 10);
    setFormData((prevData) => ({
      ...prevData,
      registrationDate: currentDate,
    }));

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data sent successfully');
        setFormData({
          firstname: '',
          lastname: '',
          username: '',
          password: '',
          email: '',
          phoneNumber: '',
          age: '',
          gender: '',
          role: '',
          registrationDate: '', // Clear registrationDate after successful submission
        });
        setIsSignInClicked(true);
        setError('');
      } else {
        const responseData = await response.json();
        if (responseData.error && responseData.error.includes('duplicate key')) {
          setError('User with similar username already exists!');
        } else {
          setError('Error sending data');
        }
      }
    } catch (error) {
      setError('Error sending data');
      console.error('Error sending data:', error);
    }
  };

  if (isSignInClicked) {
    return <UserSignInPage />;
  }

  return (
    <div id="mainDiv">
      <h1 id="header-h1">Register Here!</h1>
      <div className="mainForm">
        <Fade>
          <section>
            <form className="form-registration" onSubmit={handleSubmit}>
              <input type="text" name="firstname" placeholder="Enter your First Name" value={formData.firstname} onChange={handleChange} />
              <input type="text" name="lastname" placeholder="Enter your Last Name" value={formData.lastname} onChange={handleChange} />
              <input type="text" name="username" placeholder="Enter your Username" value={formData.username} onChange={handleChange} />
              <input type="password" name="password" placeholder="Enter your Password" value={formData.password} onChange={handleChange} />
              <input type="email" name="email" placeholder="Enter your Email" value={formData.email} onChange={handleChange} />
              <input type="text" name="phoneNumber" placeholder="Enter your Phone Number" value={formData.phoneNumber} onChange={handleChange} />
              <input type="number" name="age" placeholder="Enter your Age" value={formData.age} onChange={handleChange} />
              <label htmlFor="role">Select Role:</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="default">Select Role:</option>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
              <label htmlFor="gender">Select Gender:</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="default">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <button type="submit" className="btn">Submit</button>
              {error && <div className="error-message">{error}</div>}
            </form>
          </section>
          <p className="aProp" onClick={handleSignInClick}>Already Registered? Login Here...</p>
        </Fade>
      </div>
    </div>
  );
}
