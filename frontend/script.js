const API = '/api';
let token = localStorage.getItem('gt_token');
let userName = localStorage.getItem('gt_name');
let allExercises = [];
let allDays = [];

// ─── INIT ───────────────────────────────────
window.onload = () => {
  if (token) enterApp();
};

// ─── PAGES ──────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function enterApp() {
  showPage('appPage');
  document.getElementById('sideName').textContent = userName || 'User';
  document.getElementById('sideAva').textContent  = (userName || 'U').slice(0,2).toUpperCase();
  loadAll();
}

function logout() {
  localStorage.removeItem('gt_token');
  localStorage.removeItem('gt_name');
  token = null; userName = null;
  showPage('loginPage');
  showToast('👋 Logged out');
}

// ─── AUTH ────────────────────────────────────
document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const err   = document.getElementById('loginError');
  err.style.display = 'none';
  if (!email || !pass) { err.textContent='Fill all fields'; err.style.display='block'; return; }
  const btn = document.getElementById('loginBtn');
  btn.innerHTML = '<span class="spinner"></span>';
  const res = await fetch(`${API}/auth/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password:pass})
  });
  const data = await res.json();
  btn.textContent = 'Login';
  if (!res.ok) { err.textContent = data.message; err.style.display='block'; return; }
  token = data.token; userName = data.name;
  localStorage.setItem('gt_token', token);
  localStorage.setItem('gt_name', userName);
  showToast(`👋 Welcome back, ${userName}!`, 'success');
  enterApp();
};

document.getElementById('registerBtn').onclick = async () => {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const err   = document.getElementById('registerError');
  err.style.display = 'none';
  if (!name || !email || !pass) { err.textContent='Fill all fields'; err.style.display='block'; return; }
  const btn = document.getElementById('registerBtn');
  btn.innerHTML = '<span class="spinner"></span>';
  const res = await fetch(`${API}/auth/register`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name, email, password:pass})
  });
  const data = await res.json();
  btn.textContent = 'Create account';
  if (!res.ok) { err.textContent = data.message; err.style.display='block'; return; }
  token = data.token; userName = data.name;
  localStorage.setItem('gt_token', token);
  localStorage.setItem('gt_name', userName);
  showToast(`🎉 Welcome, ${userName}!`, 'success');
  enterApp();
};

// Enter key support
['loginEmail','loginPass'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => {
    if(e.key==='Enter') document.getElementById('loginBtn').click();
  })
);
['regName','regEmail','regPass'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => {
    if(e.key==='Enter') document.getElementById('registerBtn').click();
  })
);

// ─── API HELPER ─────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

// ─── LOAD ALL ────────────────────────────────
async function loadAll() {
  const [days, exercises] = await Promise.all([
    api('GET', '/days'),
    api('GET', '/exercises/all')
  ]);
  allDays = days || [];
  allExercises = exercises || [];
  renderDashboard();
  renderWorkouts();
  renderProgress();
  renderHistory();
}

// ─── SECTIONS ────────────────────────────────
const sectionMeta = {
  dashboard: { title:'Dashboard',    sub:'Overview of your training' },
  workouts:  { title:'My Workouts',  sub:'Manage your workout days & exercises' },
  progress:  { title:'Progress',     sub:'Track your strength over time' },
  history:   { title:'History',      sub:'All logged exercises' },
};

function switchSection(name) {
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  const navItems = document.querySelectorAll('.ni');
  const order = ['dashboard','workouts','progress','history'];
  navItems[order.indexOf(name)].classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`sec-${name}`).classList.add('active');
  document.getElementById('topTitle').textContent = sectionMeta[name].title;
  document.getElementById('topSub').textContent   = sectionMeta[name].sub;
}

// ─── DASHBOARD ───────────────────────────────
function renderDashboard() {
  document.getElementById('statDays').textContent = allDays.length;
  document.getElementById('statEx').textContent   = allExercises.length;
  const totalSets = allExercises.reduce(
  (acc, ex) => acc + ex.sets.length,
  0
);

document.getElementById('statVol').textContent = totalSets;
  const recent = [...allExercises].sort((a,b) => new Date(b.loggedAt)-new Date(a.loggedAt)).slice(0,6);
  const list = document.getElementById('recentList');
  if (!recent.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🏁</div><div class="empty-text">No exercises yet. Add your first workout day!</div></div>`;
    return;
  }
  list.innerHTML = `<div class="history-list">${recent.map(ex => {
    const vol = ex.sets.reduce((s,set) => s + (set.reps||0)*(set.weight||0), 0);
    const day = allDays.find(d => d._id === (ex.day?._id || ex.day));
    return `<div class="history-card">
      <div class="history-left">
        <div class="history-name">${ex.name}</div>
        <div class="history-day">${day ? day.name : '—'}</div>
      </div>
      <div class="history-right">
        <div class="history-date">${fmtDate(ex.loggedAt)}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// ─── WORKOUTS ────────────────────────────────
