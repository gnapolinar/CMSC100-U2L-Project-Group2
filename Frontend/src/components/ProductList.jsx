/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './ProductList.css';

const ProductListing = ({ onAddProduct, onDeleteProduct }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '',
    productPrice: '',
    productDesc: '',
    productQty: '',
    imageUrl: '',
    editIndex: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState('productName');
  const [sortOrder, setSortOrder] = useState('asc');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [overlay, setOverlay] = useState(false);

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
    document.getElementById("productForm").style.display = showAddProduct ? "block" : "none";
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
      imageUrl: formData.imageUrl,
    };

    setOverlay(true);

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
        imageUrl: '',
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
        imageUrl: formData.imageUrl,
    };

    try {
        await axios.put(`http://localhost:4000/api/products/${updatedProduct._id}`, updatedProduct);
        const updatedProducts = [...products];
        updatedProducts[index] = updatedProduct;
        setProducts(updatedProducts.sort(compareFunction));
        setFormData({
            productName: '',
            productType: '',
            productPrice: '',
            productDesc: '',
            productQty: '',
            imageUrl: '',
            editIndex: null,
        });
    } catch (err) {
        setError('Error updating product');
        console.error(err);
    }
};

const getProductTypeLabel = (type) => {
  switch (type) {
    case 1:
      return 'Staple';
    case 2:
      return 'Fruits and Vegetables';
    case 3:
      return 'Livestock';
    case 4:
      return 'Seafood';
    case 5:
      return 'Others';
    default:
      return '';
  }
};

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='main'>
      <h1 className="dashboard-title">Product Listing</h1>

      <div className="breadcrumb">
        <label>Sort by: </label>
          <div className="select-wrapper">
              <select value={sortOption} onChange={handleSortOptionChange}>
                  <option value="productName">Name</option>
                  <option value="productType">Type</option>
                  <option value="productPrice">Price</option>
                  <option value="productQty">Quantity</option>
              </select>
          </div>

          <div className="select-wrapper">
              <select value={sortOrder} onChange={handleSortOrderChange}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
              </select>
          </div>
      </div>

      <table className="product-listing">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Image</th>
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
                      style={{ width: '50px' }}
                    />
                  ) : (
                    getProductTypeLabel(product.productType)
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
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    style={{ width: '150px' }} />
                ) : (
                  <img src={product.imageUrl} alt={product.productName} className="product-imagee" />
                )}
              </td>
              <td className="action-buttons">
                {formData.editIndex === index ? (
                  <button className="save-button" onClick={() => handleUpdateProduct(index)}>Save</button>
                ) : (
                  <button className="edit-button" onClick={() => handleEditProduct(index)}>Edit</button>
                )}
                <button onClick={() => handleDeleteProduct(product._id, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={toggleAddProduct}>
  {showAddProduct ? 'Adding...' : 'Add New Product'}
</button>

{showAddProduct && (
  <div className="overlay">
    <form className="modal">
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
      <input
        type="text"
        name="imageUrl"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
      />
      <button className="add-product-button breadcrumb" type="button" onClick={handleAddProduct}>
        Add Product
      </button>
      <button className="add-product-button breadcrumb" type="button" onClick={() => setOverlay(false)}>
        Cancel
      </button>
    </form>
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
