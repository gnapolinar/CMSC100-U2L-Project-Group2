/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Cookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './Orders.css';

const cookies = new Cookies();

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [email, setEmail] = useState('');
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const token = cookies.get('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  useEffect(() => {
    setIsActive(true);
  }, []);

  
  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (email) {
      axios.get(`http://localhost:4000/api/orders?email=${email}`)
        .then((response) => {
          setOrders(response.data);
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
        });
    }
  }, [email]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/products')
      .then((response) => {
        const productMap = {};
        response.data.forEach(product => {
          productMap[product._id] = product;
        });
        setProducts(productMap);
        setProductsLoaded(true);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  }, []);

  useEffect(() => {
    const grouped = {};
    orders.forEach(order => {
      const datetime = new Date(order.dateOrdered).toLocaleString('en-US');
      if (!grouped[datetime]) {
        grouped[datetime] = [];
      }
      grouped[datetime].push(order);
    });
    setGroupedOrders(grouped);
  }, [orders]);



  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
      const { email } = response.data;
      setEmail(email);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getTotalQuantity = (orders) => {
    return orders.reduce((total, order) => total + order.orderQty, 0);
  };

  const getTotalPrice = (orders) => {
    return orders.reduce((total, order) => total + order.orderPrice, 0);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Confirmed';
      case 2:
        return 'Delivered';
      case 3:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderOrders = () => {
    if (!productsLoaded) {
      return <div className="loading">Loading...</div>;
    }

    return Object.entries(groupedOrders).map(([datetime, orders]) => {
      const filteredOrders = orders.filter(order => order.email === email);

      if (filteredOrders.length === 0) {
        return null;
      }

      return (
        <details key={datetime} className="order-details">
          <summary className="order-summaryy">
            {datetime} - Total Quantity: {getTotalQuantity(filteredOrders)}
          </summary>
          <ul className="order-list">
            {filteredOrders.map(order => (
              <li key={order.transactionID} className="order-item">
                <span className="order-product">Product: {order.productName}</span>
                <span className="order-quantity">Quantity: {order.orderQty}</span>
                <span className="order-price">Price: ${order.orderPrice.toFixed(2)}</span>
                <span className="order-status">Status: {getStatusText(order.orderStatus)}</span>
              </li>
            ))}
          </ul>
        </details>
      );
    });
  };

  return (
    <div className={`fade-in-out ${isActive ? 'active' : ''}`}>
      <div className="orders-container">
        <h1 className="orders-title">ORDERS</h1>
        <div>
          {renderOrders()}
        </div>
      </div>
    </div>
  );
};

export default Orders;