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

        const validOrders = orders.filter(order => order !== null);

        if (validOrders.length === 0) {
            return res.status(400).json({ message: 'No valid orders found.' });
        }

        await Order.insertMany(validOrders);

        const orderedProductIds = validOrders.map(order => order.productID);
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

export const updateOrder = async (req, res) => {
    const { transactionID } = req.params;
    const { orderStatus } = req.body;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
        { transactionID },
        { $set: { orderStatus } },
        { new: true }
        );

        if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Failed to update order' });
    }
}

// Sales report route
export const salesReport = async (req, res) => {
    try {
        const orders = await Order.find({ orderStatus: 2 }); // Delivered orders
        const weeklyReport = generateSalesReport(orders, 'week');
        const monthlyReport = generateSalesReport(orders, 'month');
        const annualReport = generateSalesReport(orders, 'year');
        res.json({ weeklyReport, monthlyReport, annualReport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateSalesReport = (orders, period) => {
    const report = orders.reduce((acc, order) => {
        const date = new Date(order.dateOrdered);
        let periodKey;

        if (period === 'week') {
            const weekNumber = getWeekOfMonth(date);
            periodKey = `w${weekNumber}-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (period === 'month') {
            periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (period === 'year') {
            periodKey = `${date.getFullYear()}`;
        }

        if (!acc[periodKey]) {
            acc[periodKey] = { totalSales: 0, products: {} };
        }

        acc[periodKey].totalSales += order.orderQty * order.orderPrice;
        if (!acc[periodKey].products[order.productID]) {
            acc[periodKey].products[order.productID] = {
                productName: order.productName,
                totalQtySold: 0,
                totalRevenue: 0
            };
        }

        acc[periodKey].products[order.productID].totalQtySold += order.orderQty;
        acc[periodKey].products[order.productID].totalRevenue += order.orderQty * order.orderPrice;

        return acc;
    }, {});

    return report;
};

const getWeekOfMonth = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const dayOfWeek = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const adjustedDate = dayOfMonth + (dayOfWeek === 0 ? 0 : (7 - dayOfWeek)); // Adjusted to the nearest Sunday
    return Math.ceil(adjustedDate / 7);
};
