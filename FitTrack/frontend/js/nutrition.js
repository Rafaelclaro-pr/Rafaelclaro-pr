let selectedRefeicaoId = null;

const tipoLabels = {
  pequeno_almoco: 'Pequeno-almoço',
  almoco: 'Almoço',
  jantar: 'Jantar',
  snack: 'Snack',
};

async function init() {
  checkAuth();
  initSidebar('nutrition');

  const dateInput = document.getElementById('selected-date');
  dateInput.value = todayISO();

  await loadDay();
}

async function loadDay() {
  const date = document.getElementById('selected-date').value;
  if (!date) return;

  try {
    const refeicoes = await api.getRefeicoes(date);
    renderMeals(refeicoes);
    updateTotals(refeicoes);
  } catch (err) {
    document.getElementById('meals-container').innerHTML =
      `<div class="alert alert-danger">Erro: ${err.message}</div>`;
  }
}

function renderMeals(refeicoes) {
  const container = document.getElementById('meals-container');

  if (!refeicoes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🥗</div>
        <p>Nenhuma refeição registada para este dia</p>
        <button class="btn btn-primary" onclick="showModal('modal-add-refeicao')">+ Adicionar refeição</button>
      </div>`;
    return;
  }

  container.innerHTML = refeicoes.map(r => {
    const totalCal = r.alimentos.reduce((acc, a) => acc + a.calorias, 0);
    return `
      <div class="meal-section">
        <div class="meal-header">
          <div>
            <span class="meal-type">${tipoLabels[r.tipo] || r.tipo}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="meal-cals">${totalCal.toFixed(0)} kcal</span>
            <button class="btn btn-outline btn-sm" onclick="showAddAlimentoModal(${r.id})">+ Alimento</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRefeicao(${r.id})">🗑</button>
          </div>
        </div>
        ${r.alimentos.length ? r.alimentos.map(a => `
          <div class="food-row">
            <div>
              <div style="font-weight:500;">${a.nome}</div>
              <div class="food-macros">P: ${a.proteinas_g}g &nbsp;H: ${a.hidratos_g}g &nbsp;G: ${a.gorduras_g}g</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-weight:600;color:var(--accent);">${a.calorias} kcal</span>
              <button class="btn btn-danger" style="padding:3px 7px;font-size:13px;" onclick="deleteAlimento(${a.id})">✕</button>
            </div>
          </div>
        `).join('') : `
          <div class="food-row" style="color:var(--text-secondary);font-style:italic;">
            Nenhum alimento adicionado
          </div>
        `}
      </div>
    `;
  }).join('');
}

function updateTotals(refeicoes) {
  const totals = refeicoes.reduce((acc, r) => {
    r.alimentos.forEach(a => {
      acc.cal  += a.calorias;
      acc.prot += a.proteinas_g;
      acc.hid  += a.hidratos_g;
      acc.gord += a.gorduras_g;
    });
    return acc;
  }, { cal: 0, prot: 0, hid: 0, gord: 0 });

  document.getElementById('total-cal').textContent  = totals.cal.toFixed(0);
  document.getElementById('total-prot').textContent = totals.prot.toFixed(1) + 'g';
  document.getElementById('total-hid').textContent  = totals.hid.toFixed(1) + 'g';
  document.getElementById('total-gord').textContent = totals.gord.toFixed(1) + 'g';
}

function showAddAlimentoModal(refeicaoId) {
  selectedRefeicaoId = refeicaoId;
  document.getElementById('alimento-nome').value = '';
  document.getElementById('alimento-cal').value  = '';
  document.getElementById('alimento-prot').value = '';
  document.getElementById('alimento-hid').value  = '';
  document.getElementById('alimento-gord').value = '';
  clearError('alimento-error');
  showModal('modal-add-alimento');
}

async function handleCreateRefeicao(e) {
  e.preventDefault();
  clearError('refeicao-error');
  try {
    await api.createRefeicao({
      tipo: document.getElementById('refeicao-tipo').value,
      data: document.getElementById('selected-date').value,
    });
    hideModal('modal-add-refeicao');
    await loadDay();
  } catch (err) {
    showError('refeicao-error', err.message);
  }
}

async function handleAddAlimento(e) {
  e.preventDefault();
  clearError('alimento-error');
  try {
    await api.addAlimento(selectedRefeicaoId, {
      nome:        document.getElementById('alimento-nome').value,
      calorias:    parseFloat(document.getElementById('alimento-cal').value),
      proteinas_g: parseFloat(document.getElementById('alimento-prot').value) || 0,
      hidratos_g:  parseFloat(document.getElementById('alimento-hid').value) || 0,
      gorduras_g:  parseFloat(document.getElementById('alimento-gord').value) || 0,
    });
    hideModal('modal-add-alimento');
    await loadDay();
  } catch (err) {
    showError('alimento-error', err.message);
  }
}

async function deleteRefeicao(id) {
  if (!confirm('Eliminar esta refeição e todos os alimentos?')) return;
  try {
    await api.deleteRefeicao(id);
    await loadDay();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteAlimento(id) {
  try {
    await api.deleteAlimento(id);
    await loadDay();
  } catch (err) {
    alert(err.message);
  }
}

init();
