require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/auth');
const cycleRoutes = require('./routes/cycle');
const logRoutes = require('./routes/log');
const insightsRoutes = require('./routes/insights');
const circleRoutes = require('./routes/circle');
const viewerRoutes = require('./routes/viewer');
const settingsRoutes = require('./routes/settings');
const messageRoutes = require('./routes/messages');

// Connect DB
connectDB();

const app = express();

// 🔐 CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://flowbuddy-3.onrender.com',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// 🧪 Health check (for testing deployment)
app.get('/api/health', (req, res) => {
  res.send('FlowBuddy API is running 🚀');
});

// 🔗 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/log', logRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/circle', circleRoutes);
app.use('/api/viewer', viewerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messageRoutes);

if (process.env.NODE_ENV === 'production') {
  const root = path.resolve();
  const clientDist = path.join(root, 'client', 'dist');

  // Serve static files FIRST
  app.use(express.static(clientDist));

  // Only fallback for frontend routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ❌ Error handler
app.use(errorHandler);

// 🚀 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌸 FlowBuddy server running on port ${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV}`);
});