export const PASSPHRASE_STORAGE_KEY = 'dna_passphrase_hash';

export async function hashPassphrase(passphrase) {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredPassphraseHash() {
  return localStorage.getItem(PASSPHRASE_STORAGE_KEY);
}

export function storePassphraseHash(hash) {
  localStorage.setItem(PASSPHRASE_STORAGE_KEY, hash);
}
