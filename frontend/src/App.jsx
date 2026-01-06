import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import InventoryPage from './pages/InventoryPage';
import EmployeePage from './pages/EmployeePage';
import FinancePage from './pages/FinancePage';
import LoginPage from './pages/LoginPage';
import OrderPage from './pages/OrderPage';
import CMSPage from './pages/CMSPage';

function Navbar({ user, onLogout }) {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Hide navbar if on customer order page, login page, or public CMS
    if (location.pathname === '/order' || location.pathname === '/login' || location.pathname === '/') return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand">SIAP NYAFE</div>

            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>MENU / POS</Link>
                <Link to="/kitchen" className={`nav-link ${location.pathname === '/kitchen' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>KITCHEN</Link>
                <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>INVENTORY</Link>
                <Link to="/employees" className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>STAFF</Link>
                <Link to="/finance" className={`nav-link ${location.pathname === '/finance' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>FINANCE</Link>

                <button onClick={onLogout} className="danger" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: isMenuOpen ? '10px' : '0' }}>
                    LOGOUT
                </button>
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Hanging User Greeting */}
            {user && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'black',
                    color: 'white',
                    padding: '5px 40px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                    textTransform: 'uppercase',
                    zIndex: -1
                }}>
                    Hi, {user.name || user.username}! 👋
                </div>
            )}
        </nav>
    );
}

function AppContent() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsAuthenticating(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (isAuthenticating) return null;

    // Public Routes
    if (location.pathname === '/order') {
        return <OrderPage />;
    }
    if (location.pathname === '/') {
        return <CMSPage />;
    }
    if (location.pathname === '/login') {
        return user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />;
    }

    // Protected Routes Check
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const getBgImage = () => {
        switch (location.pathname) {
            case '/dashboard': return '/person-coffee.png';
            case '/finance': return '/person-laptop.png';
            case '/kitchen': return '/people-chatting.png';
            case '/inventory': return '/inventory-bg.png';
            case '/employees': return '/staff-bg.png';
            default: return null;
        }
    };

    const bgImage = getBgImage();

    return (
        <div className="app">
            <Navbar user={user} onLogout={handleLogout} />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <Routes>
                    <Route path="/dashboard" element={<MenuPage user={user} />} />
                    <Route path="/kitchen" element={<KitchenPage user={user} />} />
                    <Route path="/inventory" element={<InventoryPage user={user} />} />
                    <Route path="/employees" element={<EmployeePage user={user} />} />
                    <Route path="/finance" element={<FinancePage user={user} />} />
                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
