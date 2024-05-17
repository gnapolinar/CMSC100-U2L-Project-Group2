import { useEffect, useState } from 'react';
import { Cookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const cookies = new Cookies();

const UserData = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    userType: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = cookies.get('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
        const data = response.data;
        setUserData(data);
        setUpdatedUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateUserData = async () => {
    try {
      if (!updatedUserData.firstName) {
        throw new Error('First name is required');
      }
  
      if (!updatedUserData.lastName) {
        throw new Error('Last name is required');
      }
  
      if (!updatedUserData.email) {
        throw new Error('Email is required');
      } else if (!updatedUserData.email.includes('@')) {
        throw new Error('Invalid email address');
      }

      await axios.put(`http://localhost:4000/api/users/${userData._id}`, updatedUserData);
      setIsEditing(false);
      setConfirmationMessage('User data updated successfully');

      const response = await axios.get(`http://localhost:4000/api/users/${userData._id}`);
      const data = response.data;
      setUserData(data);
      setUpdatedUserData(data);
    } catch (error) {
      console.error('Error updating user data:', error);
      setConfirmationMessage(error.message);
    }
  };
  

  const handlePasswordChange = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/users/${userData._id}/password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${cookies.get('token')}`,
          },
        }
      );
      setConfirmationMessage(response.data.message);
    } catch (error) {
      setConfirmationMessage('Incorrect password. Please try again.');
    }
  };
  
  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Data</h1>
      {isEditing ? (
        <>
          <p>First Name: <input type="text" name="firstName" value={updatedUserData.firstName} onChange={handleChange} /></p>
          <p>Middle Name: <input type="text" name="middleName" value={updatedUserData.middleName} onChange={handleChange} /></p>
          <p>Last Name: <input type="text" name="lastName" value={updatedUserData.lastName} onChange={handleChange} /></p>
        </>
      ) : (
        <p>Name: {userData.firstName} {userData.middleName} {userData.lastName}</p>
      )}
      <p>Email: {isEditing ? <input type="text" name="email" value={updatedUserData.email} onChange={handleChange} /> : userData.email}</p>
      <p>Account Type: {userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)}</p>

      <div>
        {isEditing ? (
          <div>
            <button onClick={handleUpdateUserData}>Save Changes</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={handleEdit}>Edit</button>
        )}

        {!isEditing && (
          <button onClick={handleChangePassword}>Change Password</button>
        )}

        {isChangingPassword && (
          <div>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={handlePasswordChange}>Change Password</button>
            <button onClick={() => setIsChangingPassword(false)}>Cancel</button>
          </div>
        )}
        {confirmationMessage && <p>{confirmationMessage}</p>}
      </div>
    </div>
  );
};

export default UserData;
