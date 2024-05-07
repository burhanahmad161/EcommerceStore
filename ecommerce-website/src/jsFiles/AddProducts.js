import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/AddProducts.css';
import { useEffect } from 'react';
export default function AddProducts() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shipmentMethod, setShipmentMethod] = useState('');
  const [formData, setFormData] = useState({
    productname: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: '',
  });
  const [error, setError] = useState('');
  const fetchShippingMethods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/viewcategories');
      if (response.ok) {
        const data = await response.json();
        setShippingMethods(data);
      } else {
        setError('Error fetching shipping methods');
      }
    } catch (error) {
      setError('Error fetching shipping methods');
      console.error('Error fetching shipping methods:', error);
    }
  };

  useEffect(() => {
    fetchShippingMethods();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
    }));

    try {
      const response = await fetch('http://localhost:5000/api/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data sent successfully');
        setFormData({
          productname: '',
          description: '',
          price: '',
          image: '',
          stock: '',
          category: '',
        });
        setError('');
      } else {
        const responseData = await response.json();
        if (responseData.error && responseData.error.includes('duplicate key')) {
          setError('This Product already exists!');
        } else {
          setError('This Product already exists!');
        }
      }
    } catch (error) {
      setError('Error sending data');
      console.error('Error sending data:', error);
    }
  };
  return (
    <div id="mainDiv2">
      <h1 id='addProduct'>Add Product Here</h1>
      <div className="mainForm2">
        <Fade>
          <section>
            <form className="form-registration" onSubmit={handleSubmit}>
              <input type="text" name="productname" placeholder="Enter Product Name" value={formData.productname} onChange={handleChange} />
              <input type="text" name="price" placeholder="Enter Product Price" value={formData.price} onChange={handleChange} />
              <input type="text" name="stock" placeholder="Enter Product Stock" value={formData.stock} onChange={handleChange} />
              <input type="text" name="image" placeholder="Enter Product Image URL" value={formData.image} onChange={handleChange} />
              <input type="text" name="description" placeholder="Enter Brand Name" value={formData.description} onChange={handleChange} />
              <label htmlFor="paymentMethod">Select Category:</label>
              <select id="categorySelection" name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Method</option>
                {shippingMethods.map((method, index) => (
                  <option key={index} value={method.CategoryId}>{method.Name}</option>
                ))}
              </select>
              <button type="submit" className="btn">Add Prodcut</button>
              {error && <div className="error-message3">{error}</div>}
            </form>
          </section>
        </Fade>
      </div>
    </div>
  );
}