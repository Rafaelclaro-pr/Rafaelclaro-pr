async function init() {
  checkAuth();
  initSidebar('profile');
  await loadProfile();
}

async function loadProfile() {
  try {
    const user = await api.getProfile();
    fillForm(user);
    await loadTDEE();
  } catch (err) {
    showError('profile-msg', 'Erro ao carregar perfil: ' + err.message);
  }
}

function fillForm(user) {
  document.getElementById('p-nome').value     = user.nome || '';
  document.getElementById('p-email').value    = user.email || '';
  document.getElementById('p-peso').value     = user.peso_kg || '';
  document.getElementById('p-altura').value   = user.altura_cm || '';
  document.getElementById('p-idade').value    = user.idade || '';
  document.getElementById('p-sexo').value     = user.sexo || 'M';
  document.getElementById('p-atividade').value = user.nivel_atividade || 'moderado';
  document.getElementById('p-objetivo').value  = user.objetivo || 'manter';
}

async function loadTDEE() {
  const container = document.getElementById('tdee-content');
  try {
    const t = await api.getTDEE();

    const projecaoAbs = Math.abs(t.projecao_semanal_kg);
    const projecaoDir = t.projecao_semanal_kg < 0 ? 'perdes' : t.projecao_semanal_kg > 0 ? 'ganhas' : 'mantens';

    container.innerHTML = `
      <div class="tdee-grid">
        <div class="tdee-item">
          <div class="tdee-val">${t.tmb.toFixed(0)}</div>
          <div class="tdee-label">TMB (kcal)</div>
        </div>
        <div class="tdee-item">
          <div class="tdee-val">${t.tdee.toFixed(0)}</div>
          <div class="tdee-label">TDEE (kcal)</div>
        </div>
        <div class="tdee-item">
          <div class="tdee-val">${t.objetivo_calorico}</div>
          <div class="tdee-label">Meta Diária</div>
        </div>
      </div>
      <div class="alert alert-success" style="margin-top:16px;">
        Com este plano, ${projecaoDir} ~<strong>${projecaoAbs.toFixed(2)} kg</strong> por semana.
      </div>
    `;
  } catch (_) {
    container.innerHTML = `
      <div class="alert alert-info">
        Preenche peso, altura, idade e sexo para calcular o teu TDEE.
      </div>`;
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'A guardar...';
  clearError('profile-msg');

  const payload = {
    nome:             document.getElementById('p-nome').value,
    peso_kg:          parseFloat(document.getElementById('p-peso').value) || null,
    altura_cm:        parseFloat(document.getElementById('p-altura').value) || null,
    idade:            parseInt(document.getElementById('p-idade').value) || null,
    sexo:             document.getElementById('p-sexo').value,
    nivel_atividade:  document.getElementById('p-atividade').value,
    objetivo:         document.getElementById('p-objetivo').value,
  };

  try {
    const updated = await api.updateProfile(payload);
    localStorage.setItem('fittrack_user', JSON.stringify(updated));
    renderSidebarUser(updated);

    const msgEl = document.getElementById('profile-msg');
    msgEl.textContent = 'Perfil atualizado com sucesso!';
    msgEl.style.color = 'var(--accent)';

    await loadTDEE();
  } catch (err) {
    showError('profile-msg', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Alterações';
  }
}

init();
