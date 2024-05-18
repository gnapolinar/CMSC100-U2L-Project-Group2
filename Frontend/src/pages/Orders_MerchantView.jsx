import React, { useState, useEffect } from 'react';

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (transactionID, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${transactionID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionID === transactionID ? { ...order, orderStatus: newStatus } : order
        )
      );

      console.log("Order status updated successfully:", updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const confirmOrder = (order) => {
    updateOrderStatus(order.transactionID, 1);
  };

  const deliverOrder = (order) => {
    updateOrderStatus(order.transactionID, 2);
  };

  const cancelOrder = (order) => {
    updateOrderStatus(order.transactionID, 3);
  };

  return (
    <div>
      <h1>Transactions</h1>

      <h3>Pending Orders</h3>
      <div>
        {orders.map((orderItem) => {
          if (orderItem && orderItem.orderStatus === 0) {
            return (
              <div key={orderItem._id}>
                <ul>
                  <li>Order ID: {orderItem.transactionID}</li>
                  <li>Product ID: {orderItem.productID}</li>
                  <li>Order Quantity: {orderItem.orderQty}</li>
                  <li>Order Status: {orderItem.orderStatus}</li>
                  <li>Ordered by: {orderItem.email}</li>
                </ul>
                <button onClick={() => confirmOrder(orderItem)}>Confirm</button>
                <button onClick={() => cancelOrder(orderItem)}>Cancel</button>
              </div>
            );
          }
          return null;
        })}
      </div>

      <h3>Confirmed Orders</h3>
      <div>
        {orders.map((orderItem) => {
          if (orderItem && orderItem.orderStatus === 1) {
            return (
              <div key={orderItem._id}>
                <ul>
                  <li>Order ID: {orderItem.transactionID}</li>
                  <li>Product ID: {orderItem.productID}</li>
                  <li>Order Quantity: {orderItem.orderQty}</li>
                  <li>Order Status: {orderItem.orderStatus}</li>
                  <li>Ordered by: {orderItem.email}</li>
                </ul>
                <button onClick={() => deliverOrder(orderItem)}>Deliver</button>
              </div>
            );
          }
          return null;
        })}
      </div>

      <h3>Delivered Orders</h3>
      <div>
        {orders.map((orderItem) => {
          if (orderItem && orderItem.orderStatus === 2) {
            return (
              <div key={orderItem._id}>
                <ul>
                  <li>Order ID: {orderItem.transactionID}</li>
                  <li>Product ID: {orderItem.productID}</li>
                  <li>Order Quantity: {orderItem.orderQty}</li>
                  <li>Order Status: {orderItem.orderStatus}</li>
                  <li>Ordered by: {orderItem.email}</li>
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
      <h3>Cancelled Orders</h3>
      <div>
        {orders.map((orderItem) => {
          if (orderItem && orderItem.orderStatus === 3) {
            return (
              <div key={orderItem._id}>
                <ul>
                  <li>Order ID: {orderItem.transactionID}</li>
                  <li>Product ID: {orderItem.productID}</li>
                  <li>Order Quantity: {orderItem.orderQty}</li>
                  <li>Order Status: {orderItem.orderStatus}</li>
                  <li>Ordered by: {orderItem.email}</li>
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>

    </div>
  );
}
