const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./config/db');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const residentAuthRoutes = require('./routes/residentAuthRoutes');
const requestRoutes = require('./routes/requestRoutes');
const residentRoutes = require('./routes/residentRoutes');
const accountRoutes = require('./routes/accountRoutes');
const logsRoutes = require('./routes/logsRoutes');
const walkInRoutes = require('./routes/walkInRoutes');

const app = express();
const parsedPort = Number(process.env.PORT);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/resident-auth', residentAuthRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/walkins', walkInRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      ok: true,
      message: 'Server and database are connected',
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'CertiFast server is running' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
