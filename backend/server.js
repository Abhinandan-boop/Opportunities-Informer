const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

require("./db/connection");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');

const app = express();

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only when using HTTPS
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// ---------------------------
// Serve Frontend
// ---------------------------
// The frontend now has separate landing and dashboard pages under /frontend.
app.use(express.static(path.join(__dirname, '../frontend')));

// ---------------------------
// API Routes
// ---------------------------
app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// ---------------------------
// Health Check
// ---------------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running!'
  });
});

// ---------------------------
// Serve Frontend for all pages
// ---------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📧 Frontend served by Express');
  console.log('🔑 Gmail OAuth Ready');
  console.log('=========================================');
});
