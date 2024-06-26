import Product from '../model/ProductSchema.js';

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
            productName: req.body.productName,
            productDesc: req.body.productDesc,
            productType: req.body.productType,
            productQty: req.body.productQty,
            productPrice: req.body.productPrice,
            imageUrl: req.body.imageUrl
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
                productPrice: req.body.productPrice,
                imageUrl: req.body.imageUrl
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

export const updateProductQuantity = async (productId, newQuantity) => {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        console.error('Product not found');
        return false;
      }
  
      product.productQty = newQuantity;
      await product.save();
      
      return true;
    } catch (error) {
      console.error('Error updating product quantity:', error);
      return false;
    }
};
