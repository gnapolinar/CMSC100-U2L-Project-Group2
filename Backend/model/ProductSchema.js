import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDesc: { type: String, required: true },
    productType: { type: Number, required: true },
    productPrice: { type: Number, required: true },
    productQty: { type: Number, required: true },
    imageUrl: { type: String, required: true },
}, { collection: 'Products' });

const Product = mongoose.model('Product', productSchema);

export default Product;
