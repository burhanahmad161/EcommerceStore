import React, { useState, useEffect } from 'react';
import '../cssFiles/DisplayAdminProducts.css';
import { IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

// Function to fetch categories from the API
export async function fetchCategories(setCategories, setError) {
  try {
    const response = await fetch('http://localhost:5000/api/viewcategories');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
      setError('');
    } else {
      setError('Error fetching categories');
    }
  } catch (error) {
    setError('Error fetching categories');
    console.error('Error fetching categories:', error);
  }
}

const DisplayCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories(setCategories, setError); // Call fetchCategories when the component mounts
  }, []);

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deletecategory/${categoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedCategories = categories.filter((category) => category.CategoryId !== categoryId);
        setCategories(updatedCategories);
        setError('');
      } else {
        setError('Error deleting category');
      }
    } catch (error) {
      setError('Error deleting category');
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div id="mainDivP">
      <h1 id='viewproduct'>Available Categories</h1>
      <table className="categoryTable">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Is Featured</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody className='tableRow'>
          {categories.map((category) => (
            <tr key={category.CategoryId} >
              <td className='categoryData'>{category.Name}</td>
              <td className='categoryData'>{category.IsFeatured ? 'Yes' : 'No'}</td>
              <td>
                <IconButton onClick={() => handleDeleteCategory(category.CategoryId)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DisplayCategories;
