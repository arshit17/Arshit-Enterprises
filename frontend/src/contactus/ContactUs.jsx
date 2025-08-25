import React from 'react';
import "leaflet/dist/leaflet.css";
import MapView from './MapView';
import './ContactUs.css';
import axios from 'axios';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faClock, faEnvelope } from '@fortawesome/free-solid-svg-icons';


function ContactUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://arshit-enterprises-backend.onrender.com/sendEmail', {
                name: name,
                email: email,
                subject: subject,
                message: message,
            });
            alert('Message sent!');
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (err) {
            alert('Error to send message');
        }
    }

    return (
        <div className='contactUs' >
            <form onSubmit={handleSubmit} className="contact-form">
                <h1 className="contact-title">Contact Us</h1>
                <label htmlFor="name" className="contact-label">Name:</label>
                <input type="text" id='name' name='name' className="contact-input" placeholder='Enter your name' value={name} onChange={(e) => setName(e.target.value)} required />
                <br /><br />
                <label htmlFor="email" className="contact-label">Email:</label>
                <input type="email" id='email' name='email' className="contact-input" placeholder='Enter your email id' value={email} onChange={(e) => setEmail(e.target.value)} required />
                <br /><br />
                <label htmlFor="subject" className="contact-label">Subject:</label>
                <input type="text" id='subject' name='subject' className="contact-input" placeholder='Enter your subject' value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <br /><br />
                <label htmlFor="message" className="contact-label">Message:</label>
                <textarea name="message" id="message" className="contact-textarea" placeholder='Enter here...' value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
                <br />
                <button type="submit" className="contact-button"><b>Send</b></button>
            </form>
            <div className="map-container">
                <div className="map-view">
                    <MapView />
                </div>

                <div className='contactDetails'>
                    <br />
                    <h1 style={{ color: "#1A1A40" }}>𝓐𝓡𝓢𝓗𝓘𝓣 𝓔𝓝𝓣𝓔𝓡𝓟𝓡𝓘𝓢𝓔𝓢</h1>
                    <br />

                    <div style={{ color: "#1A1A40" }}>
                        <FontAwesomeIcon icon={faPhone} style={{ color: "#1A1A40" }} />
                        &nbsp;
                        +919461033257
                    </div>
                    <br />
                    <div style={{ color: "#1A1A40" }}>
                        <FontAwesomeIcon icon={faEnvelope} style={{ color: "#1A1A40" }} />
                        &nbsp;
                        mittalarshit56@gmail.com
                    </div>
                    <br />
                    <div style={{ color: "#1A1A40" }}>
                        <FontAwesomeIcon icon={faClock} style={{ color: "#1A1A40" }} />
                        &nbsp;
                        Store Hours:
                        <br />
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        Mon-Sat: 9:00 AM - 7:00 PM
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
