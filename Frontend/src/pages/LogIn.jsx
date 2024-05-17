import { useState } from 'react';
import axios from 'axios';
import { Cookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

const cookies = new Cookies()
const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate()


  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/login', { email, password });
  
      if (response.data.success) {
        const token = response.data.token;
        cookies.set('token', token, {
          path: '/',
          maxAge: 60 * 60,
        });
      } else {
        console.log('Login failed:', response.data.error);
      }
      const { userType } = response.data;
      setEmail('');
      setPassword('');
      navigate(userType === 'merchant' ? '/dashboard' : '/shop');
      window.location.reload()
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <br />
          <input type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <br />
          <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LogIn;
