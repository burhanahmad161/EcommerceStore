import React from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM directly
import './../index.css';
import UserSignInPage from './userSignIn';
import UserSignUpPage from './userSignUp';

const boole = {
  signup: false,
  signin: true,
};

let root = ReactDOM.createRoot(document.getElementById('root')); // Create the root once

const setSignUp = () => {
  boole.signin = true;
  boole.signup = false;
  console.log("this was called")
  update(); // Call the update function to re-render
};

const setSignIn = () => {
  boole.signup = true;
  boole.signin = false;
  update(); // Call the update function to re-render
};

const render = () => {
  root.render(
    <>
      {boole.signin && <UserSignInPage />}
      {boole.signup && <UserSignUpPage />}
    </>
  );
};

const update = () => {
  render(); 
};

export default boole;
export { setSignIn, setSignUp, render, update };
