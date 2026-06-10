require('dotenv').config();

const express = require('express');
const cors = require('cors');

const passwordGate = require('./middleware/password');
const genresRouter = require('./routes/genres');
const recommendationsRouter = require('./routes/recommendations');
const watchlistRouter = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // non-browser requests (e.g. curl, healthchecks)
    if (origin === 'http://localhost:5173') return callback(null, true);
    if (origin.startsWith('https://')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check (no password required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', passwordGate);

app.use('/api/genres', genresRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/watchlist', watchlistRouter);

app.listen(PORT, () => {
  console.log(`Date Night server listening on port ${PORT}`);
});
