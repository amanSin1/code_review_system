const API_BASE = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

function saveToken(token) {
  localStorage.setItem('token', token)
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  try {
    window.dispatchEvent(new Event('auth-changed'))
  } catch (e) {}
}

async function request(path, opts = {}) {
  const headers = opts.headers || {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(API_BASE + path, { ...opts, headers })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText || 'Request failed'
    if (res.status === 401) {
      logout()
    }
    throw new Error(message)
  }
  return data
}

export async function login(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  if (res.access_token) {
    saveToken(res.access_token)
    if (res.user) saveUser(res.user)
    try {
      window.dispatchEvent(new Event('auth-changed'))
    } catch (e) {}
  }
  return res
}

export async function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function fetchSubmissions() {
  return request('/api/submissions')
}

export async function fetchNotifications() {
  return request('/api/notifications')
}

export async function fetchSubmission(id) {
  return request(`/api/submissions/${id}`)
}

export async function createSubmission(payload) {
  return request('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function createReview(payload) {
  return request('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
export async function updateSubmission(id, payload) {
  return request(`/api/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export async function deleteSubmission(id) {
  return request(`/api/submissions/${id}`, {
    method: 'DELETE'
  })
}