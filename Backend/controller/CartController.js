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
            select: 'productName productDesc productType productPrice productQty'
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

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'productName productDesc productType productPrice'
        });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingCartItemIndex = cart.items.findIndex(item => item.product && item.product._id.toString() === productId);

        if (existingCartItemIndex !== -1) {
            cart.items[existingCartItemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: product, quantity });
        }

        await cart.save();

        res.status(200).json(cart.items);
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

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
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
          }

          if (quantity > product.productQty) {
            return res.status(400).json({ message: 'Requested quantity exceeds available quantity.' });
          }

          itemToUpdate.quantity = quantity;
          await cart.save();
    
          res.status(200).json({ message: 'Item quantity updated successfully.' });
        } else {
          return res.status(404).json({ message: 'Product not found in the cart.' });
        }
      } catch (err) {
        console.error('Error updating item quantity:', err);
        res.status(500).json({ message: 'Server Error' });
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