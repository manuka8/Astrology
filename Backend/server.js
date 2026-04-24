const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const horoscopeRoutes = require('./routes/horoscopeRoutes');
const initDb = require('./utils/initDb');

dotenv.config();

const app = express();

// Initialize Database
initDb();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/horoscopes', horoscopeRoutes);

app.get('/', (req, res) => {
    res.send('Astro.lk API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
