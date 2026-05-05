const DEFAULT_API_BASE = import.meta.env.PROD ? '/_/backend/api' : '/api';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function getWeather(params) {
  if (!params) return request('/weather');
  if (typeof params === 'string') {
    const suffix = params ? `?location=${encodeURIComponent(params)}` : '';
    return request(`/weather${suffix}`);
  }

  const query = new URLSearchParams();
  if (params.location) query.set('location', params.location);

  const hintKeys = ['adm4Hint', 'village', 'district', 'city', 'regency', 'province'];
  hintKeys.forEach((key) => {
    if (params[key]) query.set(key, params[key]);
  });

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/weather${suffix}`);
}

export function getStats() {
  return request('/stats');
}

export function sendChat(message, location, locationHints = [], history = []) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, location, locationHints, history }),
  });
}

export function submitContribution(payload) {
  return request('/contribute', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
