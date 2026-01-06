import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import InventoryPage from './pages/InventoryPage';
import EmployeePage from './pages/EmployeePage';
import FinancePage from './pages/FinancePage';

import { useState, useEffect } from 'react';

import LoginPage from './pages/LoginPage';

function Navbar({ isDarkMode, toggleTheme, user, onLogout }) {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-brand">SIAP NYAFE</div>
            <div className="nav-links">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>MENU / POS</Link>
                <Link to="/kitchen" className={`nav-link ${location.pathname === '/kitchen' ? 'active' : ''}`}>KITCHEN</Link>
                <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`}>INVENTORY</Link>
                <Link to="/employees" className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`}>STAFF</Link>
                <Link to="/finance" className={`nav-link ${location.pathname === '/finance' ? 'active' : ''}`}>FINANCE</Link>
                <button
                    onClick={toggleTheme}
                    className="nav-link"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Toggle Theme"
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{user?.name || user?.username}</span>
                    <button onClick={onLogout} className="danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        LOGOUT
                    </button>
                </div>
            </div>
        </nav>
    );
}

function AppContent() {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const getBgImage = () => {
        switch (location.pathname) {
            case '/': return '/person-coffee.png';
            case '/finance': return '/person-laptop.png';
            case '/kitchen': return '/people-chatting.png';
            case '/inventory': return '/inventory-bg.png';
            case '/employees': return '/staff-bg.png';
            default: return null;
        }
    };

    const bgImage = getBgImage();

    // If not logged in, show Login Page
    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <Routes>
                    <Route path="/" element={<MenuPage />} />
                    <Route path="/kitchen" element={<KitchenPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/employees" element={<EmployeePage />} />
                    <Route path="/finance" element={<FinancePage />} />
                </Routes>
            </div>
            {bgImage && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0,
                    opacity: 0.15,
                    pointerEvents: 'none'
                }}></div>
            )}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
