export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  try {
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {}
}