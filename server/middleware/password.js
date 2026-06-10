const APP_PASSWORD = process.env.APP_PASSWORD;

if (!APP_PASSWORD) {
  console.warn(
    'Warning: APP_PASSWORD is not set in server/.env. Running in dev mode — all requests will be accepted without a password.'
  );
}

function passwordGate(req, res, next) {
  if (!APP_PASSWORD) {
    return next();
  }

  const provided = req.header('X-App-Password');

  if (!provided || provided !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid or missing password' });
  }

  next();
}

module.exports = passwordGate;
