import { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import axios from 'axios';

const cookies = new Cookies();

export default function Root() {
    const navigate = useNavigate();

    const handleSignout = useCallback(() => {
        cookies.remove('token', { path: '/' });
        setUserType(null);
        navigate('/login');
        window.location.reload();
    }, [navigate]);

    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = cookies.get('token');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const expirationTime = decodedToken.exp * 1000;
                    const currentTime = new Date().getTime();
                    
                    if (currentTime >= expirationTime) {
                        handleSignout();
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    handleSignout();
                }
            }
        };
        const token = cookies.get('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;
            fetchUserData(userId);
        }
        
        const intervalId = setInterval(checkTokenExpiration, 1000);

        return () => clearInterval(intervalId);
    }, [handleSignout]);

    const fetchUserData = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
            const { userType } = response.data;
            setUserType(userType);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };


    const isUserSignedIn = !!cookies.get('token');

    return (
        <>
            <nav className='navigation-bar'>
                <ul className='ul-1'>
                    <li className='website-name'><Link to={`/`}>Farm to Shelf</Link></li>
                </ul>
                <ul className='ul-2'>
                    {isUserSignedIn && (
                        <>
                            {userType === 'customer' && (
                                <>
                                    <li><Link to={`/shop`}>Shop</Link></li>
                                    <li><Link to={`/cart`}>Cart</Link></li>
                                </>
                            )}
                            {userType === 'merchant' && (
                                <>
                                    <li><Link to={`/dashboard`}>Dashboard</Link></li>
                                    <li><Link to={`/merchantorders`}>Orders</Link></li>
                                </>
                            )}
                        </>
                    )}
                </ul>
                <ul className='ul-3'>
                    {isUserSignedIn ? (
                        <>
                            {userType === 'customer' && (
                                <>
                                    <li><Link to={`/account`}>Account</Link></li>
                                    <li><Link to={`/orders`}>Orders</Link></li>
                                    <li><button onClick={handleSignout}>Sign Out</button></li>
                                </>
                            )}
                            {userType === 'merchant' && (
                                <>
                                    <li><Link to={`/account`}>Account</Link></li>
                                    <li><button onClick={handleSignout}>Sign Out</button></li>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <li><Link to={`/login`}>Log In</Link></li>
                            <li><Link to={`/signup`}>Sign Up</Link></li>
                        </>
                    )}
                </ul>
            </nav>
            <Outlet />
            <footer className="footer">
                <p className='footer-content1'>© 2024 Farm to Shelf. All rights reserved.</p>
                <p className='footer-content2'>Contact Us: contact@farmToShelf.com</p>
            </footer>
        </>
    )
}
