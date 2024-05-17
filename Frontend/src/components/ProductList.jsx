import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ProductListing = ({ onAddProduct, onDeleteProduct }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '',
    productPrice: '',
    productDesc: '',
    productQty: '',
    editIndex: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState('productName');
  const [sortOrder, setSortOrder] = useState('asc');

  const [showAddProduct, setShowAddProduct] = useState(false);

  const compareFunction = useCallback((a, b) => {
    if (a[sortOption] < b[sortOption]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (a[sortOption] > b[sortOption]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  }, [sortOption, sortOrder]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products');
        const sortedProducts = response.data.sort(compareFunction);
        setProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        setError('Error fetching products');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, [compareFunction]);

  const handleSortOptionChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const toggleAddProduct = () => {
    setShowAddProduct((prevState) => !prevState);
  };

  const handleAddProduct = async () => {
    if (!formData.productName || !formData.productType || !formData.productPrice || !formData.productDesc || !formData.productQty) {
      alert('Please fill all fields');
      return;
    }

    const newProduct = {
      productName: formData.productName,
      productType: formData.productType,
      productPrice: formData.productPrice,
      productDesc: formData.productDesc,
      productQty: formData.productQty,
    };

    try {
      const response = await axios.post('http://localhost:4000/api/products', newProduct);
      setProducts([...products, response.data]);
      onAddProduct(response.data);
      setFormData({
        productName: '',
        productType: '',
        productPrice: '',
        productDesc: '',
        productQty: '',
        editIndex: null,
      });
    } catch (err) {
      setError('Error adding product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId, index) => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${productId}`);
      const updatedProducts = [...products];
      updatedProducts.splice(index, 1);
      setProducts(updatedProducts);
      onDeleteProduct(index);
    } catch (err) {
      setError('Error deleting product');
      console.error(err);
    }
  };

  const handleEditProduct = (index) => {
    const productToEdit = products[index];
    setFormData({
      ...productToEdit,
      editIndex: index,
    });
  };
  
  const handleUpdateProduct = async (index) => {
    const updatedProduct = {
        _id: products[index]._id,
        productName: formData.productName,
        productType: formData.productType,
        productPrice: formData.productPrice,
        productDesc: formData.productDesc,
        productQty: formData.productQty,
    };

    try {
        await axios.put(`http://localhost:4000/api/products/${updatedProduct._id}`, updatedProduct);
        const updatedProducts = [...products];
        updatedProducts[index] = updatedProduct;
        setProducts(updatedProducts.sort(compareFunction));
        setFormData({
            productName: '',
            productType: '',
            productPrice: '', // Clear the price field after updating
            productDesc: '',
            productQty: '',
            editIndex: null,
        });
    } catch (err) {
        setError('Error updating product');
        console.error(err);
    }
};

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Product Listing</h2>

      <div>
        <label>Sort by:</label>
        <select value={sortOption} onChange={handleSortOptionChange}>
          <option value="productName">Name</option>
          <option value="productType">Type</option>
          <option value="productPrice">Price</option>
          <option value="productQty">Quantity</option>
        </select>
        <select value={sortOrder} onChange={handleSortOrderChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product._id}>
              <td>
                {formData.editIndex === index ? (
                  <input
                    type="text"
                    value={formData.editIndex === index ? formData.productName : product.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    style={{ width: '50px' }} />
                ) : (
                  product.productName
                )}
              </td>
              <td>
                {formData.editIndex === index ? (
                  <input
                    type="text"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    style={{ width: '50px' }} />
                ) : (
                  product.productType
                )}
              </td>
              <td>
                {formData.editIndex === index ? (
                  <input
                    type="number"
                    value={formData.productPrice}
                    onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                    style={{ width: '50px' }} />
                ) : (
                  product.productPrice
                )}
              </td>
              <td>
                {formData.editIndex === index ? (
                  <input
                    type="text"
                    value={formData.productDesc}
                    onChange={(e) => setFormData({ ...formData, productDesc: e.target.value })}
                    style={{ width: '150px' }} />
                ) : (
                  product.productDesc
                )}
              </td>
              <td>
                {formData.editIndex === index ? (
                  <input
                    type="number"
                    value={formData.productQty}
                    onChange={(e) => setFormData({ ...formData, productQty: e.target.value })}
                    style={{ width: '50px' }} />
                ) : (
                  product.productQty
                )}
              </td>
              <td>
                {formData.editIndex === index ? (
                  <button onClick={() => handleUpdateProduct(index)}>Save</button>
                ) : (
                  <button onClick={() => handleEditProduct(index)}>Edit</button>
                )}
                <button onClick={() => handleDeleteProduct(product._id, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={toggleAddProduct}>{showAddProduct ? 'Cancel' : 'Add New Product'}</button>
{showAddProduct && (
  <div>
    <h3>Add New Product</h3>
    <input
      type="text"
      name="productName"
      placeholder="Product Name"
      value={formData.productName}
      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
    />
    <input
      type="text"
      name="productType"
      placeholder="Product Type"
      value={formData.productType}
      onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
    />
    <input
      type="number"
      name="productPrice"
      placeholder="Product Price"
      value={formData.productPrice}
      onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
    />
    <input
      type="text"
      name="productDesc"
      placeholder="Product Description"
      value={formData.productDesc}
      onChange={(e) => setFormData({ ...formData, productDesc: e.target.value })}
    />
    <input
      type="number"
      name="productQty"
      placeholder="Product Quantity"
      value={formData.productQty}
      onChange={(e) => setFormData({ ...formData, productQty: e.target.value })}
    />
    <button onClick={handleAddProduct}>Add Product</button>
  </div>
)}

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
    </div>
  );
};

ProductListing.propTypes = {
  onAddProduct: PropTypes.func.isRequired,
  onDeleteProduct: PropTypes.func.isRequired,
};

export default ProductListing;
