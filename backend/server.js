require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalsRoutes = require('./routes/goalsRoutes');
const accountRoutes = require('./routes/accountRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'https://money-lens-app-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true,
}));

// health
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, mongoState: mongoose.connection.readyState });
});

// mount routes 
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/analytics', analysisRoutes);


const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});
app.locals.plaidClient = new PlaidApi(configuration);

const PORT = process.env.PORT || 5001;

(async () => {
  const uri = process.env.MONGO_URI; // <— make sure this exists on Render
  if (!uri) {
    console.error('❌ MONGO_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on :${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err?.message || err);
    process.exit(1);
  }
})();

module.exports = { app };
