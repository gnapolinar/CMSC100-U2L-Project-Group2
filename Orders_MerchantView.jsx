import React, { useState } from "react";

// dummy data
const products = [
  { 
    id: 1, 
    name: 'Rice', 
    desc: 'none',
    type: 1,
    qty: 100,
  },
  {
      id: 2, 
      name: 'Chicken', 
      desc: 'none',
      type: 3,
      qty: 100,
  },
  { 
      id: 3, 
      name: 'Melon', 
      desc: 'none',
      type: 2,
      qty: 100,
  }
];

const orders =[
  {
      transactionID: "abcde",
      productID: 1,
      orderQty: 2,
      orderStatus: 0,
      email: "smdineros@up.edu.ph",
      dateOrdered: new Date()
  },
  {
      transactionID: "fghij",
      productID: 2,
      orderQty: 5,
      orderStatus: 0,
      email: "smdineros@up.edu.ph",
      dateOrdered: new Date()
  },
  {
      transactionID: "klmno",
      productID: 3,
      orderQty: 4,
      orderStatus: 0,
      email: "smdineros@up.edu.ph",
      dateOrdered: new Date()
  }
];

export default function OrdersM() {

  const [order, setOrder] = useState(orders);

  const confirmOrder = (ord) => {
    const removeFromPending = order.filter(ordr => ordr.transactionID != ord.transactionID); 
    const toConfirm = {transactionID: ord.transactionID,
      productID: ord.productID,
      orderQty: ord.orderQty,
      orderStatus: 1,
      email: ord.email
    }; 
    setOrder([...removeFromPending, toConfirm]);
  }

  const deliverOrder = (ord) => {
    const removeFromConfirmed = order.filter(ordr => ordr.transactionID != ord.transactionID); 
    const toDeliver = {transactionID: ord.transactionID,
      productID: ord.productID,
      orderQty: ord.orderQty,
      orderStatus: 2,
      email: ord.email
    }; 
    setOrder([...removeFromConfirmed, toDeliver]);
  }

return (
  <div>
    <p>hello</p>
    <h1>Transcations</h1>

    <h3>Pending Orders</h3>
    <div>
    {order.map((orderItem) => {     
      if (orderItem.orderStatus === 0){
        return <>
          <ul>
            <li>Order ID: {orderItem.transactionID}</li>
            <li>Product ID: {orderItem.productID}</li>
            <li>Order Quantity: {orderItem.orderQty}</li>
            <li>Order Status: {orderItem.orderStatus}</li>
            <li>Ordered by: {orderItem.email}</li>
          </ul>
          <button onClick={() => confirmOrder(orderItem)}>Confirm</button>
        </>
      } 
    })}
    </div>

    <h3>Confirmed Orders</h3>
    <div>
    {order.map((orderItem) => {     
      if (orderItem.orderStatus === 1){
        return <>
          <ul>
            <li>Order ID: {orderItem.transactionID}</li>
            <li>Product ID: {orderItem.productID}</li>
            <li>Order Quantity: {orderItem.orderQty}</li>
            <li>Order Status: {orderItem.orderStatus}</li>
            <li>Ordered by: {orderItem.email}</li>
          </ul>
          <button onClick={() => deliverOrder(orderItem)}>Deliver</button>
        </>
      }
    })}
    </div>

    <h3>Delivered Orders</h3>
    <div>
    {order.map((orderItem) => {     
      if (orderItem.orderStatus === 2){
        return <>
          <ul>
            <li>Order ID: {orderItem.transactionID}</li>
            <li>Product ID: {orderItem.productID}</li>
            <li>Order Quantity: {orderItem.orderQty}</li>
            <li>Order Status: {orderItem.orderStatus}</li>
            <li>Ordered by: {orderItem.email}</li>
          </ul>
        </>
      }
    })}
    </div>

    <h3>Cancelled Orders</h3>
    <div>
    {order.map((orderItem) => {     
      if (orderItem.orderStatus === 3){
        return <>
          <h3>Cancelled Order</h3>
          <ul>
            <li>Order ID: {orderItem.transactionID}</li>
            <li>Product ID: {orderItem.productID}</li>
            <li>Order Quantity: {orderItem.orderQty}</li>
            <li>Order Status: {orderItem.orderStatus}</li>
            <li>Ordered by: {orderItem.email}</li>
          </ul>
        </>
      }
    })}
    </div>

  </div>

)
}

