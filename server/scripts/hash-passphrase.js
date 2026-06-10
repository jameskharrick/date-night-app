#!/usr/bin/env node

const crypto = require('crypto');

const passphrase = process.argv[2];

if (!passphrase) {
  console.error('Usage: node scripts/hash-passphrase.js <passphrase>');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(passphrase, 'utf8').digest('hex');

console.log(hash);
