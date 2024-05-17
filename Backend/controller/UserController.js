// UserController.js
import User from '../model/UserSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cart from '../model/CartSchema.js';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

export const getUserData = async (req, res) => {
  try {
    // Extract token from the cookies
    let token = null;
    const cookies = req.cookies;
    Object.keys(cookies).forEach(cookieKey => {
      if (cookieKey.startsWith('user_') && cookieKey.endsWith('_token')) {
        token = cookies[cookieKey];
        return;
      }
    });

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set content type header
    res.setHeader('Content-Type', 'application/json');

    res.json({ userType: user.userType, email: user.email });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isPasswordValid = false;

    if (user.userType === 'customer') {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    // Set Content-Type header
    res.setHeader('Content-Type', 'application/json');

    // Set the authToken cookie
    res.cookie(`user_${user._id}_token`, token, { httpOnly: true, maxAge: 3600000, path: '/' });

    return res.status(200).json({ success: true, token, userId: user._id, userType: user.userType });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUserData = req.body;

    await User.findByIdAndUpdate(userId, updatedUserData);

    res.json({ message: 'User information updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the token and extract user ID
    const decodedToken = jwt.verify(token.split(' ')[1], secretKey);
    const userId = decodedToken.userId;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure that the currentPassword is a string
    const currentPassword = String(req.body.currentPassword);

    // Verify the current password
    let isPasswordValid = false;
    if (user.userType === 'customer') {
      isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } else if (user.userType === 'merchant') {
      isPasswordValid = currentPassword === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Hash the new password if the user is a customer
    let hashedNewPassword = req.body.newPassword;
    if (user.userType === 'customer') {
      hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
    }

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, isMerchant } = req.body;
    const hashedPassword = isMerchant ? password : await bcrypt.hash(password, 10);
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.json({ message: 'User already exists.' });
    } else {
      const newUser = new User({ firstName, middleName, lastName, userType: isMerchant ? 'merchant' : 'customer', email, password: hashedPassword });

      // Save the new user
      await newUser.save();

      // Create a shopping cart for the new user
      const newCart = new Cart({ user: newUser._id, items: [] });

      // Save the new cart
      await newCart.save();

      res.status(201).json({ message: 'User registered successfully.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing up.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    console.log('Users:', users);
    res.json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.json({ message: 'Server Error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
