import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/products');
      setProducts(response.data);
      const initialQuantity = {};
      response.data.forEach(product => {
        initialQuantity[product.productID] = 1;
      });
      setQuantity(initialQuantity);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      const token = cookies.get('token');
      if (!token) {
        throw new Error('User not logged in');
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      if (!product._id) {
        throw new Error('Product ID is missing');
      }

      const response = await axios.post(
        'http://localhost:4000/api/cart',
        {
          userId: userId,
          productId: product._id,
          quantity: quantity[product.productID] || 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        console.log(`Added to cart: ${product.productName} - Quantity: ${quantity[product.productID]}`);
      } else {
        throw new Error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div>
      <h1>Shop</h1>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.productID}>
              <div>
                <span>{product.productName} - {product.productDesc}</span>
                <input
                  type="number"
                  value={quantity[product.productID]}
                  onChange={(e) => setQuantity({...quantity, [product.productID]: parseInt(e.target.value)})}
                  min="1"
                  style={{ width: '40px' }}
                />
                <button onClick={() => addToCart(product)}>Add to Cart</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Shop;