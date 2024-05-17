import Order from '../model/OrderSchema.js';
import Cart from '../model/CartSchema.js';
import User from '../model/UserSchema.js';
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';

export const placeOrder = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        
        const user = await User.findById(userId);
        const email = user.email

        const shoppingCart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!shoppingCart || shoppingCart.items.length === 0) {
            return res.status(400).json({ message: 'Shopping cart is empty.' });
        }

        let totalOrderPrice = 0;
        const orders = shoppingCart.items.map(item => {
            if (item.product && item.product.productPrice) {
                totalOrderPrice += item.product.productPrice * item.quantity;
                return {
                    transactionID: uuidv4(),
                    productID: item.product._id,
                    productName: item.product.productName,
                    orderQty: item.quantity,
                    orderStatus: 0,
                    orderPrice: item.product.productPrice * item.quantity,
                    email: email,
                    dateOrdered: new Date()
                };
            } else {
                console.error("Product price is undefined for item:", item);
                return null;
            }
        });

        await Order.insertMany(orders);

        const orderedProductIds = orders.map(order => order.productID);
        await Cart.updateOne(
            { user: userId },
            { $pull: { items: { product: { $in: orderedProductIds } } } }
        );

        return res.status(201).json({ message: 'Orders placed successfully.' });
    } catch (err) {
        console.error('Error placing orders:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

export const removeOrder = async (req, res) => {
    try {
        const transactionID = req.params.transactionID;
        await Order.findOneAndDelete({ transactionID });
        res.json({ message: 'Order removed successfully.' });
    } catch (err) {
        console.error('Error removing order:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error getting orders:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
