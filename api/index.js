require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authEmployeeRoutes = require('./routes/authEmployeeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const contentRoutes = require('./routes/contentRoutes');
const configRoutes = require('./routes/configRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { router: seederRoutes, seedDatabase } = require('./routes/seederRoutes');
const { Employee } = require('./models');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Set up permissive CORS for local dev where Vercel doesn't proxy, but ideally Vercel proxies it
app.use(cors({
    origin: ['http://localhost:8085', 'http://localhost:5173'], // Typical vite ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers
// To handle Base64 properly, we need to increase the payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

// Root endpoint just for quick checks
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Siap Nyafe Node API is running' });
});

// Register API Routes
app.use('/api', operationsRoutes); // Move to top for priority
app.use('/api', authEmployeeRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', contentRoutes);
app.use('/api', configRoutes);
app.use('/api', uploadRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/seeder', seederRoutes);

// --- Static File Serving (Monolith) ---
// Serve static files from the React frontend/dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA Catch-all: Route all non-API requests to React's index.html
app.get(/.*/, (req, res) => {
    // Optimization: if it starts with /api, we should have caught it by now. 
    // If we are here and it's /api, it's a 404.
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coffeeshop';

// In Serverless mode, avoid keeping the connection continually open unless active
// Vercel generally handles mongoose connection pooling if done globally
let isConnected;

const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('MongoDB successfully connected.');

        // Conditional Seeding: Only seed if DB is empty
        const employeeCount = await Employee.countDocuments();
        if (employeeCount === 0) {
            console.log("Database is empty. Running initial seeder...");
            await seedDatabase();
        } else {
            console.log(`Existing data found (${employeeCount} employees). Skipping automatic seeder.`);
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Start the database connection immediately (for local testing/Vercel)
connectToDatabase();

// In a non-serverless environment, we'd start the app listening on a port
// On Vercel, exporting the app is enough, but for local testing:
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
