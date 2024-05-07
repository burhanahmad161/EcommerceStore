import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'; // Import Route
import UserSignInPage from './jsFiles/userSignIn';
import UserHome from './jsFiles/userHome';
import UserSignUpPage from './jsFiles/userSignUp';
const App = () => {
  return (
      <UserSignInPage />
  );
};

export default App;
