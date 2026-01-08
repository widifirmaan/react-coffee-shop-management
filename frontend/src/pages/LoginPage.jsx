import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showGate, setShowGate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const user = await response.json();
                setShowGate(true); // Trigger gate animation
                setTimeout(() => {
                    onLogin(user);
                    navigate('/dashboard');
                }, 1000); // Wait for gate animation
            } else {
                setError('INVALID CREDENTIALS');
                setIsLoggingIn(false);
            }
        } catch (err) {
            setError('SERVER ERROR');
            setIsLoggingIn(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Fluid Animation Background */}
            <div className="fluid-bg">
                <div className="fluid-blob" style={{
                    left: `${mousePos.x - 200}px`,
                    top: `${mousePos.y - 200}px`,
                }}></div>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '450px', zIndex: 10, padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3.5rem', lineHeight: '1', margin: '0' }}>STAFF</h1>
                    <h2 style={{ background: 'black', color: 'white', display: 'inline-block', padding: '0 10px' }}>PORTAL</h2>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-color)',
                        color: 'white',
                        padding: '10px',
                        border: '3px solid black',
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 900, fontSize: '0.8rem', display: 'block' }}>USER IDENTIFIER</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="USERNAME"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ fontWeight: 900, fontSize: '0.8rem', display: 'block' }}>SECURITY KEY</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="PASSWORD"
                            required
                        />
                    </div>
                    <button type="submit" className="primary" style={{ width: '100%', fontSize: '1.2rem' }} disabled={isLoggingIn}>
                        {isLoggingIn ? 'AUTHENTICATING...' : 'ENTER SYSTEM'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', borderTop: '2px solid black', paddingTop: '15px' }}>
                    <p style={{ fontWeight: 700, margin: '5px 0' }}>MANAGER: manager / password123</p>
                    <p style={{ fontWeight: 700, margin: '5px 0' }}>BARISTA: barista / password123</p>
                </div>
            </div>

            {/* Gate Animation Overlay */}
            {showGate && (
                <div className={`gate-animation ${showGate ? 'gate-open' : ''}`}>
                    <div className="gate-leaf gate-leaf-left"></div>
                    <div className="gate-leaf gate-leaf-right"></div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
