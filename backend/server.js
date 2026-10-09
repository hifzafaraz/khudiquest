const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware hooks
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ROUTE CONNECTIVITY GATEWAY
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

// Root & Health Verification Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Khudi Quest Backend API',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Khudi Quest Backend API is running ✨',
    health: '/api/health'
  });
});

// Start listener for local development / non-serverless runtime
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
if (!isServerless && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server environment processing seamlessly on port ${PORT} ✨`);
  });
}

module.exports = app;
