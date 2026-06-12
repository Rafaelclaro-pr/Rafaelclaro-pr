let selectedWorkoutId = null;
let selectedExercicioId = null;

async function init() {
  checkAuth();
  initSidebar('workout');
  document.getElementById('new-workout-date').value = todayISO();
  await loadWorkouts();
}

async function loadWorkouts() {
  const container = document.getElementById('workout-list');
  try {
    const workouts = await api.getWorkouts();
    if (!workouts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏋️</div>
          <p>Ainda não tens treinos registados</p>
          <button class="btn btn-primary" onclick="showModal('modal-new-workout')">+ Criar primeiro treino</button>
        </div>`;
      return;
    }

    container.innerHTML = workouts.map(w => `
      <div class="workout-card ${w.id === selectedWorkoutId ? 'selected' : ''}"
           onclick="selectWorkout(${w.id})">
        <div>
          <div class="workout-date">${formatDate(w.data)}</div>
          ${w.notas ? `<div class="workout-note">${w.notas}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="workout-badge">${w.exercicios.length} exerc.</span>
          <button class="btn btn-danger btn-sm" onclick="deleteWorkout(event, ${w.id})">🗑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Erro ao carregar treinos: ${err.message}</div>`;
  }
}

async function selectWorkout(id) {
  selectedWorkoutId = id;
  document.getElementById('workout-detail').classList.remove('hidden');

  await loadWorkouts();

  try {
    const w = await api.getWorkout(id);
    renderWorkoutDetail(w);
  } catch (err) {
    document.getElementById('workout-detail-content').innerHTML =
      `<div class="alert alert-danger">${err.message}</div>`;
  }
}

function renderWorkoutDetail(w) {
  const content = document.getElementById('workout-detail-content');

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">
      <div>
        <h2 style="font-size:18px;font-weight:700;">${formatDate(w.data)}</h2>
        ${w.notas ? `<p style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${w.notas}</p>` : ''}
      </div>
      <button class="btn btn-primary btn-sm" onclick="showAddExercicioModal(${w.id})">+ Exercício</button>
    </div>

    ${!w.exercicios.length ? `
      <div class="empty-state" style="padding:30px 0;">
        <div class="empty-icon">💪</div>
        <p>Adiciona o primeiro exercício</p>
      </div>
    ` : w.exercicios.map(e => `
      <div class="exercise-block">
        <div class="exercise-header">
          <div>
            <div class="exercise-name">${e.nome}</div>
            ${e.musculo_trabalhado ? `<div class="exercise-muscle">${e.musculo_trabalhado}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="showAddSerieModal(${e.id})">+ Série</button>
            <button class="btn btn-danger btn-sm" onclick="deleteExercicio(${e.id})">🗑</button>
          </div>
        </div>
        ${e.series.length ? `
          <div>
            ${e.series.map((s, i) => `
              <div class="set-row">
                <span class="set-badge">S${i + 1}</span>
                <span style="flex:1;">${s.repeticoes} rep${s.repeticoes !== 1 ? 's' : ''}</span>
                ${s.peso_kg ? `<span style="color:var(--accent);font-weight:600;">${s.peso_kg}kg</span>` : '<span style="color:var(--text-secondary);">Peso livre</span>'}
                <button class="btn btn-danger" style="padding:2px 6px;font-size:12px;" onclick="deleteSerie(${s.id})">✕</button>
              </div>
            `).join('')}
          </div>
        ` : `<p style="font-size:13px;color:var(--text-secondary);">Nenhuma série adicionada.</p>`}
      </div>
    `).join('')}
  `;
}

function showAddExercicioModal(workoutId) {
  selectedWorkoutId = workoutId;
  document.getElementById('ex-nome').value = '';
  document.getElementById('ex-musculo').value = '';
  clearError('exercise-error');
  showModal('modal-add-exercise');
}

function showAddSerieModal(exercicioId) {
  selectedExercicioId = exercicioId;
  document.getElementById('serie-reps').value = '';
  document.getElementById('serie-peso').value = '';
  clearError('serie-error');
  showModal('modal-add-serie');
}

async function handleCreateWorkout(e) {
  e.preventDefault();
  clearError('workout-create-error');
  try {
    await api.createWorkout({
      data: document.getElementById('new-workout-date').value || null,
      notas: document.getElementById('new-workout-notas').value || null,
    });
    hideModal('modal-new-workout');
    await loadWorkouts();
  } catch (err) {
    showError('workout-create-error', err.message);
  }
}

async function handleAddExercicio(e) {
  e.preventDefault();
  clearError('exercise-error');
  try {
    await api.addExercicio(selectedWorkoutId, {
      nome: document.getElementById('ex-nome').value,
      musculo_trabalhado: document.getElementById('ex-musculo').value || null,
    });
    hideModal('modal-add-exercise');
    await selectWorkout(selectedWorkoutId);
  } catch (err) {
    showError('exercise-error', err.message);
  }
}

async function handleAddSerie(e) {
  e.preventDefault();
  clearError('serie-error');
  try {
    await api.addSerie(selectedExercicioId, {
      repeticoes: parseInt(document.getElementById('serie-reps').value),
      peso_kg: parseFloat(document.getElementById('serie-peso').value) || null,
    });
    hideModal('modal-add-serie');
    await selectWorkout(selectedWorkoutId);
  } catch (err) {
    showError('serie-error', err.message);
  }
}

async function deleteWorkout(e, id) {
  e.stopPropagation();
  if (!confirm('Eliminar este treino?')) return;
  try {
    await api.deleteWorkout(id);
    if (selectedWorkoutId === id) {
      selectedWorkoutId = null;
      document.getElementById('workout-detail').classList.add('hidden');
    }
    await loadWorkouts();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteExercicio(id) {
  if (!confirm('Eliminar este exercício?')) return;
  try {
    await api.deleteExercicio(id);
    await selectWorkout(selectedWorkoutId);
  } catch (err) {
    alert(err.message);
  }
}

async function deleteSerie(id) {
  try {
    await api.deleteSerie(id);
    await selectWorkout(selectedWorkoutId);
  } catch (err) {
    alert(err.message);
  }
}

init();
