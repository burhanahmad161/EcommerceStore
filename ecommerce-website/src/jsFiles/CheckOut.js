import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/CheckOut.css';
import { Link } from 'react-router-dom';
import AddReviews from './userReview';
export default function CheckOut() {
  const [formData, setFormData] = useState({
    housenumber: '',
    streetnumber: '',
    city: '',
    area: '',
    country: '',
    state: '',
    postalcode: ''
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClick = async () => {
    const currentDate = new Date().toISOString().slice(0, 10);
    setFormData((prevData) => ({
      ...prevData,
      registrationDate: currentDate,
    }));

    try {
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data sent successfully');
        setFormData({
          housenumber: '',
          streetnumber: '',
          city: '',
          country: '',
          area: '',
          state: '',
          postalcode: '',
        });
        setError('');
        setSubmitted(true);
      }
    } catch (error) {
      setError('Error sending data');
      console.error('Error sending data:', error);
    }
  };

  if (submitted) {
    return <AddReviews />;
  }

  return (
    <div id="mainDivC">
      <div className="mainFormC">
        <Fade>
          <section>
            <form className="form-registrationC">
              <input type="text" name="housenumber" placeholder="Enter House Number" value={formData.housenumber} onChange={handleChange} />
              <input type="text" name="streetnumber" placeholder="Enter Street Number" value={formData.streetnumber} onChange={handleChange} />
              <input type="text" name="city" placeholder="Enter City" value={formData.city} onChange={handleChange} />
              <input type="text" name="state" placeholder="Enter State" value={formData.state} onChange={handleChange} />
              <input type="text" name="area" placeholder="Enter Area" value={formData.area} onChange={handleChange} />
              <input type="text" name="country" placeholder="Enter Country" value={formData.country} onChange={handleChange} />
              <input type="int" name="postalcode" placeholder="Enter Postal Code" value={formData.postalcode} onChange={handleChange} />
              <button onClick={handleClick} type="button" className="btnC">CheckOut</button>
              {error && <div className="error-message">{error}</div>}
            </form>
          </section>
        </Fade>
      </div>
    </div>
  );
}
