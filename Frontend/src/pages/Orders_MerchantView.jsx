import React, { useState, useEffect } from 'react';
import './Order.css'; // Import the CSS file for customer view styles

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);

  // Function to fetch orders
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

  // Function to update order status
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

  // Functions to handle order actions
  const confirmOrder = (order) => {
    updateOrderStatus(order.transactionID, 1);
  };

  const deliverOrder = (order) => {
    updateOrderStatus(order.transactionID, 2);
  };

  const cancelOrder = (order) => {
    updateOrderStatus(order.transactionID, 3);
  };

  // Function to render collapsible orders
  const renderCollapsibleOrders = (status) => {
    return (
      <details>
        <summary className='order-summary'>{status === 0 ? 'Pending Orders' : status === 1 ? 'Confirmed Orders' : status === 2 ? 'Delivered Orders' : 'Cancelled Orders'}</summary>
        <div className='order-group'> {/* Wrap orders in a div with a class name */}
          {orders.map((orderItem) => (
            orderItem.orderStatus === status && (
              <div key={orderItem._id} className='order-item'> {/* Use the same class name used in the customer view */}
                <details>
                  <summary> {/* Use the same class name used in the customer view */}
                    Order ID: {orderItem.transactionID} - Date Ordered: {new Date(orderItem.dateOrdered).toLocaleString()}
                  </summary>
                  <ul className='order-details'> {/* Use the same class name used in the customer view */}
                    <li>Product ID: {orderItem.productID}</li>
                    <li>Order Quantity: {orderItem.orderQty}</li>
                    <li>Order Status: {orderItem.orderStatus}</li>
                    <li>Ordered by: {orderItem.email}</li>
                    {/* Additional order details */}
                  </ul>
                  {status === 0 && ( /* Render action buttons for pending orders */
                    <div className='order-actions'> {/* Use the same class name used in the customer view */}
                      <button onClick={() => confirmOrder(orderItem)}>Confirm</button>
                      <button onClick={() => cancelOrder(orderItem)}>Cancel</button>
                    </div>
                  )}
                  {status === 1 && ( /* Render action button for confirmed orders */
                    <div className='order-actions'> {/* Use the same class name used in the customer view */}
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
    <div className='orders-container'> {/* Use the same class name used in the customer view */}
      <h1 className='orders-title'>Transactions</h1> {/* Use the same class name used in the customer view */}

      {/* Render collapsible sections for each order status */}
      {renderCollapsibleOrders(0)} {/* Pending Orders */}
      {renderCollapsibleOrders(1)} {/* Confirmed Orders */}
      {renderCollapsibleOrders(2)} {/* Delivered Orders */}
      {renderCollapsibleOrders(3)} {/* Cancelled Orders */}
    </div>
  );
}
