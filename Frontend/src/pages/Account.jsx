import { useEffect, useState } from 'react';
import { Cookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './Account.css';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

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

      setTimeout(() => {
        setConfirmationMessage('');
      }, 3000);

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
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Incorrect password. Please try again.');
    }
  };
  
  if (!userData) {
    return <div className={`fade-in-out ${isActive ? "active" : ""}`}>Loading...</div>;
  }

  return (
    <div className={`fade-in-out ${isActive ? "active" : ""}`}>
    <div className="account-container">
      <h1 className="account-header">My Profile</h1>
<div className="field-box full-name-box">
  <p className="field-label">Full Name:</p>
  <div className="field-container">
    {isEditing ? (
      <>
        <div className="field-value">
          <input type="text" name="firstName" className="first-name-input" value={updatedUserData.firstName} onChange={handleChange} placeholder="First Name" />
        </div>
        <div className="field-value">
          <input type="text" name="middleName" className="middle-name-input" value={updatedUserData.middleName} onChange={handleChange} placeholder="Middle Name" />
        </div>
        <div className="field-value">
          <input type="text" name="lastName" className="last-name-input" value={updatedUserData.lastName} onChange={handleChange} placeholder="Last Name" />
        </div>
      </>
    ) : (
      <div className="field-value">
        <p>{`${userData.firstName} ${userData.middleName} ${userData.lastName}`}</p>
      </div>
    )}
  </div>
</div>
      <div className="field-box email-box">
        <p className="field-label">Email:</p>
        <div className="field-value">
          {isEditing ? <input type="text" name="email" value={updatedUserData.email} onChange={handleChange} /> : <p>{userData.email}</p>}
        </div>
      </div>
      <div className="field-box account-type-box">
        <p className="field-label">Account Type:</p>
        <div className="field-value">
          <p>{userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)}</p>
        </div>
      </div>
      <div className="account-actions">
        {isEditing ? (
          <div className="edit-buttons">
            <button className="save-button" onClick={handleUpdateUserData}>Save Changes</button>
            <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button className="edit-button" onClick={handleEdit}>Edit</button>
        )}

        {!isEditing && (
          <button className="change-password-button" onClick={handleChangePassword}>Change Password</button>
        )}

        {isChangingPassword && (
          <div className="overlay">
          <div className="password-change-container">
            <div className="password-change-box">
              <h1 className="change-password-title">Change Password</h1>
            <input type="password" className="password-input1" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input type="password" className="password-input2" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="password-change-buttons">
            <button className="save-button" onClick={handlePasswordChange}>Save</button>
            <button className="cancel-button" onClick={() => setIsChangingPassword(false)}>Cancel</button>
            </div>
          </div>
          </div>
        )}
        {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
    </div>
  );
};

export default UserData;
