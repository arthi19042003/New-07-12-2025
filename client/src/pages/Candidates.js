import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import './Candidates.css'; 

const Candidates = () => {
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '',   
    email: '', 
    phone: '',  
    city: '',    
    state: '', 
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return; 
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        password: formData.password,
      };
      
      await axios.post('/api/auth/register', dataToSubmit); 
            
      setLoading(false);

      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' },
      });

    } catch (err) {
      setLoading(false);
      setError(err.response && err.response.data.message
        ? err.response.data.message
        : err.message
      );
    }
  };

  const renderInput = (name, label, type = 'text') => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Candidate Register</h2>

        <div className="form-row">
          {renderInput('firstName', 'First Name')}
          {renderInput('lastName', 'Last Name')}
        </div>
        
        {renderInput('email', 'Email', 'email')}
        {renderInput('phone', 'Phone', 'tel')}
        
        <div className="form-row">
          {renderInput('city', 'City')}
          {renderInput('state', 'State')}
        </div>
        
        {renderInput('password', 'Password', 'password')}
        {renderInput('confirmPassword', 'Confirm Password', 'password')}

        {/* 9. This is where the error message appears */}
        {error && (
          <div className="error-message-box">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="register-button">
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div className="login-link">
          Already have an account?{' '}
          {/* 10. Use <Link> for internal navigation */}
          <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default Candidates;