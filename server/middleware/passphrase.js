const PASSPHRASE_HASH = process.env.PASSPHRASE_HASH;

if (!PASSPHRASE_HASH) {
  console.warn(
    'Warning: PASSPHRASE_HASH is not set in server/.env. Running in dev mode — all requests will be accepted without a passphrase.'
  );
}

function passphraseGate(req, res, next) {
  if (!PASSPHRASE_HASH) {
    return next();
  }

  const provided = req.header('X-Passphrase-Hash');

  if (!provided || provided !== PASSPHRASE_HASH) {
    return res.status(401).json({ error: 'Invalid or missing passphrase' });
  }

  next();
}

module.exports = passphraseGate;
