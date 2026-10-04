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
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
            if (storedUser) {
                try {
                    let parsedUser = JSON.parse(storedUser);
                    // Normalize: if stored as { token, user }, unwrap
                    if (parsedUser.user) {
                        if (parsedUser.token) {
                            localStorage.setItem('token', parsedUser.token);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                        }
                        parsedUser = parsedUser.user;
                        localStorage.setItem('user', JSON.stringify(parsedUser));
                    }
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Auth init failed", error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Global Axios Interceptor for 401 (Session Expired / Invalid Token)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Only logout on 401 Unauthorized (session expired / invalid token).
                // Do NOT logout on 403 Forbidden (insufficient permission for specific action).
                if (error.response && error.response.status === 401) {
                    const publicEndpoints = ['/api/auth/login', '/api/auth/check', '/api/config', '/api/menus', '/api/posts'];
                    const isPublicEndpoint = publicEndpoints.some(endpoint => error.config?.url?.includes(endpoint));

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
        const userObj = userData.user ? userData.user : userData;
        const token = userData.token || null;
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        try {
            await axios.post('/api/auth/logout');
        } catch {
            // Ignore error on logout call
        }
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
