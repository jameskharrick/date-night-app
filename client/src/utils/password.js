export const PASSWORD_STORAGE_KEY = 'dna_app_password';

export function getStoredPassword() {
  return localStorage.getItem(PASSWORD_STORAGE_KEY);
}

export function storePassword(password) {
  localStorage.setItem(PASSWORD_STORAGE_KEY, password);
}
