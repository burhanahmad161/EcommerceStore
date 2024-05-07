import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { AddCircleOutline, DeleteOutline, RemoveCircleOutline } from '@mui/icons-material';
import '../cssFiles/ViewCart.css'; // Import CSS file for styling
import { Link } from 'react-router-dom';

export default function ViewCart() {
  const [cartData, setCartData] = useState([]);
  const [totalBill, setTotalBill] = useState();
  const [shipmentMethod, setShipmentMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  
  const fetchCartData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/getcartdata');
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
        setLoading(false);
        setError('');
      } else {
        setError('Error fetching cart data');
        setLoading(false);
      }
    } catch (error) {
      setError('Error fetching cart data');
      setLoading(false);
      console.error('Error fetching cart data:', error);
    }
  };

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/viewshippingmethods');
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
    fetchCartData();
    fetchShippingMethods();
  }, []);

  const handleIncreaseQuantity = (index) => {
    setCartData((prevCartData) =>
      prevCartData.map((product, i) =>
        i === index ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  const handleDecreaseQuantity = (index) => {
    setCartData((prevCartData) =>
      prevCartData.map((product, i) =>
        i === index && product.quantity > 1 ? { ...product, quantity: product.quantity - 1 } : product
      )
    );
  };

  const handleClickRemove = (index) => {
    const updatedCartData = cartData.filter((product, i) => i !== index);
    setCartData(updatedCartData);
  };

  const calculateTotalBill = () => {
    const bill = cartData.reduce((total, product) => total + (product.Price * product.quantity), 0);
    console.log('Calculated Total Bill:', bill);
    setTotalBill(bill);
    handleCheckout();
  }

  const handleCheckout = async () => {
    try {
      // Prepare data for the order API
      const orderData = {
        totalBill,
        shipmentMethod,
        paymentMethod,
        currentDate: new Date().toDateString(),
      };
  
      // Call the order API
      const orderResponse = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (!orderResponse.ok) {
        throw new Error('Error during order placement.');
      }
  
      console.log('Order placed successfully.');
  
      // Prepare data for the totalsales API
      const cartItems = cartData.map((product) => ({
        productId: product.ProductId, // Assuming product Id is available in your cart data
        quantity: product.quantity,
        price: product.Price,
      }));
  
      const totalsalesData = {
        items: cartItems,
      };
  
      // Call the totalsales API
      const totalsalesResponse = await fetch('http://localhost:5000/api/totalsales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(totalsalesData),
      });
  
      if (!totalsalesResponse.ok) {
        throw new Error('Error during sales data insertion.');
      }
  
      console.log('Sales data added successfully.');  
      // If both API calls are successful, update the state or perform other actions
      setCartData([]); // Clear cart after successful checkout
      setTotalBill(0); // Reset total bill
      setShipmentMethod(''); // Reset shipment method
      setPaymentMethod(''); // Reset payment method
    } catch (error) {
      setError('Error during checkout.');
      console.error('Error during checkout:', error);
    }
  };
  

  if (loading) {
    return <div>Loading cart data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!cartData || cartData.length === 0) {
    return <div>No products in the cart</div>;
  }

  return (
    <div id='mainContainer'>
      <h1 id="topHead">Cart</h1>
      <div className="centered-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Manage Quantity</th>
            </tr>
          </thead>
          <tbody>
            {cartData.map((product, index) => (
              <tr key={index}>
                <td>{product.Name}</td>
                <td>Rs. {product.Price}.00</td>
                <td>{product.quantity}</td>
                <td>
                  <IconButton aria-label="remove" onClick={() => handleDecreaseQuantity(index)}>
                    <RemoveCircleOutline />
                  </IconButton>
                  <IconButton aria-label="add" onClick={() => handleIncreaseQuantity(index)}>
                    <AddCircleOutline />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleClickRemove(index)}>
                    <DeleteOutline />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="checkout-container">
        <label htmlFor="shipmentMethod">Select Shipment Method:</label>
        <select id="shipmentMethod" name="shipmentMethod" value={shipmentMethod} onChange={(e) => setShipmentMethod(e.target.value)}>
          <option value="">Select Method</option>
          {shippingMethods.map((method, index) => (
            <option key={index} value={method.Name}>{method.Name}</option>
          ))}
        </select>
        <label htmlFor="paymentMethod">Select Payment Method:</label>
        <select id="paymentMethod" name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Select Method</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="Online Payment">Online Payment</option>
        </select>
        <Link to="/checkout">
          <button onClick={calculateTotalBill} id="checkOutButton">Check Out</button>
        </Link>
      </div>
    </div>
  );
}
