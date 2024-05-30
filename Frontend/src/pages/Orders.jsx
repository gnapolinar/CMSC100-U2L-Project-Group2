/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Cookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './Order.css'

const cookies = new Cookies();

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [email, setEmail] = useState('');
  const [productsLoaded, setProductsLoaded] = useState(false);
  const token = cookies.get('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
      const { email } = response.data;
      setEmail(email);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData(userId);

    if (email) {
      axios.get(`http://localhost:4000/api/orders?email=${email}`)
        .then((response) => {
          console.log(response.data);
          setOrders(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [userId, email]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/products')
      .then((response) => {
        const productMap = {};
        response.data.forEach(product => {
          productMap[product._id] = product.productName;
        });
        setProducts(productMap);
        setProductsLoaded(true);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const grouped = {};
    orders.forEach(order => {
      const datetime = new Date(order.dateOrdered);
      const key = datetime.toLocaleString('en-US');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(order);
    });
    setGroupedOrders(grouped);
  }, [orders]);

  const getTotalQuantity = (orders) => {
    return orders.reduce((total, order) => total + order.orderQty, 0);
  };

  const getTotalPrice = (orders) => {
    return orders.reduce((total, order) => total + order.orderPrice, 0);
  };

  const renderOrders = () => {
    if (!productsLoaded) {
      return <div>Loading...</div>;
    }

    return Object.entries(groupedOrders).map(([datetime, orders]) => {
      const filteredOrders = orders.filter(order => order.email === email);

      if (filteredOrders.length === 0) {
        return null;
      }

      return (
        <details key={datetime} className="order-details">
        <summary className="order-summary">{datetime} - Total Quantity: {getTotalQuantity(filteredOrders)}, Total Price: ${getTotalPrice(filteredOrders).toFixed(2)}</summary>
        <ul className="order-list">
          {filteredOrders.map(order => {
            return (
              <li key={order.transactionID} className="order-item">
                <span className="order-product">Product: {order.productName || 'Unknown'}</span>
                <span className="order-quantity">Quantity: {order.orderQty}</span>
                <span className="order-price">Price: ${order.orderPrice.toFixed(2)}</span>
              </li>
            );
          })}
        </ul>
      </details>
    );
  });
};


  return (
    <div className="orders-container">
    <h1 className="orders-title">Orders</h1>
    {renderOrders()}
  </div>
);
};

export default Orders;