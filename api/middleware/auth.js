const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_12345';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id, username, email, role, employeeId
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user && req.user.role ? req.user.role.toUpperCase() : '';
        const allowedRoles = roles.map(r => r.toUpperCase());
        
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
        next();
    };
};

module.exports = { authMiddleware, requireRole, JWT_SECRET };
