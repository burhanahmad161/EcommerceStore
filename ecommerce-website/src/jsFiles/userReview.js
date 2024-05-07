import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/userReview.css'; // Make sure to create the CSS file for styling

export default function AddReviews() {
  const [formData, setFormData] = useState({
    rating: '',
    reviewText: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentDate = new Date().toISOString().slice(0, 10);
    setFormData((prevData) => ({
      ...prevData,
      registrationDate: currentDate,
    }));
  
    try {
      const response = await fetch('http://localhost:5000/api/addreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        console.log('Review added successfully');
        setFormData({
          rating: '',
          reviewText: ''
        });
        window.location.href = '/';
      } else {
        const responseData = await response.text(); // Read response as text
        console.log('Error response:', responseData); // Log the response for debugging
        setError(responseData || 'Failed to add review');
      }
    } catch (error) {
      setError('Error adding review');
      console.error('Error adding review:', error);
    }
  };
  

  return (
    <div id="mainDivvvv">
      <div className="mainFormmmm">
        <Fade>
          <section>
            <form className="form-review" onSubmit={handleSubmit}>
              <input type="number" name="rating" placeholder="Rating (1-5)" min="1" max="5" value={formData.rating} onChange={handleChange} />
              <textarea name="reviewText" placeholder="Write your review..." value={formData.reviewText} onChange={handleChange} />
              <button type="submit" className="btnnnn">Submit Review</button>
              {error && <div className="error-message">{error}</div>}
            </form>
          </section>
        </Fade>
      </div>
    </div>
  );
}
