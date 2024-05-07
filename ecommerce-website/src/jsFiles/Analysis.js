import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for API calls
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Import Recharts for charting
import '../cssFiles/Analysis.css';
export default function AnalysisPage() {
    const [topSellingProduct, setTopSellingProduct] = useState(null);
    const [genderDistribution, setGenderDistribution] = useState({});
    const [selectedUser, setSelectedUser] = useState('');
    const [userOrders, setUserOrders] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchTopSellingProduct();
        fetchGenderDistribution();
        fetchUsers();
    }, []);
    const fetchTopSellingProduct = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/topsellingproduct');
            setTopSellingProduct(response.data);
        } catch (error) {
            console.error('Error fetching top-selling product:', error);
        }
    };

    const fetchGenderDistribution = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/genderdistribution');
            setGenderDistribution(response.data);
        } catch (error) {
            console.error('Error fetching gender distribution:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);
            console.log(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserSelect = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/userorders?userName=${selectedUser}`);
            setUserOrders(response.data);
        } catch (error) {
            console.error('Error fetching user orders:', error);
        }
    };

    return (
        <div>
            <h1 id='analysisHeader'>Analysis Page</h1>
            <div>
                <h2 id='topSelling'>Top Selling Product</h2>
                {topSellingProduct ? (
                    <table>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th>Total Units Sold</th>
                        <tbody>
                            <tr>
                                <td>{topSellingProduct.Name}</td>
                                <td>{topSellingProduct.BrandName}</td>
                                <td>{topSellingProduct.Price}</td>
                                <td>{topSellingProduct.SoldStock}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p>Loading top-selling product...</p>
                )}
            </div>
                <hr className='hrsub'></hr>
            <div>
                <h2 id='genderDist'>Gender Distribution</h2>
                {genderDistribution.male && genderDistribution.female ? (
                    <div id='graphDiv'>
                        <BarChart width={500} height={300} data={[genderDistribution]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="gender" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="male" fill="#8884d8" />
                            <Bar dataKey="female" fill="#82ca9d" />
                        </BarChart>
                    </div>
                ) : (
                    <p>Loading gender distribution...</p>
                )}
            </div>
            <hr className='hrsub'></hr>
            <div id='orderDiv'>
                <h2 id='userorder'>User Orders</h2>
                <h3>Select User to View Orders</h3>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map(user => (
                        <option key={user.UserId} value={user.UserName}>{user.UserName}</option>
                    ))}
                </select>
                <button onClick={handleUserSelect}>View Orders</button>
            </div>

            <div>
                <h2>User Orders</h2>
                {userOrders.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Total Amount</th>
                                <th>Order Status</th>
                                <th>Order Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userOrders.map((order) => (
                                <tr key={order.OrderId}>
                                    <td>{order.TotalAmount}</td>
                                    <td>{order.OrderStatus === 1 ? 'Active' : 'InActive'}</td>
                                    <td>{order.OrderDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No orders found for the selected user.</p>
                )}
            </div>
        </div>
    );
}
