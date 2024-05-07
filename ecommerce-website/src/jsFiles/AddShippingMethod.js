import React, { useState } from 'react';
import { Fade } from 'react-reveal';
import '../cssFiles/AddShippingMethod.css';

export default function AddShippingMethod() {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        deliverydate: '',
        isInternational: false,
        isActive: false,
        weight: '',
        minorder: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prevData) => ({
            ...prevData,
            [name]: newValue,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/addshippingmethod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Data sent successfully');
                setFormData({
                    name: '',
                    price: '',
                    deliverydate: '',
                    isInternational: false,
                    isActive: false,
                    weight: '',
                    minorder: ''
                });
                setError('');
            } 
        } catch (error) {
            setError('Error sending data');
            console.error('Error sending data:', error);
        }
    };

    return (
        <div id="mainDiv2">
            <h1 id='addProduct'>Add Shipping Method</h1>
            <div className="mainForm2">
                <Fade>
                    <section>
                        <form className="form-registration" onSubmit={handleSubmit}>
                            <input type="text" name="name" placeholder="Enter Shipping Method Name" value={formData.name} onChange={handleChange} />
                            <input type="text" name="price" placeholder="Enter Price" value={formData.price} onChange={handleChange} />
                            <input type="date" name="deliverydate" placeholder="Enter Estimated Delivery Date" value={formData.deliverydate} onChange={handleChange} />
                            <label htmlFor="isInternational">Is International:</label>
                            <input type="checkbox" name="isInternational" checked={formData.isInternational} onChange={handleChange} />
                            <label htmlFor="isActive">Is Active:</label>
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                            <input type="text" name="weight" placeholder="Enter Order Weight" value={formData.weight} onChange={handleChange} />
                            <input type="text" name="minorder" placeholder="Enter Minimum Order Quantity" value={formData.minorder} onChange={handleChange} />
                            <button type="submit" className="btn">Add Product</button>
                            {error && <div className="error-message3">{error}</div>}
                        </form>
                    </section>
                </Fade>
            </div>
        </div>
    );
}





















