import { useState } from 'react';
import axios from 'axios';
import { Cookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './LogIn.css';

const cookies = new Cookies();

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        const { userType } = response.data;
        setEmail('');
        setPassword('');
        navigate(userType === 'merchant' ? '/dashboard' : '/shop');
        window.location.reload();
      } else {
        console.log('Login failed:', response.data.error);
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="background-image"></div>
      <div className="login-form">
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <label>
              <div className="icon-box">
                <div className="icon-container">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                </div>
              </div>
              <input type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <div className="input-container">
            <label>
              <div className="icon-box">
                <div className="icon-container">
                  <FontAwesomeIcon icon={faLock} className="icon" />
                </div>
              </div>
              <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>
          <button type="submit">Log In</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default LogIn;
