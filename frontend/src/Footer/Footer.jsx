import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
        <div className='Footer'>
            <div className="svg-slope">
                <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                    <polygon fill="#1A1A40" points="0,10 100,0 100,10 0,10" />
                </svg>
                <div className="content">
                    <div className="footerDetail" style={{ width: '200px' }}>
                        <h1>ARSHIT</h1>
                        <h3>ENTERPRISES</h3>
                        <br />
                        <p>Arshit Enterprises is your trusted source for electronic and electrical items</p>
                    </div>
                    <div className="quickLinks">
                        <h3>Quick Links</h3>
                        <br />
                        <Link to={'/'} style={{textDecoration:'none'}}><p>Home</p></Link>
                        <Link to={'/products/WiringItems'} style={{textDecoration:'none'}}><p>Product</p></Link>
                        <Link to={'/contactus'} style={{textDecoration:'none'}}><p>Contact Us</p></Link>
                        <Link to={'/aboutus'} style={{textDecoration:'none'}}><p>About Us</p></Link>
                    </div>
                    <div className="footerEmail">
                        <h3>Email</h3>
                        <br />
                        <p>mittalarshit56@gmail.com</p>
                        <p>+91 9461033257</p>
                        <div className='footerIcon' style={{ display: 'flex', height: '0px', justifyContent: 'space-evenly', paddingBottom: '12px' }}>
                            <Link to={''} style={{textDecoration:'none', color:'white'}}><FontAwesomeIcon icon={faFacebookF} style={{ width: '15px' }} /></Link>
                            <Link to={''} style={{textDecoration:'none', color:'white'}}><FontAwesomeIcon icon={faTwitter} style={{ width: '25px' }} /></Link>
                            <Link to={'https://www.instagram.com/_arshit___9461/'} style={{textDecoration:'none', color:'white'}}><FontAwesomeIcon icon={faInstagram} style={{ width: '25px' }} /></Link>
                        </div>
                    </div>
                </div>
                <div className="copyRight">
                    &copy; Arshit Enterprises. All irights reserved.
                </div>
            </div>
        </div>
    );
};

export default Footer;