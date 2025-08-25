import React, { use, useEffect } from 'react';
import './Login.css';
import login from '../assets/login.jpg';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();

    const [isSignIn, setIsSignIn] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginemail, setLoginemail] = useState('');
    const [loginpassword, setLoginpassword] = useState('');

    const resetField = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setLoginemail('');
        setLoginpassword('');
    };

    const handleToggle = () => {
        setIsSignIn(prev => !prev);
        resetField();
    };

    const handleSignin = async (e) => {
        try {
            const { data } = await axios.post('https://arshit-enterprises-backend.onrender.com/signin', {
                username: username,
                email: email,
                password: password
            });
            localStorage.setItem('token', data.token);
            alert(data.message);
            resetField();
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Signin failed')
        }
    }

    const handleLogin = async () => {
        try {
            const { data } = await axios.post('https://arshit-enterprises-backend.onrender.com/login', {
                email: loginemail,
                password: loginpassword,
            });
            localStorage.setItem('token', data.token);
            alert(data.message);
            resetField();
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };
    return (

        <div className="main">
            <div className='image'>
                <img src={login} alt="" />
            </div>
            <div className='form'>
                <div className="Login">
                    <h2>Sign in</h2>
                    <label className="switch">
                        <input type="checkbox" checked={isSignIn} onChange={handleToggle} />
                        <span className="slider"></span>
                    </label>
                    <h2>Login</h2>
                </div>

                <div className={`card-container ${isSignIn ? 'flipped' : ''}`}>
                    <div className="card">
                        <div className="front">
                            <h2>Sign In</h2>
                            <input type="text" name='username' id='username' placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="new-password"/>
                            <input type="email" name='email' id='email' placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="new-password"/>
                            <input type="password" name='password' id='password' value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required autoComplete="new-password"/>
                            <button type='submit' onClick={handleSignin}>Sign In</button>
                            <p style={{ color: '#2E4A62', marginTop: '12px' }}>Already have an account? <a onClick={handleToggle} style={{ color: 'blue' }}>Login</a></p>
                        </div>
                        <div className="back">
                            <h2>Login</h2>
                            <input type="text" name='email' id='LoginEmail' placeholder="Email" value={loginemail} onChange={e => setLoginemail(e.target.value)} required autoComplete="new-password"/>
                            <input type="password" name='password' id='LoginPassword' placeholder="Password" value={loginpassword} onChange={e => setLoginpassword(e.target.value)} required autoComplete="new-password" />
                            <a href="/forgot-password" style={{ color: 'blue', textAlign: 'end', width:'100%', cursor:'pointer'}}>Forgot Password?</a>
                            <button type='submit' onClick={handleLogin}>Login</button>
                            <p style={{ color: '#2E4A62', marginTop: '12px' }}>Don't have an account? <a onClick={handleToggle} style={{ color: 'blue', cursor:'pointer'}}>Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
