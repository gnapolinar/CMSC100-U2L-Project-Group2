import Cart from '../model/CartSchema.js';
import Product from '../model/ProductSchema.js';
import mongoose from 'mongoose';
import { jwtDecode } from 'jwt-decode';

export const getCartItems = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const shoppingCart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'productName productDesc productType productPrice'
        });

        if (!shoppingCart) {
            return res.status(404).json({ message: 'Shopping cart not found for the provided user ID.' });
        }

        res.json(shoppingCart.items);
    } catch (err) {
        console.error('Error getting cart items:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};


  export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: 'User ID, product ID, and quantity are required.' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }

        const product = await Product.findOne({ productID: productId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const objectIdProductId = product._id;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const productIndex = cart.items.findIndex(item => item.product.toString() === objectIdProductId.toString());

        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity;
        } else {
            cart.items.push({ product: objectIdProductId, quantity });
        }

        await cart.save();
        res.status(200).json(cart.items);
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
    
        const productId = req.params.productId;
    
        const cart = await Cart.findOne({ user: userId });
    
        if (!cart) {
            return res.status(404).json({ message: 'Shopping cart not found.' });
        }
    
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
    
        if (cart.items.length === 0) {
            return res.status(200).json({ message: 'Item removed from cart successfully. Cart is now empty.' });
        }
    
        res.status(200).json({ message: 'Item removed from cart successfully.' });
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).json({ message: 'Server Error' });
    }
}


export const updateCartItemQuantity = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
    
        const productId = req.params.productId;
    
        const { quantity } = req.body;
    
        const cart = await Cart.findOne({ user: userId });
    
        if (!cart) {
          return res.status(404).json({ message: 'Shopping cart not found.' });
        }
    
        const itemToUpdate = cart.items.find(item => item.product.toString() === productId);
        if (itemToUpdate) {
          itemToUpdate.quantity = quantity;
          await cart.save();
        } else {
          return res.status(404).json({ message: 'Product not found in the cart.' });
        }
    
        res.status(200).json({ message: 'Item quantity updated successfully.' });
      } catch (err) {
        console.error('Error updating item quantity:', err);
        res.status(500).json({ message: 'Server Error' });
      }
    }