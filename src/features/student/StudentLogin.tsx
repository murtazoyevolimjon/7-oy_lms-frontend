import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import './StudentLogin.css';

const StudentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/students/login', { email, password });
            localStorage.setItem('token', response.data.accessToken);
            navigate('/student/dashboard');
        } catch (err) {
            setError('Login yoki parol noto‘g‘ri');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Tizimga kirish</h2>
                <p>Hisobingizga kiring</p>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Emailni kiriting"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Parol</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Parolni kiriting"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label="Parolni ko'rsatish yoki yashirish"
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <button type="submit">Kirish</button>
                </form>
            </div>
        </div>
    );
};

export default StudentLogin;