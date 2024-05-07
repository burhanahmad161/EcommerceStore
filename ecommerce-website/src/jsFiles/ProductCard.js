import React from 'react';
import '../cssFiles/ProductCard.css'; // Import the CSS file

const ProductCard = ({ product, onAddToList }) => {
  const handleAddToCart = () => {
    console.log(product.Name);
    onAddToList(product); // Call the parent component's function with the product as an argument
  };
  
  return (
    <div>
      <div className="productCard">
        <img id='imgProperties' src={product.ImageUrl} alt={product.ImageUrl} />
        <h3 className='nameProp'>{product.Name}</h3>
        <hr id='hrp'></hr>
        <p className='priceProp'>Rs. {product.Price}.00</p>
        <button onClick={handleAddToCart} className='buttonProp'>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
