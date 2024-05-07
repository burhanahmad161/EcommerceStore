import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/AddProducts.css';

export default function AddCategory() {
  const [formData, setFormData] = useState({
    categoryName: '',
    isFeatured: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: inputValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/addcategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Category added successfully');
        setFormData({
          categoryName: '',
          isFeatured: false,
        });
        setError('');
      } else {
        const responseData = await response.json();
        setError(responseData.error || 'Error adding category');
      }
    } catch (error) {
      setError('Error sending data');
      console.error('Error sending data:', error);
    }
  };

  return (
    <div id="mainDiv2">
      <h1 id='addProduct'>Add Category Here</h1>
      <div className="mainForm2">
        <Fade>
          <section>
            <form className="form-registration" onSubmit={handleSubmit}>
              <input type="text" name="categoryName" placeholder="Enter Category Name" value={formData.categoryName} onChange={handleChange} />
              <label className="checkbox-label">
                Is_Featured
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
              </label>
              <button type="submit" className="btn">Add Category</button>
              {error && <div className="error-messageCategory">{error}</div>}
            </form>
          </section>
        </Fade>
      </div>
    </div>
  );
}
