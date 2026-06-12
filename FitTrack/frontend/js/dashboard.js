let macroChart = null;

async function init() {
  checkAuth();
  initSidebar('dashboard');

  document.getElementById('today-date').textContent = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  await Promise.all([loadSummary(), loadLastWorkout()]);
}

async function loadSummary() {
  try {
    const s = await api.getTodaySummary();

    // Stats
    document.getElementById('stat-meta').textContent = s.meta_calorica;
    document.getElementById('stat-consumidas').textContent = s.total_calorias.toFixed(0);

    const balEl = document.getElementById('stat-balanco');
    balEl.textContent = Math.abs(s.balanco).toFixed(0);
    if (s.balanco < 0) {
      balEl.className = 'stat-value accent';
      document.getElementById('stat-balanco-label').textContent = 'kcal de défice';
    } else if (s.balanco > 0) {
      balEl.className = 'stat-value danger';
      document.getElementById('stat-balanco-label').textContent = 'kcal de excedente';
    } else {
      balEl.className = 'stat-value';
      document.getElementById('stat-balanco-label').textContent = 'kcal equilibrado';
    }

    const proj = s.projecao_semanal_kg;
    const projEl = document.getElementById('stat-projecao');
    projEl.textContent = (proj >= 0 ? '+' : '') + proj.toFixed(2);
    projEl.className = proj < 0 ? 'stat-value accent' : proj > 0 ? 'stat-value warning' : 'stat-value';

    // Message
    const msgBox = document.getElementById('message-box');
    msgBox.textContent = s.mensagem;
    msgBox.classList.remove('hidden', 'alert-success', 'alert-info', 'alert-danger');
    if (s.balanco <= 0) msgBox.classList.add('alert-success');
    else if (s.balanco <= 200) msgBox.classList.add('alert-info');
    else msgBox.classList.add('alert-danger');

    // Progress bar
    const pct = Math.min((s.total_calorias / s.meta_calorica) * 100, 100);
    const bar = document.getElementById('cal-progress');
    bar.style.width = pct + '%';
    bar.classList.toggle('over', s.total_calorias > s.meta_calorica);
    document.getElementById('progress-label').textContent =
      `${s.total_calorias.toFixed(0)} / ${s.meta_calorica} kcal`;

    // Macros
    document.getElementById('macro-prot').textContent = s.total_proteinas.toFixed(0) + 'g';
    document.getElementById('macro-hid').textContent  = s.total_hidratos.toFixed(0) + 'g';
    document.getElementById('macro-gord').textContent = s.total_gorduras.toFixed(0) + 'g';

    renderMacroChart(s.total_proteinas, s.total_hidratos, s.total_gorduras);
  } catch (err) {
    console.error('Erro ao carregar summary:', err);
  }
}

function renderMacroChart(prot, hid, gord) {
  const ctx = document.getElementById('macro-chart').getContext('2d');
  const total = prot + hid + gord;

  if (macroChart) macroChart.destroy();

  if (total === 0) {
    macroChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sem dados'],
        datasets: [{ data: [1], backgroundColor: ['#334155'], borderWidth: 0 }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
    return;
  }

  macroChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Proteínas', 'Hidratos', 'Gorduras'],
      datasets: [{
        data: [prot * 4, hid * 4, gord * 9],
        backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(0)} kcal`
          }
        }
      }
    }
  });
}

async function loadLastWorkout() {
  try {
    const workouts = await api.getWorkouts();
    const container = document.getElementById('last-workout-content');

    if (!workouts.length) return;

    const w = workouts[0];
    const exercicioCount = w.exercicios.length;
    const serieCount = w.exercicios.reduce((acc, e) => acc + e.series.length, 0);

    container.innerHTML = `
      <div style="margin-bottom:12px;">
        <div style="font-size:16px;font-weight:600;">${formatDate(w.data)}</div>
        ${w.notas ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${w.notas}</div>` : ''}
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div class="macro-item" style="flex:1;">
          <div class="macro-val" style="color:var(--accent);">${exercicioCount}</div>
          <div class="macro-name">Exercícios</div>
        </div>
        <div class="macro-item" style="flex:1;">
          <div class="macro-val" style="color:var(--info);">${serieCount}</div>
          <div class="macro-name">Séries</div>
        </div>
      </div>
      ${w.exercicios.slice(0, 3).map(e => `
        <div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
          <span>${e.nome}</span>
          <span style="color:var(--text-secondary);">${e.series.length} séries</span>
        </div>
      `).join('')}
      ${w.exercicios.length > 3 ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:8px;">+${w.exercicios.length - 3} exercícios</div>` : ''}
      <a href="workout.html" class="btn btn-outline btn-sm" style="margin-top:14px;width:100%;justify-content:center;">Ver todos os treinos</a>
    `;
  } catch (err) {
    console.error('Erro ao carregar treinos:', err);
  }
}

init();
