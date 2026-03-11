// Load .env locally only — Railway injects env vars at runtime
try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const path = require('path');
const oddsRoutes = require('./src/api/odds');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (index.html, dashboard.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', oddsRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
