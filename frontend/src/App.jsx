import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';

// Backend Config
if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}
// Ensure session cookies are sent/received
axios.defaults.withCredentials = true;
import Navbar from './components/layout/Navbar';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import InventoryPage from './pages/InventoryPage';
import EmployeePage from './pages/EmployeePage';
import FinancePage from './pages/FinancePage';
import LoginPage from './pages/LoginPage';
import OrderPage from './pages/OrderPage';
import CMSPage from './pages/CMSPage';
import SettingsPage from './pages/SettingsPage';
import PostManagementPage from './pages/PostManagementPage';
import WaiterPage from './pages/WaiterPage';
import FeedbackPage from './pages/FeedbackPage';
import ShiftPage from './pages/ShiftPage';

function AppContent() {
    const location = useLocation();
    const { user, login, logout, loading } = useAuth(); // Use Context
    const [shopConfig, setShopConfig] = useState(null);

    useEffect(() => {
        // Fetch Shop Config
        axios.get('/api/config').then(res => {
            if (res.data) {
                setShopConfig(res.data);
                if (res.data.websiteTitle) document.title = res.data.websiteTitle;
                if (res.data.faviconUrl) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                    link.href = res.data.faviconUrl;
                }
            }
        }).catch(e => console.error("Config load error", e));
    }, []);

    if (loading) return <div className="loading-screen">LOADING...</div>;



    // Public Routes
    if (location.pathname === '/order') {
        return <OrderPage shopConfig={shopConfig} />;
    }
    if (location.pathname === '/') {
        return <CMSPage />;
    }
    if (location.pathname === '/login') {
        return user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />;
    }

    // Protected Routes Check
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const getBgImage = () => {
        switch (location.pathname) {
            case '/dashboard': return '/dashboard-pattern.png';
            case '/menu': return '/person-coffee.png';
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
            <Navbar user={user} onLogout={logout} shopConfig={shopConfig} />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage user={user} />} />
                    <Route path="/menu" element={<MenuPage user={user} />} />
                    <Route path="/kitchen" element={<KitchenPage user={user} />} />
                    <Route path="/inventory" element={<InventoryPage user={user} />} />
                    <Route path="/employees" element={<EmployeePage user={user} />} />
                    <Route path="/finance" element={<FinancePage user={user} />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/posts" element={<PostManagementPage user={user} />} />
                    <Route path="/waiter" element={<WaiterPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/shifts" element={<ShiftPage />} />
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
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
