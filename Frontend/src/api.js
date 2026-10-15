const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
  } catch {
    throw new Error('Cannot reach the API. Check that the backend is running and connected to MongoDB Atlas.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'The request could not be completed.');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getCourses: () => request('/courses'),
  getFeedback: () => request('/feedback'),
  createFeedback: (data) => request('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  updateFeedback: (id, data) => request(`/feedback/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFeedback: (id) => request(`/feedback/${id}`, { method: 'DELETE' })
};