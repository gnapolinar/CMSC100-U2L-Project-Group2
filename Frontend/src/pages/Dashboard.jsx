import { useState } from 'react';
import ProductList from '../components/ProductList'

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  const handleAddProduct = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  return (
    <div>
        <ProductList
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
        />
    </div>
  );
};

export default Dashboard;