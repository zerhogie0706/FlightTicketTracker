// src/Signup.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        currency: 'TWD',  // Default value
        phone_number: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSignup = () => {
        axios.post('/api/signup/', formData)
            .then(response => {
                console.log(response.data.message);
                navigate('/');  // Redirect to login page after successful signup
            })
            .catch(error => {
                console.error('Signup failed', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage('An unknown error occurred.');
                }
            });
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <div>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="currency"
                    placeholder="Currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                />
                <button onClick={handleSignup}>Sign Up</button>
            </div>
        </div>
    );
};

export default Signup;