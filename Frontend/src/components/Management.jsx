import { useState, useEffect } from 'react';
import axios from 'axios';
import './Management.css'; // Import the CSS file for user management styles

const Management = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>; {/* Added className */}
  }

  if (error) {
    return <div className="error">{error}</div>; {/* Added className */}
  }

  return (
    <div className='mainm'>
      <h1 className='management-title'>User Management</h1> {/* Added className */}
      <table className='user-table'> {/* Added className */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>User Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td />
            <td colSpan="3" className="total-users">Total Users: {users.length}</td> {/* Added className */}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Management;
