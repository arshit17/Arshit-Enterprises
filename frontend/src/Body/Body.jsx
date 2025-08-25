import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward, faUserShield, faComment, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';
import Wiring from '../assets/wire_bundle.png'
import Bulb from '../assets/led_bulb.png'
import Drill from '../assets/drill_machine.webp'
import Washing from '../assets/washing_machine.png'
import Sanitary from '../assets/Sanitary_item.png'
import title from '../assets/y-removebg-preview.png'
import './Body.css'
import { AuthContext } from '../Auth/AuthContext'

function Body() {
    const { token } = useContext(AuthContext);
    return (
        <div className='Body-bottom'>
            <div className='Intro'>
                <div className="intoImg" style={{ width: "20%" }}>
                    <img src={title} alt="" style={{ height: "20vw", width: "40vw" }} />
                </div>
                <div>
                    <h1 style={{ fontSize: "xx-large" }}>𝐀𝐫𝐬𝐡𝐢𝐭 𝐄𝐧𝐭𝐞𝐫𝐩𝐫𝐢𝐬𝐞𝐬</h1>
                    <h3 style={{ fontSize: "x-large" }}>Your Electric and Electronic Shop</h3>
                    {token ? (
                        <Link to={"/products/WiringItems"}><button className='fa-bounce' style={{ marginTop: "3vw" }}>Shop Now</button></Link>
                    ) : (
                        <Link to={"/signup"}><button className='fa-bounce' style={{ marginTop: "3vw" }}>Shop Now</button></Link>
                    )}
                </div>
            </div>
            <div className="Feature">
                <h2 style={{ color: '#121212' }}>Featured Products</h2>

                <div className='Cards'>
                    {token ? (
                        <Link to={"/products/WiringItems"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Wiring} alt="" />
                                <p style={{ color: '#121212' }}>Wiring Items</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Wiring} alt="" />
                                <p style={{ color: '#121212' }}>Wiring Items</p>
                            </div>
                        </Link>
                    )}
                    {token ? (
                        <Link to={"/products/HomeAppliances"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Washing} alt="" />
                                <p style={{ color: '#121212' }}>Home Appliances</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Washing} alt="" />
                                <p style={{ color: '#121212' }}>Home Appliances</p>
                            </div>
                        </Link>
                    )}

                    {token ? (
                        <Link to={"/products/Tools"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Drill} alt="" />
                                <p style={{ color: '#121212' }}>Tools</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Drill} alt="" />
                                <p style={{ color: '#121212' }}>Tools</p>
                            </div>
                        </Link>
                    )}


                    {token ? (
                        <Link to={"/products/Lightings"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Bulb} alt="" />
                                <p style={{ color: '#121212' }}>Lighting</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Bulb} alt="" />
                                <p style={{ color: '#121212' }}>Lighting</p>
                            </div>
                        </Link>
                    )}

                    {token ? (
                        <Link to={"/products/SanitaryItems"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Sanitary} alt="" />
                                <p style={{ color: '#121212' }}>Sanitary Items</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to={"/signup"} style={{ textDecoration: "none" }}>
                            <div className="sepCard">
                                <img src={Sanitary} alt="" />
                                <p style={{ color: '#121212' }}>Sanitary Items</p>
                            </div>
                        </Link>
                    )}


                </div>
            </div>
            <div className='quality'>
                <div className='quality1'>
                    <div className='high'>
                        <FontAwesomeIcon id='icon' icon={faAward} size="xl" style={{ color: '#fff' }} />
                        <p style={{ color: "#fff", paddingTop:'20px' }}>High quality products and excellent service. Highly recommend.</p>
                    </div>
                </div>
                <div className='quality2'>
                    <div className='product'>
                        <FontAwesomeIcon id='icon' icon={faUserShield} size='l' style={{ color: '#fff' }} />
                        <p style={{ color: '#fff', paddingTop:'20px' }}>Quality Products</p>
                        <p style={{ color: '#fff', paddingTop:'20px' }}>Expect Assistance</p>
                        <p style={{ color: '#fff', paddingTop:'20px' }}>Affordable Price</p>
                    </div>
                    <div className='assistant'>
                        <div className='assistant1'>
                            <pre style={{ color: '#fff' }}><FontAwesomeIcon id='icon' icon={faComment} size='xl' />    Expert Assistance</pre>
                            <br />
                            <pre style={{ color: '#fff' }}><FontAwesomeIcon id='icon' icon={faHandHoldingDollar} size='xl' />    Affordable Price</pre>
                        </div>
                        <div className='assistant2'>
                            <p style={{ color: '#fff', padding:'0', paddingTop:'21px', margin: '0' }}>Customer Satisfaction</p>
                            <br />
                            <p style={{ color: '#fff', paddingTop: '0px' }}>Integrity</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Body;