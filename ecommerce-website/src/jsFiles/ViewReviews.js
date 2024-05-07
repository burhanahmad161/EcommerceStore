import React, { useState, useEffect } from 'react';
import '../cssFiles/DisplayAdminProducts.css';

// Function to fetch user reviews from the API
export async function fetchUserReviews(setProducts, setError) {
    try {
        const response = await fetch('http://localhost:5000/api/viewreviews');
        if (response.ok) {
            const data = await response.json();
            setProducts(data);
            setError('');
        } else {
            setError('Error fetching products');
        }
    } catch (error) {
        setError('Error fetching products');
        console.error('Error fetching products:', error);
    }
}

const DisplayUserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserReviews(setReviews, setError); // Call fetchUserReviews when the component mounts
    }, []);

    return (
        <div id="mainDivP">
            <h1 id='viewproduct'>User Reviews</h1>
            <table className="shippingMethodTable">
                <th>First Name</th>
                <th>Last Name</th>
                <th>Rating Stars</th>
                <th>Comment</th>
                <tbody className='tableRow'>
                    {reviews.map((product) => (
                        <tr key={product.ProductId} >
                            <td className='shippingMethodData'>{product.FirstName}</td>
                            <td className='shippingMethodData'>{product.LastName}</td>
                            <td className='shippingMethodData'>{product.Rating}</td>
                            <td className='shippingMethodData'>{product.Comment}</td>
                            {/* <td className='nameprice3'>{product.BrandName}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default DisplayUserReviews;
