import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    transactionID: { type: String, required: true },
    productID: { type: String, required: true },
    productName: { type: String, required: true },
    orderQty: { type: Number, required: true },
    orderStatus: { type: Number, required: true },
    orderPrice: { type: Number, required: true },
    email: { type: String, required: true },
    dateOrdered: { type: Date, default: Date.now }
}, { collection: 'Orders' });

const Order = mongoose.model('Order', orderSchema);

export default Order;