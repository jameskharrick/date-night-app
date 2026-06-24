require('dotenv').config();

const express = require('express');
const cors = require('cors');

const passwordGate = require('./middleware/password');
const genresRouter = require('./routes/genres');
const recommendationsRouter = require('./routes/recommendations');
const searchRouter = require('./routes/search');
const seenRouter = require('./routes/seen');
const watchlistRouter = require('./routes/watchlist');
const tripsRouter = require('./routes/trips');
const tripLinksRouter = require('./routes/trip-links');
const tripMediaRouter = require('./routes/trip-media');
const activitiesRouter = require('./routes/activities');
const activityMediaRouter = require('./routes/activity-media');
const gamesRouter = require('./routes/games');
const playedRouter = require('./routes/played');
const gameGenresRouter = require('./routes/game-genres');
const gameRecommendationsRouter = require('./routes/game-recommendations');
const gameSearchRouter = require('./routes/game-search');

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

app.get('/api/auth/check', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/genres', genresRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/search', searchRouter);
app.use('/api/seen', seenRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/trip-links', tripLinksRouter);
app.use('/api/trip-media', tripMediaRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/activity-media', activityMediaRouter);
app.use('/api/games', gamesRouter);
app.use('/api/played', playedRouter);
app.use('/api/game-genres', gameGenresRouter);
app.use('/api/game-recommendations', gameRecommendationsRouter);
app.use('/api/game-search', gameSearchRouter);

app.listen(PORT, () => {
  console.log(`Date Night server listening on port ${PORT}`);
});
