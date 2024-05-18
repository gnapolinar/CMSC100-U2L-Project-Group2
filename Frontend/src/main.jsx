import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root'
import Home from './pages/Home';
import Shop from './pages/Shop';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import MerchantOrders from './pages/Orders_MerchantView';
import SalesReports from './pages/SalesReport';
import Error from './pages/Error';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './index.css';

const cookies = new Cookies();
const isUserSignedIn = !!cookies.get('token');

const App = () => {
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
        const { userType } = response.data;
        setUserType(userType);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isUserSignedIn) {
      const token = cookies.get('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      if (userId) {
        fetchUserData(userId);
      }
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Root />,
      children: [
        { path: '/', element: <Home /> },
        { path: 'login', element: isUserSignedIn ? <Error /> : <LogIn /> },
        { path: 'signup', element: isUserSignedIn ? <Error /> : <SignUp /> },
        { path: 'account', element: isUserSignedIn ? <Account /> : <Error /> },
        { path: 'dashboard', element: isUserSignedIn && userType === 'merchant' ? <Dashboard /> : <Error /> },
        { path: 'cart', element: isUserSignedIn && userType === 'customer' ? <Cart /> : <Error /> },
        { path: 'orders', element: isUserSignedIn && userType === 'customer' ? <Orders /> : <Error /> },
        { path: 'shop', element: isUserSignedIn && userType === 'customer' ? <Shop /> : <Error /> },
        { path: 'merchantorders', element: isUserSignedIn && userType === 'merchant' ? <MerchantOrders /> : <Error /> },
        { path: 'salesreports', element: isUserSignedIn && userType === 'merchant' ? <SalesReports /> : <Error /> }
      ]
    }
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
