import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [error, setError] = useState(null);

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

        await axios.put(`http://localhost:4000/api/cart/${productId}`, {
            quantity: newQuantity
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        fetchCartItems();
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
        setCartItems([]);
        setIsConfirmationOpen(false);
        alert('Order placed successfully!');
      } else {
        throw new Error('Failed to place order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Error placing order. Please try again later.');
    }
  };

  const total = cartItems.reduce((acc, item) => {
    return acc + (item.product ? item.quantity * item.product.productPrice : 0);
  }, 0);

  return (
    <div>
      <h2>Your Cart</h2>
      {error && <p>{error}</p>}
        <ul>
          {cartItems.map((item) => (
            <li key={item.product?._id}>
              {item.product ? (
                <>
                  {item.product.productName} - {item.quantity} x ${item.product.productPrice}
                  <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                    style={{ width: '50px' }}
                  />
                </>
              ) : (
                <span>Product information not available</span>
              )}
            </li>
          ))}
        </ul>

      {cartItems.length > 0 ? (
        <>
          <p>Total Price: ${total.toFixed(2)}</p>
          <button onClick={handleConfirmOrder}>Confirm Order</button>
          {isConfirmationOpen && (
            <div>
              <p>Are you sure you want to place the order?</p>
              <button onClick={proceedWithOrder}>Yes</button>
              <button onClick={() => setIsConfirmationOpen(false)}>No</button>
            </div>
          )}
        </>
      ) : (
        <p>The cart is empty. Add now!</p> 
      )}
    </div>
  );
};

export default Cart;