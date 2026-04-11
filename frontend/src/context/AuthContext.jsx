import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check and Axios setup
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // Optional: Verify token/session validity with backend
                    // await axios.get('/api/auth/check'); 
                } catch (error) {
                    console.error("Auth init failed", error);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Global Axios Interceptor for 401/403 (Session Expired / Account Disabled)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Ignore specific endpoints that don't require auth
                    const publicEndpoints = ['/api/auth/check', '/api/config', '/api/menus', '/api/posts'];
                    const isPublicEndpoint = publicEndpoints.some(endpoint => error.config.url.includes(endpoint));

                    if (!isPublicEndpoint) {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Optional: Call backend logout
        // axios.post('/api/auth/logout').catch(() => {});
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
