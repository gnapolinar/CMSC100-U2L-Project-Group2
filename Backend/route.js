import { placeOrder, removeOrder, getOrders } from './controller/OrderController.js';
import { getProducts, addProduct, updateProduct, removeProduct } from './controller/ProductController.js';
import { registerUser, loginUser, getUsers, getUserData, updateUser, updateUserPassword, getUserById } from './controller/UserController.js';
import { getCartItems, addToCart, removeFromCart, updateCartItemQuantity } from './controller/CartController.js';

const routes = (app) => {
  app.route('/api/products').get(getProducts);
  app.route('/api/products').post(addProduct);
  app.route('/api/products/:productId').delete(removeProduct);
  app.route('/api/products/:productId').put(updateProduct);

  app.route('/api/register').post(registerUser);
  app.route('/api/login').post(loginUser);
  app.route('/api/users').get(getUsers);

  app.route('/api/cart').get(getCartItems);
  app.route('/api/cart').post(addToCart);
  app.route('/api/cart/:productId').delete(removeFromCart);
  app.route('/api/cart/:productId').put(updateCartItemQuantity);

  app.route('/api/orders').post(placeOrder);
  app.route('/api/orders/:transactionID').delete(removeOrder);
  app.route('/api/orders').get(getOrders);

  app.route('/api/userdata').get(getUserData);
  app.route('/api/users/:userId').put(updateUser);
  app.route('/api/users/:userId/password').put(updateUserPassword);
  app.route('/api/users/:userId').get(getUserById);
};

export default routes;
