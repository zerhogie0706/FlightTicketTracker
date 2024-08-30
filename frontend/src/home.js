import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [trackingRecords, setTrackingRecords] = useState([]);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [newRecord, setNewRecord] = useState({
        departure_id: null,
        arrival_id: null,
        outbound_date: null,
        return_date: null,
        airlines: null,
        expectation: null,
    });
    const airports = [
        { id: 'TPE', name: 'Taoyuan, Taiwan' },
        { id: 'NRT', name: 'Tokyo, Japan' },
        { id: 'KIX', name: 'Osaka, Japan' },
        { id: 'FUK', name: 'Fukuoka, Japan' },
        { id: 'BKK', name: 'Bangkok, Thaniland' },
        { id: 'ICN', name: 'Seoul, South Korea' },
        { id: 'JFK', name: 'New York, USA' },
        { id: 'LAX', name: 'Los Angeles, USA' },
        { id: 'SFO', name: 'San Francisco, USA' },
        { id: 'SEA', name: 'Seattle, USA' },
        { id: 'YVR', name: 'Vancouver, Canada' },
    ]
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // If no token is found, redirect to the login page
        if (!token) {
            navigate('/');
        }
        axios.get('/api/tracking_record/', {
            headers: {
                'Authorization': `Token ${token}`,
            }
        })
        .then(response => {
            console.log(response);
            setTrackingRecords(response.data.data || []);
        })
        .catch(error => {
            console.error('Failed to fetch tracking records', error);
            // Handle error appropriately
        });
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const csrfToken = localStorage.getItem('csrftoken'); // Assuming CSRF token is stored in localStorage
            console.log(csrfToken);
            await axios.post('/api/logout/', {}, {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Token ${localStorage.getItem('token')}` // Send the auth token in the headers
                }
            });

            // If the request is successful, clear the token and redirect to login page
            localStorage.removeItem('token');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, handle the error (e.g., display a message)
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecord({
            ...newRecord,
            [name]: value,
        });
    };

    const handleCreateRecord = () => {
        const token = localStorage.getItem('token');
        const csrfToken = localStorage.getItem('csrftoken');
        axios.post('/api/tracking_record/', newRecord, {
            headers: {
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken,
            }
        })
        .then(response => {
            setTrackingRecords(response.data.data);
            // Reset the form
            setNewRecord({
                departure_id: '',
                arrival_id: '',
                outbound_date: '',
                return_date: '',
                airlines: '',
                expectation: '',
            });
            setErrorMessage('');
        })
        .catch(error => {
            console.error('Failed to create tracking record', error);
            // Handle error appropriately
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('An unknown error occurred.');
            }
        });
    };

    const handleDeleteRecord = (id) => {
        const token = localStorage.getItem('token');
        const csrfToken = localStorage.getItem('csrftoken');
        axios.delete(`/api/tracking_record/${id}/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken,
            }
        })
        .then(response => {
            // Remove the deleted record from the state
            setTrackingRecords(trackingRecords.filter(record => record.id !== id));
        })
        .catch(error => {
            console.error('Failed to delete tracking record', error);
        });
    };

    const handleInfoClick = (recordId) => {
        if (selectedRecordId === recordId) {
            setSelectedRecordId(null);  // Deselect if already selected
        } else {
            setSelectedRecordId(recordId);  // Set the selected record ID
        }
    };

    // Function to get the current date in MM/DD format
    const getCurrentDate = () => {
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
    };

    return (
        <div className="home-container">
            <h1>Your Tracking Records</h1>
            {trackingRecords.length > 0 ? (
                <ul>
                    {trackingRecords.map(record => (
                        <li key={record.id} style={{ marginBottom: '20px' }}>
                            <strong>{record.departure_id} to {record.arrival_id}</strong><br />
                            Outbound: {record.outbound_date} | Return: {record.return_date}<br />
                            Airlines: {record.airlines} | Expectation: {record.expectation}<br />
                            Lowest: {record.lowest_price}<br />
                            Current Lowest Price ({getCurrentDate()}): {record.current_lowest} <br />
                            {record.lowest_info && Object.keys(record.lowest_info).length > 0 && (
                                <button 
                                    onClick={() => handleInfoClick(record.id)} 
                                    style={{ marginLeft: '20px', color: 'white', backgroundColor: 'blue', border: 'none', cursor: 'pointer' }}
                                >
                                    {selectedRecordId === record.id ? 'Hide Info' : 'Show Info'}
                                </button>
                            )}
                            {selectedRecordId === record.id && record.lowest_info && (
                                <div style={{ marginTop: '10px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                                    <pre>{JSON.stringify(record.lowest_info, null, 2)}</pre>
                                </div>
                            )}
                            <button 
                                onClick={() => handleDeleteRecord(record.id)} 
                                style={{ marginLeft: '20px', color: 'white', backgroundColor: 'red', border: 'none', cursor: 'pointer' }}
                            > Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tracking records found. Please create a new record.</p>
            )}
            <h2>Create New Tracking Record</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
            <div>
                <select
                    name="departure_id"
                    value={newRecord.departure_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Departure Airport</option>
                    {airports.map(airport => (
                        <option key={airport.id} value={airport.id}>
                            {airport.name} ({airport.id})
                        </option>
                    ))}
                </select>
                <select
                    name="arrival_id"
                    value={newRecord.arrival_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Arrival Airport</option>
                    {airports.map(airport => (
                        <option key={airport.id} value={airport.id}>
                            {airport.name} ({airport.id})
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    name="outbound_date"
                    value={newRecord.outbound_date}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="date"
                    name="return_date"
                    value={newRecord.return_date}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="airlines"
                    placeholder="Airlines"
                    value={newRecord.airlines}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="expectation"
                    placeholder="Expectation"
                    value={newRecord.expectation}
                    onChange={handleInputChange}
                    required
                />
                <button onClick={handleCreateRecord}>Create Record</button>
            </div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
