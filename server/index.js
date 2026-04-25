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

connectDB();

const app = express();

// CORS — allow client origin with credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/log', logRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/circle', circleRoutes);
app.use('/api/viewer', viewerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messageRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌸 FlowBuddy server running on port ${PORT}`);
});
