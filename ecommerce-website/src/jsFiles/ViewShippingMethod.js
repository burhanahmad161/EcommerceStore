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

// Function to fetch shipping methods from the API
export async function fetchShippingMethods(setShippingMethods, setError) {
  try {
    const response = await fetch('http://localhost:5000/api/viewshippingmethods');
    if (response.ok) {
      const data = await response.json();
      setShippingMethods(data);
      setError('');
    } else {
      setError('Error fetching shipping methods');
    }
  } catch (error) {
    setError('Error fetching shipping methods');
    console.error('Error fetching shipping methods:', error);
  }
}

const EditShippingMethodForm = ({ open, onClose, shippingMethod, fetchShippingMethods }) => {
  const [formData, setFormData] = useState({
    Name: "",
    Price: "",
    EstimatedDeliveryDate: "",
    IsInternational: "",
    IsActive: "",
    MaxWeight: "",
    MinOrderAmount: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (shippingMethod) {
      setFormData({ ...shippingMethod });
    }
  }, [shippingMethod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/editshippingmethod", {
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
          Name: "",
          Price: "",
          EstimatedDeliveryDate: "",
          IsInternational: "",
          IsActive: "",
          MaxWeight: "",
          MinOrderAmount: "",
        });
        setError("");
        fetchShippingMethods(); // Refresh shipping methods after saving changes
      } else {
        const responseData = await response.json();
        if (
          responseData.error &&
          responseData.error.includes("duplicate key")
        ) {
          setError("This shipping method already exists!");
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
      <DialogTitle>Edit Shipping Method</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Name"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price"
          name="Price"
          value={formData.Price}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Estimated Delivery Date"
          name="EstimatedDeliveryDate"
          value={formData.EstimatedDeliveryDate}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Is International"
          name="IsInternational"
          value={formData.IsInternational}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Is Active"
          name="IsActive"
          value={formData.IsActive}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Max Weight"
          name="MaxWeight"
          value={formData.MaxWeight}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Min Order Amount"
          name="MinOrderAmount"
          value={formData.MinOrderAmount}
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

const DisplayShippingMethods = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  useEffect(() => {
    fetchShippingMethods(setShippingMethods, setError); // Call fetchShippingMethods when the component mounts
  }, []);

  const handleDeleteShippingMethod = async (shippingMethodId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteshippingmethod/${shippingMethodId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedShippingMethods = shippingMethods.filter((shippingMethod) => shippingMethod.ShippingMethodId !== shippingMethodId);
        setShippingMethods(updatedShippingMethods);
        setError('');
      } else {
        setError('Error deleting shipping method');
      }
    } catch (error) {
      setError('Error deleting shipping method');
      console.error('Error deleting shipping method:', error);
    }
  };

  const handleOpenEditDialog = (shippingMethod) => {
    setSelectedShippingMethod(shippingMethod);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedShippingMethod(null);
    setEditDialogOpen(false);
  };

  return (
    <div id="mainDivP">
      <h1 id='viewproduct'>Available Shipping Methods</h1>
      <table className="shippingMethodTable">
        <th>Name</th>
        <th>Price</th>
        <th>Estimated Delivery Date</th>
        <th>Is International</th>
        <th>Is Active</th>
        <th>Max Weight</th>
        <th>Minimum Order Amount</th>
        <th>Delete</th>
        <th>Edit</th>
        <tbody className='tableRow'>
          {shippingMethods.map((shippingMethod) => (
            <tr key={shippingMethod.ShippingMethodId} >
              <td className='shippingMethodData'>{shippingMethod.Name}</td>
              <td className='shippingMethodData'>{shippingMethod.Price}</td>
              <td className='shippingMethodData'>{shippingMethod.EstimatedDeliveryDate}</td>
              <td className='shippingMethodData'>{shippingMethod.IsInternational ? 'Yes' : 'No'}</td>
              <td className='shippingMethodData'>{shippingMethod.IsActive ? 'Yes' : 'No'}</td>
              <td className='shippingMethodData'>{shippingMethod.MaxWeight} kg</td>
              <td className='shippingMethodData'>{shippingMethod.MinOrderAmount}</td>
              <td>
                <img  width={30} src='trash-bin.png' onClick={() => handleDeleteShippingMethod(shippingMethod.ShippingMethodId)} alt="Delete" />
              </td>
              <td>
                <img width={25} src='edit.png' onClick={() => handleOpenEditDialog(shippingMethod)} alt="Edit" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error-message">{error}</div>}
      <EditShippingMethodForm
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        product={selectedShippingMethod}
      />
    </div>
  );
};

export default DisplayShippingMethods;
