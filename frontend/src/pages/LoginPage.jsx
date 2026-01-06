import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const user = await response.json();
                onLogin(user);
                navigate('/');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check your connection.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: 'var(--bg-color)'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Staff Login</h2>
                {error && <div style={{
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: 'var(--radius)',
                    marginBottom: '15px',
                    border: '2px solid black',
                    fontWeight: 'bold'
                }}>
                    {error}
                </div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    <button type="submit" className="primary" style={{ width: '100%' }}>
                        LOG IN
                    </button>
                </form>
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p>Default Manager: manager / password</p>
                    <p>Default Barista: barista / password</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
