import React, { useState, useEffect } from 'react';
import '../cssFiles/DisplayAdminProducts.css';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

// Function to fetch products from the API
export async function fetchProducts(setProducts, setError) {
  try {
    const response = await fetch('http://localhost:5000/api/viewproducts');
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

const EditProductForm = ({ open, onClose, product, fetchProducts }) => {
  const [formData, setFormData] = useState({
    ProductName: "",
    Price: "",
    ImageURL: "",
    BrandName: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/editproducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Data sent successfully");
        onClose();
        setFormData({
          ProductId: "",
          Name: "",
          Price: "",
          ImageUrl: "",
          BrandName: "",
        });
        setError("");
      } else {
        const responseData = await response.json();
        if (
          responseData.error &&
          responseData.error.includes("duplicate key")
        ) {
          setError("This Product already exists!");
        } else {
          setError("Error saving changes");
        }
      }
    } catch (error) {
      setError("Error sending data");
      console.error("Error sending data:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Product Name"
          name="ProductName"
          // value={formData.Name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price"
          name="Price"
          // value={formData.Price}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Image URL"
          name="ImageURL"
          // value={formData.ImageUrl}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Brand Name"
          name="BrandName"
          // value={formData.BrandName}
          onChange={handleChange}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
      {error && <div className="error-message">{error}</div>}
    </Dialog>
  );
};

const DisplayProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts(setProducts, setError); // Call fetchProducts when the component mounts
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteproduct/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedProducts = products.filter((product) => product.ProductId !== productId);
        setProducts(updatedProducts);
        setError('');
      } else {
        setError('Error deleting product');
      }
    } catch (error) {
      setError('Error deleting product');
      console.error('Error deleting product:', error);
    }
  };

  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedProduct(null);
    setEditDialogOpen(false);
  };
  return (
    <div id="mainDivP">
      <h1 id='viewproduct'>Available Products</h1>
      <table className="productTable">
        <tbody className='tableRow'>
          {products.map((product) => (
            <tr key={product.ProductId} >
              <td className='nameprice'>{product.Name}</td>
              <td className='nameprice2'>{product.Price}</td>
              <td className='nameprice3'>{product.BrandName}</td>
              <td>
                <img id='deleteImg' src='trash-bin.png' onClick={() => handleDeleteProduct(product.ProductId)} alt="Delete" />
              </td>
              <td>
                <img id='editImg' src='edit.png' onClick={() => handleOpenEditDialog(product)} alt="Edit" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error-message">{error}</div>}
      <EditProductForm
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        product={selectedProduct}
      />
    </div>
  );
};

export default DisplayProducts;
