import React from "react";
import { NavLink } from "react-router-dom";
import '../cssFiles/header.css'; // Import your CSS file
import { Fade } from "react-reveal";
import { Outlet } from "react-router-dom";
import App from '../App';
export default function Header() {
  const [loggedIn, setLoggedIn] = React.useState(true); // Set the initial login status

  const handleLogout = () => {
    window.location.href = '/';
  };
  return (
    <header>
      <>
        <div className="topDiv">
          <div className="picDiv">
            <li id="l123">
              <Fade>
                <ul><NavLink exact to="/" className="nav-link" activeClassName="active">Home</NavLink></ul>
                <ul><NavLink exact to="/viewProducts" className="nav-link" activeClassName="active">Products</NavLink></ul>
                <ul className="nav-link" activeClassName="active" onClick={handleLogout}>LogOut</ul>
              </Fade>
            </li>
          </div>
            <img src="logo.png" />
        </div>
      </>
      <Outlet />
      {!loggedIn && <App />} {/* Render UserSignInPage if logged out */}
    </header>
  );
}