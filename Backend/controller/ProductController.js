import Product from '../model/ProductSchema.js';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        console.log('Products:', products);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error getting products:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const addProduct = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const newProduct = new Product({
            productID: uuidv4(),
            productName: req.body.productName,
            productDesc: req.body.productDesc,
            productType: req.body.productType,
            productQty: req.body.productQty,
        });
        await newProduct.save();
        console.log('Product added successfully:', newProduct);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const productId = req.params.productId;
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
                productName: req.body.productName,
                productDesc: req.body.productDesc,
                productType: req.body.productType,
                productQty: req.body.productQty,
            },
            { new: true }
        );
        if (!updatedProduct) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log('Product updated successfully:', updatedProduct);
        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const removeProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await Product.findOneAndDelete({ _id: productId });
        if (!deletedProduct) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log('Product deleted successfully:', deletedProduct);
        res.status(200).json({ message: 'Product deleted successfully.', deletedProductId: productId });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const productId = req.params.id;
        const updatedProduct = await Product.findOneAndUpdate(
            { productID: productId },
            { $inc: { productQty: -req.body.quantity } },
            { new: true }
        );
        if (!updatedProduct) {
            console.log('Product not found.');
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log('Product quantity updated successfully:', updatedProduct);
        res.status(200).json({ message: 'Product quantity updated successfully.' });
    } catch (err) {
        console.error('Error updating product quantity:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};