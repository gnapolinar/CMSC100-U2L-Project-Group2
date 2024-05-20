import { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import Logo from '../pictures/homepage_logo.png';

const cookies = new Cookies();

export default function Root() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userType, setUserType] = useState(null);
    const [navbarColor, setNavbarColor] = useState('transparent');

    const handleSignout = useCallback(() => {
        cookies.remove('token', { path: '/' });
        setUserType(null);
        navigate('/login');
        window.location.reload();
    }, [navigate]);

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

    useEffect(() => {
        const changeNavbarColor = () => {
            if (window.scrollY >= 80) {
                setNavbarColor('#323131'); 
            } else {
                setNavbarColor('transparent');
            }
        };

        const validPaths = ['/', '/login', '/signup'];
        if (validPaths.includes(location.pathname)) {
            window.addEventListener('scroll', changeNavbarColor);
            return () => {
                window.removeEventListener('scroll', changeNavbarColor);
            };
        } else {
            setNavbarColor('#323131'); 
        }
    }, [location.pathname]);

    const isUserSignedIn = !!cookies.get('token');

    return (
        <>
            <nav className='navigation-bar' style={{ backgroundColor: navbarColor }}>
                <div className='logo-container'>
                    <img className='logo' src={Logo} alt='Website Logo'></img>
                    <a className='website-name' href="/">Farm to Shelf</a>
                </div>
                <div className='center-links'>
                    <ul className='ul-2'>
                        {isUserSignedIn && (
                            <>
                                {userType === 'customer' && (
                                    <>
                                        <li><Link to={`/shop`}>Shop</Link></li>
                                        <li><Link to={`/cart`}>Cart</Link></li>
                                        <li><Link to={`/account`}>Account</Link></li>
                                        <li><Link to={`/orders`}>Orders</Link></li>
                                    </>
                                )}
                                {userType === 'merchant' && (
                                    <>
                                        <li><Link to={`/dashboard`}>Dashboard</Link></li>
                                        <li><Link to={`/merchantorders`}>Orders</Link></li>
                                        <li><Link to={`/account`}>Account</Link></li>
                                    </>
                                )}
                            </>
                        )}
                    </ul>
                </div>
                <ul className='ul-3'>
                    {isUserSignedIn ? (
                        <>
                            <li className='logout-button'><button onClick={handleSignout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li className="signup-link"><Link to={`/signup`}>Sign Up</Link></li>
                            <li><Link className="login-button" to={`/login`}>Log In</Link></li>
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
