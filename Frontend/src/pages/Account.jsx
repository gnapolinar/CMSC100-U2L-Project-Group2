import { useState, useEffect } from 'react';
import axios from 'axios';

const Account = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axios.get(`http://localhost:4000/api/users?email=${email}`);
      const userDataArray = response.data;
      const user = userDataArray.find(user => user.email === email);
      setUserData(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div>
      <h2>Account Information</h2>
      {userData ? (
        <ul>
          <li>First Name: {userData.firstName}</li>
          <li>Last Name: {userData.lastName}</li>
          <li>Email: {userData.email}</li>
          <li>User Type: {userData.userType}</li>
        </ul>
      ) : (
        <div>No user data found</div>
      )}
    </div>
  );
};

export default Account;
