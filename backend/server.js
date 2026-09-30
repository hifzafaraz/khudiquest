const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware hooks
app.use(express.json());
app.use(cors());

// ROUTE CONNECTIVITY GATEWAY
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Paste these exact line configurations right under your auth routes mounting hook:
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

// Simple core verification route
app.get('/api/health', (req, res) => {
  res.json({ status: 'operational', database: 'embedded_datastore_active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server environment processing seamlessly on port ${PORT} ✨`);
});
