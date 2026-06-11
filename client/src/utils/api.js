import { getStoredPassword } from './password';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const password = getStoredPassword();
  if (password) headers['X-App-Password'] = password;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function requestForm(path, formData) {
  const headers = {};

  const password = getStoredPassword();
  if (password) headers['X-App-Password'] = password;

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function checkPassword(password) {
  const res = await fetch(`${API_URL}/api/auth/check`, {
    headers: { 'X-App-Password': password },
  });
  return res.ok;
}

export const api = {
  getGenres: () => request('/api/genres'),

  getRecommendations: (params) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    );
    return request(`/api/recommendations?${query.toString()}`);
  },

  search: (params) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    );
    return request(`/api/search?${query.toString()}`);
  },

  getSeenStatus: () => request('/api/seen'),

  toggleSeen: (tmdb_id, type, person) =>
    request('/api/seen/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id, type, person }),
    }),

  getWatchlist: () => request('/api/watchlist'),

  addToWatchlist: (item) =>
    request('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateWatchlistItem: (id, updates) =>
    request(`/api/watchlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  removeFromWatchlist: (id) =>
    request(`/api/watchlist/${id}`, {
      method: 'DELETE',
    }),

  getTrips: () => request('/api/trips'),

  addTrip: (trip) =>
    request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
    }),

  updateTrip: (id, updates) =>
    request(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  removeTrip: (id) =>
    request(`/api/trips/${id}`, {
      method: 'DELETE',
    }),

  addTripLink: (tripId, link) =>
    request(`/api/trips/${tripId}/links`, {
      method: 'POST',
      body: JSON.stringify(link),
    }),

  updateTripLink: (linkId, updates) =>
    request(`/api/trip-links/${linkId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  removeTripLink: (linkId) =>
    request(`/api/trip-links/${linkId}`, {
      method: 'DELETE',
    }),

  addTripMedia: (tripId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return requestForm(`/api/trips/${tripId}/media`, formData);
  },

  removeTripMedia: (mediaId) =>
    request(`/api/trip-media/${mediaId}`, {
      method: 'DELETE',
    }),
};

export { API_URL };
