const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config({ path: '../.env' });

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb+srv://jashangill3592:4GQyPIRwT6lm5IiE@cluster0.p23io.mongodb.net/Money-Lens-MongoDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
