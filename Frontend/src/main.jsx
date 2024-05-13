import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import Home from './pages/Home';
import Shop from './pages/Shop';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import MerchantOrders from './pages/Orders_MerchantView'
import './index.css';

const isUserSignedIn = !!localStorage.getItem('token');

const addToCart = (product) => {
  const cartItemsJSON = localStorage.getItem('cartItems');
  const cartItems = cartItemsJSON ? JSON.parse(cartItemsJSON) : [];
  cartItems.push(product);

  const updatedCartItemsJSON = JSON.stringify(cartItems);
  localStorage.setItem('cartItems', updatedCartItemsJSON);

  console.log(`Added to cart: ${product.productName} - Quantity: ${product.quantity}`); // debug
  return cartItems;
};

const getCartItems = () => {
  const cartItemsJSON = localStorage.getItem('cartItems');

  if (cartItemsJSON) {
    try {
      const cartItems = JSON.parse(cartItemsJSON);
      return cartItems;
    } catch (error) {
      console.error('Error parsing cart items JSON:', error);
      return [];
    }
  } else {
    return [];
  }
};

const userType = localStorage.getItem('userType');

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/', element: <Home /> },
      { path: 'login', element: <LogIn /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'account', element: isUserSignedIn ? <Account /> : null },
      { path: 'dashboard', element: isUserSignedIn && userType === 'merchant' ? <Dashboard /> : null },
      { path: 'cart', element: isUserSignedIn && userType === 'customer' ? <Cart cartItems={getCartItems()} /> : null },
      { path: 'orders', element: isUserSignedIn && userType === 'customer' ? <Orders /> : null },
      { path: 'shop', element: isUserSignedIn && userType === 'customer' ? <Shop addToCart={addToCart} /> : null },
      { path: 'merchantorders', element: isUserSignedIn && userType === 'merchant' ? <MerchantOrders /> : null }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);