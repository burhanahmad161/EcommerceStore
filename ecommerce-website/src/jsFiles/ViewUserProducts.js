import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import ProductCard from './ProductCard';
import '../cssFiles/ViewUserProducts.css';

const DisplayProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/viewproducts');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError('Error fetching products');
        }
      } catch (error) {
        setError('Error fetching products');
        console.error('Error fetching products:', error);
      }
    }

    async function fetchCartData() {
      try {
        const response = await fetch('http://localhost:5000/api/getcartdata');
        if (response.ok) {
          const data = await response.json();
          setProductsList(data);
        } else {
          setError('Error fetching cart data');
        }
      } catch (error) {
        setError('Error fetching cart data');
        console.error('Error fetching cart data:', error);
      }
    }

    fetchProducts();
    fetchCartData(); // Fetch cart data when the component mounts
  }, []);

  const handleAddToList = (productToAdd) => {
    const existingProductIndex = productsList.findIndex(product => product.ProductId === productToAdd.ProductId);
    console.log(existingProductIndex);
    // console.log(productsList);
    console.log(productToAdd)
    if (existingProductIndex !== -1) {
      const updatedProductsList = [...productsList];
      updatedProductsList[existingProductIndex].quantity += 1;
      setProductsList(updatedProductsList);
      // console.log(setProductsList);
    } else {
      setProductsList([...productsList, { ...productToAdd, quantity: 1 }]);
    }
    console.log(productsList);
  };
    
  

  const handleClickTrolley = async () => {
    setLoading(true);
    setError('');
  
    try {
      // Calculate total bill
      const totalBill = productsList.reduce((total, product) => total + (product.Price * product.quantity), 0);
  
      const response = await fetch('http://localhost:5000/api/addtocart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addedProducts: productsList, totalBill }),
      });
  
      if (response.ok) {
        console.log('Products added to cart successfully.');
        alert('Products added to cart successfully!');
      } else {
        setError('Error adding products to cart.');
      }
    } catch (error) {
      setError('Error adding products to cart.');
      console.error('Error adding products to cart:', error);
    }
  
    setLoading(false);
  };
  

  return (
    <div id="mainDiv">
      <h1 id='availProd'>Available Products</h1>
      <div className="productContainer1">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToList={handleAddToList} />
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <Link to="/viewcart">
            <img onClick={handleClickTrolley} src='trolley.png' className='bottom-right-image' alt='trolley' />
          </Link>
        </>
      )}
    </div>
  );
};

export default DisplayProducts;