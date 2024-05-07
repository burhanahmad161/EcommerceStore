import React from 'react';
import '../cssFiles/ProductCard.css'; // Import the CSS file

const ProductCardAdmin = ({ product, onAddToList }) => {
  return (
    <div>
      <div className="productCard">
        <img src={product.ImageUrl} alt={product.ImageUrl} />
      <h3 className='nameProp'>{product.Name}</h3>
      <hr></hr>
      <p className='priceProp'>Rs. {product.Price}.00</p>
    </div>
    </div>
  );
};

export default ProductCardAdmin;
