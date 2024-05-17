import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Cookies } from 'react-cookie'

const cookies = new Cookies();

const SignUp = () => {
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers();
    const token = cookies.get('token')
    console.log(token)
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:4000/api/users')
    .then((res) => {
      console.log(res.data)
    })
  }

  const handleSignup = (event) => {
    event.preventDefault()
    axios.post('http://localhost:4000/api/register', { firstName, middleName, lastName, email, password })
    .then(() => {
      setFirstName('')
      setMiddleName('')
      setLastName('')
      setEmail('')
      setPassword('')
      fetchUsers()
      navigate('/login')
    })
    .catch((error) => {
      console.log('Unable to register user', error)
    })
  }

  return (
    <div>
        <div>
          <h2>Sign Up</h2>
          <label>First Name:</label>
          <br />
          <input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
          <br />
          <br />
          <label>Middle Name:</label>
          <br />
          <input type="text" value={middleName} placeholder="Middle Name" onChange={(e) => setMiddleName(e.target.value)} />
          <br />
          <br />
          <label>Last Name:</label>
          <br />
          <input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
          <br />
          <br />
          <label>Email:</label>
          <br />
          <input type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <br />
          <br />
          <label>Password:</label>
          <br />
          <input type="text" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <br />
          <br />
          <button onClick={handleSignup}>Sign Up</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    </div>
  );
};

export default SignUp