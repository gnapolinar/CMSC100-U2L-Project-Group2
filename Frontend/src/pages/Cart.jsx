import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import './Cart.css';

const cookies = new Cookies();

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
        const token = cookies.get('token')
        if (!token) {
            setError('User not logged in');
            return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`http://localhost:4000/api/cart?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.filter(item => item.product));
        setError(null);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Error fetching cart items. Please try again later.');
    }
};

  const removeFromCart = async (productId) => {
    try {
      const token = cookies.get('token')
      if (!token) {
        setError('User not logged in');
        return;
      }
  
      await axios.delete(`http://localhost:4000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Error removing item from cart. Please try again later.');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
        const token = cookies.get('token')
        if (!token) {
            setError('User not logged in');
            return;
        }

        if (newQuantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        const updatedCartItems = cartItems.map(item =>
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCartItems);

        await axios.put(`http://localhost:4000/api/cart/${productId}`, {
            quantity: newQuantity
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

    } catch (error) {
        console.error('Error updating item quantity:', error);
        setError('Error updating item quantity. Please try again later.');
    }
};

  const handleConfirmOrder = () => {
    setIsConfirmationOpen(true);
  };

  const proceedWithOrder = async () => {
    try {
      const token = cookies.get('token')
      if (!token) {
        setError('User not logged in');
        return;
      }
  
      const response = await axios.post('http://localhost:4000/api/orders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.status === 201) {
        await subtractProductQuantities(cartItems);
        await fetchCartItems();
        setCartItems([]);
        setIsConfirmationOpen(false);
        setError(null);
      } else {
        throw new Error('Failed to place order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Error placing order. Please try again later.');
    }
  };

  const subtractProductQuantities = async (cartItems) => {
    try {
      for (const item of cartItems) {
        const productId = item.product._id;
        const newQuantity = item.product.productQty - item.quantity;
        const updatedQuantity = Math.max(newQuantity, 0);

        await axios.put(`http://localhost:4000/api/products/${productId}`, {
          quantity: updatedQuantity,
        });
      }
    } catch (error) {
      console.error('Error subtracting product quantities:', error);
    }
  };

  const handleIncreaseQuantity = (productId) => {
    const updatedCartItems = cartItems.map(item =>
      item.product._id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCartItems);
    updateQuantity(productId, updatedCartItems.find(item => item.product._id === productId).quantity);
  };

  const handleDecreaseQuantity = (productId) => {
    const updatedCartItems = cartItems.map(item =>
      item.product._id === productId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    );
    setCartItems(updatedCartItems);
    updateQuantity(productId, updatedCartItems.find(item => item.product._id === productId).quantity);
  };

  const totalItems = cartItems.reduce((acc, item) => {
    return acc + (item.quantity || 0);
  }, 0);

  const total = cartItems.reduce((acc, item) => {
    return acc + (item.product ? item.quantity * item.product.productPrice : 0);
  }, 0);

  return (
    <div className={`fade-in-out ${isActive ? "active" : ""}`}>
    <div className="cart-container">
      <h2 className="cart-title">My Cart</h2>
      {error && <p className="error">{error}</p>}
      <div className="cart-item-labels">
        <span className="label-product">Product</span>
        <span className="label-quantity">Quantity</span>
        <span className="label-price">Price</span>
      </div>
      <ul className="cart-items">
        {cartItems.map((item) => (
          <li key={item.product?._id} className="cart-item">
            {item.product ? (
              <>
                <span className="product-namee">{item.product.productName}</span>
                <span className="product-quantityy">
                  <button onClick={() => handleDecreaseQuantity(item.product._id)}>-</button>
                  <input
                    type="value"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                  />
                  <button onClick={() => handleIncreaseQuantity(item.product._id)}>+</button>
                </span>
                <span className="product-pricee">
                  ${(item.product.productPrice * item.quantity).toFixed(2)}
                </span>
                <button className="remove-btn" onClick={() => removeFromCart(item.product._id)}>Remove</button>
              </>
            ) : (
              <span>Product information not available</span>
            )}
          </li>
        ))}
      </ul>

      {cartItems.length > 0 ? (
        <div className="cart-summary">
          <div className="total">
            <p>Total Items: <span>{totalItems}</span></p>
            <p>Total Price: <span>${total.toFixed(2)}</span></p>
          </div>
          <div className="button">
            <button className="confirm-btn" onClick={handleConfirmOrder}>Confirm Order</button>
          </div>
        </div>
      ) : (
        <p className="empty-cart">The cart is empty. Add now!</p>
      )}

      {isConfirmationOpen && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-content">
              <p>Are you sure you want to place the order?</p>
              <div className="modal-buttons">
                <button className="proceed-btn" onClick={proceedWithOrder}>Yes</button>
                <button className="cancel-btn" onClick={() => setIsConfirmationOpen(false)}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};


export default Cart;