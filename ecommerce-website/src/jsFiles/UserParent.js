import React from 'react';
import '../index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Header from './header';
import UserHome from './userHome';
import ViewProducts from './ViewUserProducts';
import ViewCart from './ViewCart';
import AddReviews from './userReview';
import CheckOut from './CheckOut';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    children: [
      {
        index: true,
        path: "/",
        element: <UserHome />
      },
      {
        path: "/viewproducts",
        element: <ViewProducts />
      },
      {
        path: "/viewcart",
        element: <ViewCart />
      },
      {
        path: "/givereview",
        element: <AddReviews />
      },
      {
        path: "/checkout",
        element: <CheckOut />
      }
    ]
  }
])
export default function UserParent() {
  return (
    <RouterProvider router = {router} />
  );
}
