const API_BASE = 'http://localhost:8000';

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = localStorage.getItem('token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText || 'Request failed';
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-changed'));
    }
    throw new Error(message);
  }
  return data;
}

export async function loginAPI(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.access_token) {
    localStorage.setItem('token', res.access_token);
    if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
    window.dispatchEvent(new Event('auth-changed'));
  }
  return res;
}

export async function registerAPI(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchSubmissionsAPI() {
  return request('/api/submissions');
}

export async function fetchNotificationsAPI() {
  return request('/api/notifications');
}

export async function fetchSubmissionAPI(id) {
  return request(`/api/submissions/${id}`);
}

export async function createSubmissionAPI(payload) {
  return request('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createReviewAPI(payload) {
  return request('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateSubmissionAPI(id, payload) {
  return request(`/api/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteSubmissionAPI(id) {
  return request(`/api/submissions/${id}`, {
    method: 'DELETE'
  });
}