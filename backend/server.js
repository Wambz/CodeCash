import 'dotenv/config'; // Load environment variables first
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mpesaRoutes from './routes/mpesa.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.MPESA_ENV || 'sandbox'
    });
});

// M-Pesa routes
// Routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                                                       ║');
    console.log('║            CODECASH Backend Server                    ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.MPESA_ENV || 'sandbox'}`);
    console.log(`📱 M-Pesa configured: ${process.env.MPESA_CONSUMER_KEY ? 'Yes' : 'No'}`);
    console.log('');
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  POST   /api/mpesa/deposit          - Initiate STK Push`);
    console.log(`  POST   /api/mpesa/withdraw         - Initiate B2C transfer`);
    console.log(`  GET    /api/mpesa/status/:id       - Check transaction status`);
    console.log(`  POST   /api/mpesa/callback/deposit - STK Push callback`);
    console.log(`  POST   /api/mpesa/callback/withdraw - B2C callback`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
});

export default app;
