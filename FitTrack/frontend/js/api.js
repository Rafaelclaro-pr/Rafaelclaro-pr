const API_BASE = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('fittrack_token');
const setToken = (t) => localStorage.setItem('fittrack_token', t);
const removeToken = () => { localStorage.removeItem('fittrack_token'); localStorage.removeItem('fittrack_user'); };

function checkAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}

function logout() {
  removeToken();
  window.location.href = 'index.html';
}

async function apiRequest(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (res.status === 401) {
    removeToken();
    window.location.href = 'index.html';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(err.detail || 'Erro na API');
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  // Auth / Users
  login:         (email, password) => apiRequest('POST', '/users/login', { email, password }),
  register:      (data) => apiRequest('POST', '/users/register', data),
  getProfile:    () => apiRequest('GET', '/users/me'),
  updateProfile: (data) => apiRequest('PUT', '/users/me', data),
  getTDEE:       () => apiRequest('GET', '/users/me/tdee'),

  // Workouts
  getWorkouts:   () => apiRequest('GET', '/workouts/'),
  createWorkout: (data) => apiRequest('POST', '/workouts/', data),
  getWorkout:    (id) => apiRequest('GET', `/workouts/${id}`),
  deleteWorkout: (id) => apiRequest('DELETE', `/workouts/${id}`),

  addExercicio:    (workoutId, data) => apiRequest('POST', `/workouts/${workoutId}/exercicios`, data),
  deleteExercicio: (id) => apiRequest('DELETE', `/workouts/exercicios/${id}`),

  addSerie:    (exercicioId, data) => apiRequest('POST', `/workouts/exercicios/${exercicioId}/series`, data),
  deleteSerie: (id) => apiRequest('DELETE', `/workouts/series/${id}`),

  // Nutrition
  getRefeicoes:    (date) => apiRequest('GET', `/nutrition/?data=${date}`),
  createRefeicao:  (data) => apiRequest('POST', '/nutrition/refeicoes', data),
  deleteRefeicao:  (id) => apiRequest('DELETE', `/nutrition/refeicoes/${id}`),
  addAlimento:     (refeicaoId, data) => apiRequest('POST', `/nutrition/refeicoes/${refeicaoId}/alimentos`, data),
  deleteAlimento:  (id) => apiRequest('DELETE', `/nutrition/alimentos/${id}`),
  getTodaySummary: () => apiRequest('GET', '/nutrition/summary/today'),
};

// ─── Shared Sidebar Helpers ───

function setSidebarActive(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

async function loadSidebarUser() {
  try {
    const cached = localStorage.getItem('fittrack_user');
    if (cached) {
      renderSidebarUser(JSON.parse(cached));
    }
    const user = await api.getProfile();
    localStorage.setItem('fittrack_user', JSON.stringify(user));
    renderSidebarUser(user);
  } catch (_) {}
}

function renderSidebarUser(user) {
  const el = document.getElementById('sidebar-user');
  if (el) el.innerHTML = `<strong>${user.nome}</strong>${user.email}`;
}

function initSidebar(activePage) {
  setSidebarActive(activePage);
  loadSidebarUser();

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

// ─── Utility ───

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function showModal(id) {
  document.getElementById(id).classList.add('open');
}

function hideModal(id) {
  document.getElementById(id).classList.remove('open');
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) el.textContent = msg;
}

function clearError(elId) {
  const el = document.getElementById(elId);
  if (el) el.textContent = '';
}
