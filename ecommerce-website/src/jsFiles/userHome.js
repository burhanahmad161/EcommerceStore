import React from "react";
import '../cssFiles/UserHome.css'; // Import your CSS file
import { Link } from "react-router-dom";
export default function UserHome() {
  return (
    <div className="user-home">
      <div className="content">
        <section className="hero">
          <h1>Welcome to ShopVogue Store</h1>
          <p>Discover amazing products and enjoy a seamless shopping experience.</p>
          <Link to="/viewproducts">
          <button className="button">Shop Now</button>
          </Link>
        </section>
      </div>
      <div className="footer">
        <p>&copy; {new Date().getFullYear()} ShopVogue Store. All rights reserved.</p>
      </div>
    </div>
  );
}
