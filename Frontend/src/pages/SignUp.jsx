import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Cookies } from 'react-cookie';
import './SignUp.css'; 

const cookies = new Cookies();

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    fetchUsers();
    const token = cookies.get('token');
    console.log(token);
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:4000/api/users')
    .then((res) => {
      console.log(res.data);
    });
  };

  const handleSignup = (event) => {
    event.preventDefault();
    axios.post('http://localhost:4000/api/register', { firstName, middleName, lastName, email, password })
    .then(() => {
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setEmail('');
      setPassword('');
      fetchUsers();
      navigate('/login');
    })
    .catch((error) => {
      console.log('Unable to register user', error);
    });
  };

  return (
    <div className={`fade-in-out ${isActive ? "active" : ""}`}>
    <div className="signup-container">
      <div className='background-image'></div>
      <div className="signup-form">
        <h2>Sign Up</h2>
        <label>First Name:</label>
        <input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
        <label>Middle Name:</label>
        <input type="text" value={middleName} placeholder="Middle Name" onChange={(e) => setMiddleName(e.target.value)} />
        <label>Last Name:</label>
        <input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
        <label>Email:</label>
        <input type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleSignup}>Sign Up</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
    </div>
  );
};

export default SignUp;