function renderWorkouts() {
  const list = document.getElementById('daysList');
  if (!allDays.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🏋️</div><div class="empty-text">No workout days yet. Create your first one!</div></div>`;
    return;
  }
  list.innerHTML = allDays.map(day => {
    const exs = allExercises.filter(e => (e.day?._id||e.day) === day._id);
    return `<div class="day-card" id="day-${day._id}">
      <div class="day-header" onclick="toggleDay('${day._id}')">
        <div class="day-header-left">
          <span class="day-icon">🏋️</span>
          <span class="day-name">${day.name}</span>
          <span class="day-count">${exs.length} exercises</span>
        </div>
        <div class="day-header-right">
          <button class="icon-btn" title="Rename" onclick="event.stopPropagation();openRenameDay('${day._id}','${day.name.replace(/'/g,"\\'")}')">✏️</button>
          <button class="icon-btn del" title="Delete day" onclick="event.stopPropagation();deleteDay('${day._id}')">🗑️</button>
          <i class="chevron">▼</i>
        </div>
      </div>
      <div class="day-body">
        ${exs.length ? `
        <table class="ex-table">
          <thead><tr><th>Exercise</th><th>Set</th><th>Reps</th><th>Weight</th><th></th></tr></thead>
          <tbody>
            ${exs.map(ex => {
              const rows = ex.sets.map((s, i) => `
                <tr>
                  ${i === 0 ? `<td rowspan="${ex.sets.length || 1}" style="vertical-align:top;padding-top:12px;">
                    ${ex.name}${ex.notes?`<br><small style="color:var(--muted2)">${ex.notes}</small>`:''}
                    </td>` : ''}
                  <td><span class="tag tag-p">Set ${i+1}</span></td>
                  <td>${s.reps || '-'} reps</td>
                  <td><span class="tag tag-g">${s.weight || 0} kg</span></td>
                  ${i === 0 ? `<td rowspan="${ex.sets.length || 1}" style="vertical-align:top;padding-top:10px;">
                    <div class="ex-actions">
                      <button class="icon-btn" onclick="openEditEx('${ex._id}')">✏️</button>
                      <button class="icon-btn del" onclick="deleteExercise('${ex._id}')">🗑️</button>
                    </div></td>` : ''}
                </tr>`).join('');
              return rows || `<tr>
                <td>${ex.name}</td><td>-</td><td>-</td><td>-</td>
                <td><div class="ex-actions">
                  <button class="icon-btn" onclick="openEditEx('${ex._id}')">✏️</button>
                  <button class="icon-btn del" onclick="deleteExercise('${ex._id}')">🗑️</button>
                </div></td></tr>`;
            }).join('')}
          </tbody>
        </table>` : `<div style="padding:12px 0;color:var(--muted2);font-size:13px;">No exercises yet.</div>`}
        <div class="add-ex-row">
          <button class="add-ex-btn" onclick="openAddEx('${day._id}')">➕ Add exercise to this day</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleDay(id) {
  document.getElementById(`day-${id}`).classList.toggle('open');
}

// ─── PROGRESS ────────────────────────────────
function renderProgress() {
  const list = document.getElementById('progressList');
  if (!allExercises.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">📈</div><div class="empty-text">Log some exercises to see your progress!</div></div>`;
    return;
  }
  const grouped = {};
  allExercises.forEach(ex => {
    if (!grouped[ex.name]) grouped[ex.name] = [];
    grouped[ex.name].push(ex);
  });
  list.innerHTML = Object.entries(grouped).map(([name, exArr]) => {
    const allSets = exArr.flatMap(e => e.sets);
    const maxW = Math.max(0, ...allSets.map(s => s.weight||0));
    const avgR = allSets.length ? Math.round(allSets.reduce((a,s)=>a+(s.reps||0),0)/allSets.length) : 0;
    const vol  = allSets.reduce((a,s)=>a+(s.reps||0)*(s.weight||0),0);
    const day  = allDays.find(d => d._id === (exArr[0].day?._id||exArr[0].day));
    const pct  = Math.min(100, (maxW / 300) * 100);
    return `<div class="progress-card">
      <div class="progress-name">${name}</div>
      <div class="progress-day">${day ? day.name : '—'} · ${exArr.length} session(s)</div>
      <div class="progress-stats">
        <div class="pstat"><div class="pstat-val">${maxW}<small style="font-size:12px;">kg</small></div><div class="pstat-label">Max weight</div></div>
        <div class="pstat"><div class="pstat-val">${avgR}</div><div class="pstat-label">Avg reps</div></div>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

// ─── HISTORY ─────────────────────────────────
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!allExercises.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">📅</div><div class="empty-text">No history yet.</div></div>`;
    return;
  }
  const sorted = [...allExercises].sort((a,b) => new Date(b.loggedAt)-new Date(a.loggedAt));
  list.innerHTML = sorted.map(ex => {
    const vol = ex.sets.reduce((s,set) => s+(set.reps||0)*(set.weight||0), 0);
    const day = allDays.find(d => d._id === (ex.day?._id||ex.day));
    return `<div class="history-card">
      <div class="history-left">
        <div class="history-name">${ex.name}</div>
        <div class="history-day">${day ? day.name : '—'} · ${ex.sets.length} sets</div>
      </div>
      <div class="history-right">
        <div class="history-date">${fmtDate(ex.loggedAt)}</div>
      </div>
    </div>`;
  }).join('');
}

// ─── DAYS ────────────────────────────────────
document.getElementById('addDayBtn').onclick = () => {
  document.getElementById('newDayName').value = '';
  openModal('addDayModal');
  setTimeout(() => document.getElementById('newDayName').focus(), 100);
};

async function createDay() {
  const name = document.getElementById('newDayName').value.trim();
  if (!name) return showToast('Enter a day name', 'error');
  const day = await api('POST', '/days', { name });
  if (!day) return;
  allDays.push(day);
  closeModal('addDayModal');
  renderWorkouts();
  renderDashboard();
  showToast(`✅ "${name}" created`, 'success');
}

function openRenameDay(id, name) {
  document.getElementById('renameDayId').value = id;
  document.getElementById('renameDayName').value = name;
  openModal('renameDayModal');
}

async function renameDay() {
  const id   = document.getElementById('renameDayId').value;
  const name = document.getElementById('renameDayName').value.trim();
  if (!name) return showToast('Enter a name', 'error');
  const updated = await api('PUT', `/days/${id}`, { name });
  if (!updated) return;
  allDays = allDays.map(d => d._id === id ? updated : d);
  closeModal('renameDayModal');
  renderWorkouts();
  showToast('✅ Renamed', 'success');
}

async function deleteDay(id) {
  if (!confirm('Delete this day and all its exercises?')) return;
  await api('DELETE', `/days/${id}`);
  allDays = allDays.filter(d => d._id !== id);
  allExercises = allExercises.filter(e => (e.day?._id||e.day) !== id);
  renderWorkouts(); renderDashboard(); renderProgress(); renderHistory();
  showToast('🗑️ Day deleted');
}

// ─── EXERCISES ───────────────────────────────
function openAddEx(dayId) {
  document.getElementById('exDayId').value = dayId;
  document.getElementById('exName').value  = '';
  document.getElementById('exNotes').value = '';
  document.getElementById('setsContainer').innerHTML = '';
  addSetRow(); addSetRow();
  openModal('addExModal');
  setTimeout(() => document.getElementById('exName').focus(), 100);
}

function addSetRow(mode='add') {
  const container = document.getElementById(mode==='add' ? 'setsContainer' : 'editSetsContainer');
  const idx = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'set-row';
  row.innerHTML = `
    <span class="set-num">${idx}</span>
    <input class="set-input" type="number" placeholder="Reps" min="0"/>
    <input class="set-input" type="number" placeholder="Weight (kg)" min="0" step="0.5"/>
    <button class="icon-btn del" onclick="this.parentElement.remove();renumberSets('${mode}')" style="font-size:16px;">✕</button>
  `;
  container.appendChild(row);
}

function renumberSets(mode='add') {
  const container = document.getElementById(mode==='add' ? 'setsContainer' : 'editSetsContainer');
  [...container.children].forEach((row,i) => {
    const num = row.querySelector('.set-num');
    if (num) num.textContent = i+1;
  });
}

function getSets(containerId) {
  return [...document.getElementById(containerId).querySelectorAll('.set-row')].map(row => {
    const inputs = row.querySelectorAll('input');
    return { reps: parseFloat(inputs[0].value)||0, weight: parseFloat(inputs[1].value)||0 };
  });
}

async function saveExercise() {
  const dayId = document.getElementById('exDayId').value;
  const name  = document.getElementById('exName').value.trim();
  const notes = document.getElementById('exNotes').value.trim();
  const sets  = getSets('setsContainer');
  if (!name) return showToast('Enter exercise name', 'error');
  if (!sets.length) return showToast('Add at least one set', 'error');
  const ex = await api('POST', '/exercises', {dayId, name, sets, notes});
  if (!ex) return;
  allExercises.push(ex);
  closeModal('addExModal');
  renderWorkouts(); renderDashboard(); renderProgress(); renderHistory();
  showToast(`✅ "${name}" added`, 'success');
}

function openEditEx(id) {
  const ex = allExercises.find(e => e._id === id);
  if (!ex) return;
  document.getElementById('editExId').value    = id;
  document.getElementById('editExName').value  = ex.name;
  document.getElementById('editExNotes').value = ex.notes||'';
  const c = document.getElementById('editSetsContainer');
  c.innerHTML = '';
  ex.sets.forEach((s,i) => {
    addSetRow('edit');
    const row = c.children[i];
    const inputs = row.querySelectorAll('input');
    inputs[0].value = s.reps||'';
    inputs[1].value = s.weight||'';
  });
  openModal('editExModal');
}

async function updateExercise() {
  const id    = document.getElementById('editExId').value;
  const name  = document.getElementById('editExName').value.trim();
  const notes = document.getElementById('editExNotes').value.trim();
  const sets  = getSets('editSetsContainer');
  if (!name) return showToast('Enter exercise name', 'error');
  const updated = await api('PUT', `/exercises/${id}`, {name, sets, notes});
  if (!updated) return;
  allExercises = allExercises.map(e => e._id===id ? updated : e);
  closeModal('editExModal');
  renderWorkouts(); renderDashboard(); renderProgress(); renderHistory();
  showToast('✅ Updated', 'success');
}

async function deleteExercise(id) {
  if (!confirm('Delete this exercise?')) return;
  await api('DELETE', `/exercises/${id}`);
  allExercises = allExercises.filter(e => e._id !== id);
  renderWorkouts(); renderDashboard(); renderProgress(); renderHistory();
  showToast('🗑️ Exercise deleted');
}

// ─── MODAL HELPERS ───────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.overlay').forEach(o =>
  o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); })
);
document.getElementById('newDayName').addEventListener('keydown', e => {
  if(e.key==='Enter') createDay();
});

// ─── TOAST ───────────────────────────────────
let toastTimer;
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── UTILS ───────────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}
