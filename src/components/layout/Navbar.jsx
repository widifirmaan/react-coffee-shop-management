import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ user, onLogout, shopConfig }) {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Hide navbar if on customer order page, login page, or public CMS
    if (location.pathname === '/order' || location.pathname === '/login' || location.pathname === '/') return null;

    const userRole = (user?.role || user?.position || '').toUpperCase();
    const isManager = userRole === 'MANAGER';
    const isCashier = isManager || userRole === 'CASHIER';
    const isBarista = isManager || userRole === 'BARISTA';
    const isKitchen = isManager || userRole === 'KITCHEN' || userRole === 'KITCHEN STAFF';
    const isWaiter = isManager || userRole === 'WAITER';

    return (
        <nav className="navbar">
            <div className="navbar-brand">{shopConfig?.shopName || 'SIAP NYAFE'}</div>

            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                {/* Everyone has access to Dashboard */}
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    DASHBOARD
                </Link>

                {/* Cashier / Manager: Cashier POS */}
                {isCashier && (
                    <Link to="/cashier" className={`nav-link ${location.pathname === '/cashier' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ background: '#4ade80', color: 'black', fontWeight: '900' }}>
                        CASHIER POS
                    </Link>
                )}

                {/* Barista / Kitchen / Manager: Kitchen Queue */}
                {(isBarista || isKitchen) && (
                    <Link to="/kitchen" className={`nav-link ${location.pathname === '/kitchen' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        KITCHEN
                    </Link>
                )}

                {/* Barista / Kitchen / Manager: Raw Materials & Stock */}
                {(isBarista || isKitchen) && (
                    <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        INVENTORY
                    </Link>
                )}

                {/* Waiter / Manager: Waiter Calls */}
                {isWaiter && (
                    <Link to="/waiter" className={`nav-link ${location.pathname === '/waiter' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        WAITER
                    </Link>
                )}

                {/* Cashier / Waiter / Manager: Customer Feedback */}
                {(isCashier || isWaiter) && (
                    <Link to="/feedback" className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        FEEDBACK
                    </Link>
                )}

                {/* Product Catalog Menu (Common reference for all staff) */}
                <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    MENU
                </Link>
                
                {/* Manager Only Exclusive Links */}
                {isManager && (
                    <>
                        <Link to="/assets" className={`nav-link ${location.pathname === '/assets' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>ASSETS</Link>
                        <Link to="/employees" className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>STAFF</Link>
                        <Link to="/shifts" className={`nav-link ${location.pathname === '/shifts' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>SHIFTS</Link>
                        <Link to="/finance" className={`nav-link ${location.pathname === '/finance' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>FINANCE</Link>
                        <Link to="/posts" className={`nav-link ${location.pathname === '/posts' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>BLOG</Link>
                        <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>SETTINGS</Link>
                    </>
                )}

                <button type="button" onClick={onLogout} className="danger" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: isMenuOpen ? '10px' : '0' }}>
                    LOGOUT
                </button>
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Hanging User Greeting with Role Badge */}
            {user && (
                <div className="navbar-greeting" style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'black',
                    color: 'white',
                    fontWeight: '900',
                    clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                    textTransform: 'uppercase',
                    zIndex: -1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>Hi, {user.name || user.email || user.employeeId}! 👋</span>
                    <span style={{
                        background: '#facc15',
                        color: 'black',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        border: '1px solid black',
                        fontWeight: '900'
                    }}>
                        {(user.role || user.position || 'STAFF').toUpperCase()}
                    </span>
                </div>
            )}
        </nav>
    );
}
