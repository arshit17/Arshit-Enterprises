import React, { useContext, useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import logo from '../assets/logo.png';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthContext } from '../Auth/AuthContext';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    const calculateItems = () => {
        const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        return totalQuantity;
    }

    const itemTotal = calculateItems();

    const handleLogin = () => {
        logout();
        navigate('/signup');
    }

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false);
    }

    return (
        <div className='Navbar'>
            <div className='logo'>
                <Link to={'/'} style={{ textDecoration: "none", width: "5vw", height: "5vw" }}>
                    <img src={logo} alt="" style={{ height: '80px', width: '200px'}} />
                </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className={`options desktop-menu`}>
                {token ? (
                    <Link to={"/products/WiringItems"} style={{ textDecoration: "none" }}><p>Products</p></Link>
                ) : (
                    <Link to={"/signup"} style={{ textDecoration: "none" }}><p>Products</p></Link>
                )}
                <Link to={"/aboutus"} style={{ textDecoration: "none" }}><p>About Us</p></Link>
                <Link to={"/orders"} style={{ textDecoration: "none" }}><p>Orders</p></Link>
                {token ? (
                    <Link to={"/contactus"} style={{ textDecoration: "none" }}><p>Contact Us</p></Link>
                ) : (
                    <Link to={"/signup"} style={{ textDecoration: "none" }}><p>Contact Us</p></Link>
                )}
                {token ? (
                    <Link to={"/cartItem"} style={{ textDecoration: "none" }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FontAwesomeIcon icon={faCartShopping} size='l' style={{ color: '#fff' }} />
                            <span style={{ fontSize: '14px', transform: 'translate(-6px ,-9px)' }}>{itemTotal}</span>
                        </p>
                    </Link>
                ) : (
                    <Link to={"/signup"} style={{ textDecoration: "none" }}>
                        <p><FontAwesomeIcon icon={faCartShopping} size='l' style={{ color: '#fff' }} /></p>
                    </Link>
                )}
                <nav>
                    {token ? (
                        <div onClick={handleLogin} style={{ cursor: 'pointer' }}>
                            <FontAwesomeIcon id='icon' icon={faUserCircle} size='xl' style={{ color: '#fff', transform:'translate(0px, -2px)', cursor:'pointer'}} />
                        </div>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}><p>Sign Up</p></Link>
                    )}
                </nav>
            </div>

            {/* Hamburger Menu */}
            <div className="hamburger" onClick={handleMenuToggle}>
                <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
                <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
                <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
            </div>

            {/* Mobile Drawer */}
            <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
                <div className="drawer-content">
                    {token ? (
                        <Link to={"/products/WiringItems"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p>Products</p>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p>Products</p>
                        </Link>
                    )}
                    <Link to={"/aboutus"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                        <p>About Us</p>
                    </Link>
                    <Link to={"/orders"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                        <p>Orders</p>
                    </Link>
                    {token ? (
                        <Link to={"/contactus"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p>Contact Us</p>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p>Contact Us</p>
                        </Link>
                    )}
                    {token ? (
                        <Link to={"/cartItem"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faCartShopping} size='l' style={{ color: '#fff' }} />
                                <span>Cart ({itemTotal})</span>
                            </p>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faCartShopping} size='l' style={{ color: '#fff' }} />
                                <span>Car</span>
                            </p>
                        </Link>
                    )}
                    {token ? (
                        <div onClick={() => { handleLogin(); handleMenuClose(); }} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faUserCircle} size='xl' style={{ color: '#fff' }} />
                                <span>Logout</span>
                            </p>
                        </div>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }} onClick={handleMenuClose}>
                            <p>Sign Up</p>
                        </Link>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isMenuOpen && <div className="drawer-overlay" onClick={handleMenuClose}></div>}
        </div>
    );
};

export default Navbar;