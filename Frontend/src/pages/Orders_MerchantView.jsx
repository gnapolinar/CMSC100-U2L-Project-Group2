import { useState, useEffect } from 'react';
import './Orders_MerchantView.css';

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

  const renderCollapsibleOrders = (status) => {
    return (
      <details>
        <summary className='order-summary'>{status === 0 ? 'Pending Orders' : status === 1 ? 'Confirmed Orders' : status === 2 ? 'Delivered Orders' : 'Cancelled Orders'}</summary>
        <div className='order-group'>
          {orders.map((orderItem) => (
            orderItem.orderStatus === status && (
              <div key={orderItem._id} className='order-item'>
                <details>
                  <summary>
                    Order ID: {orderItem.transactionID} - Date Ordered: {new Date(orderItem.dateOrdered).toLocaleString()}
                  </summary>
                  <ul className='order-details'>
                    <li>Product ID: {orderItem.productID}</li>
                    <li>Order Quantity: {orderItem.orderQty}</li>
                    <li>Order Status: {orderItem.orderStatus}</li>
                    <li>Ordered by: {orderItem.email}</li>
                  </ul>
                  {status === 0 && (
                    <div className='order-actions'>
                      <button onClick={() => confirmOrder(orderItem)}>Confirm</button>
                      <button onClick={() => cancelOrder(orderItem)}>Cancel</button>
                    </div>
                  )}
                  {status === 1 && (
                    <div className='order-actions'>
                      <button onClick={() => deliverOrder(orderItem)}>Deliver</button>
                    </div>
                  )}
                </details>
              </div>
            )
          ))}
        </div>
      </details>
    );
  };

  return (
    <div className='orders-container'>
      <h1 className='orders-title'>Transactions</h1>

      {renderCollapsibleOrders(0)}
      {renderCollapsibleOrders(1)}
      {renderCollapsibleOrders(3)}
    </div>
  );
}