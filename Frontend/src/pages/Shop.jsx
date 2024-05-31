import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import './Shop.css';

const cookies = new Cookies();

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/products');
      const productsData = response.data;
  
      const initialQuantity = {};
      productsData.forEach(product => {
        initialQuantity[product._id] = 1;
      });
  
      setProducts(productsData);
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

      const selectedQuantity = quantity[product._id] || 1;

      const response = await axios.post(
        'http://localhost:4000/api/cart',
        {
          userId: userId,
          productId: product._id,
          quantity: selectedQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        console.log(`Added to cart: ${product.productName} - Quantity: ${selectedQuantity}`);
      } else {
        throw new Error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className={`fade-in-out ${isActive ? "active" : ""}`}>
    <div className="shop-container">
    <h1 className="shop-title">SHOP</h1>
    {products.length > 0 ? (
      <ul className="product-list">
        {products.map((product) => (
          <li key={product._id}>
            <div className="product-card">
              <div className="product-image-container">
                <img src={product.imageUrl} alt={product.productName} className="product-image" />
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-desc">{product.productDesc}</p>
                <p className="product-price">
                  <span className="product-price-label">Price:</span>${product.productPrice.toFixed(2)}
                </p>
                <p className="product-qty">{product.productQty > 0 ? `Stock: ${product.productQty}` : 'Out of Stock'}</p>
                <div className="product-controls">
                <span className="quantity-label">Qty:</span>
                  <input
                    type="number"
                    value={quantity[product._id]}
                    onChange={(e) => setQuantity({ ...quantity, [product._id]: parseInt(e.target.value) })}
                    min="1"
                    max={product.productQty}
                    className="quantity-input"
                    disabled={product.productQty === 0}
                  />
                </div>
                <button onClick={() => addToCart(product)} className="add-to-cart" disabled={product.productQty === 0}>
                    Add to Cart
                  </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>Loading...</p>
    )}
  </div>
  </div>
);
};


export default Shop;
