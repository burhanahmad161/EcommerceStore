import React from 'react';
import '../index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AddProducts from './AddProducts';
import DisplayProducts from './DisplayAdminProducts';
import AddShippingMethod from './AddShippingMethod';
import DisplayShippingMethods from './ViewShippingMethod';
import DisplayUserReviews from './ViewReviews';
import AddCategory from './AddCategory';
import DisplayCategories from './ViewCategory';
import AnalysisPage from './Analysis';
const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminHeader />,
    children: [
      {
        index: true,
        path: "/viewproductsss",
        element: <DisplayProducts />
      },
      {
        path: "/addproducts",
        element: <AddProducts />
      },
      {
        path: "/addshipping",
        element: <AddShippingMethod />
      },
      {
        path: "/viewshipping",
        element: <DisplayShippingMethods />
      },
      {
        path: "/viewreview",
        element: <DisplayUserReviews />
      },
      {
        path: "/addcategory",
        element: <AddCategory />
      },
      {
        path: "/viewcategory",
        element: <DisplayCategories />
      },
      {
        path: "/viewanalysis",
        element: <AnalysisPage />
      }
      // {
      //   path: "/review",
      //   element: <UserReview />
      // },
      // {
      //   path: "/usersignup",
      //   element: <UserSignUpPage />
      // }
    ]
  }
])
export default function AdminParent() {
  return (
    <RouterProvider router = {router} />
  );
}
