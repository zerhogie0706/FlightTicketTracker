// frontend/src/Login.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'


const getCSRFToken = () => {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            csrfToken = value;
        }
    });
    return csrfToken;
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Get and store the CSRF token in localStorage when the component mounts
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            localStorage.setItem('csrftoken', csrfToken);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get CSRF token
            const csrfToken = localStorage.getItem('csrftoken');

            const response = await axios.post('/api/login/', {
                username,
                password,
            }, {
                headers: {
                    'X-CSRFToken': csrfToken,
                }
            });

            // const response = await axios.get('/api/test/');

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                setError('');
                navigate('/home');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('Invalid Credentials');
            } else {
                setError('Something went wrong. Please try again.');
            }
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="login-button">Login</button>
            </form>
            <div className="signup-container">
                <p>Do not have an account yet? Sign up below.</p>
                <button onClick={handleSignupRedirect} className="signup-button">
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;
