import { calculate } from './physics.js';
const $ = id => document.getElementById(id);
const key = 'phlab-01-results-v1';
const fmt = (n, digits = 2) => n === null ? '—' : n.toLocaleString('uk-UA', {minimumFractionDigits: digits, maximumFractionDigits: digits});
let rows = [];
try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) rows = saved.map(r => calculate(r.angle, r.n1, r.n2)); } catch { $('storage-note').textContent = 'Збережені дані недоступні. Можна працювати та експортувати нові вимірювання.'; }
let current;
function persist() { try { localStorage.setItem(key, JSON.stringify(rows)); } catch { $('storage-note').textContent = 'Браузер не дозволив збереження. Експортуйте дані в CSV перед закриттям.'; } }
function renderScene(r) {
  const cx = 380, cy = 260, length = 225, rad = Math.PI / 180;
  const point = (angle, direction) => [cx + direction * length * Math.sin(angle * rad), cy - length * Math.cos(angle * rad)];
  const incoming = point(r.angle, -1), reflected = point(r.angle, 1);
  const line = (a, b, color, marker) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="3.5" marker-end="url(#${marker})"/>`;
  const arc = (angle, lower, left, color, label) => { if (angle < 2) return ''; const radius = lower ? 65 : left ? 75 : 95; const endX = cx + (left ? -1 : 1) * radius * Math.sin(angle * rad); const startY = cy + (lower ? radius : -radius); const endY = cy + (lower ? 1 : -1) * radius * Math.cos(angle * rad); return `<path d="M ${cx} ${startY} A ${radius} ${radius} 0 0 ${lower || left ? 0 : 1} ${endX} ${endY}" fill="none" stroke="${color}" stroke-width="1.5"/><text x="${cx + (left ? -1 : 1) * (radius + 22) * Math.sin(angle * rad / 2)}" y="${cy + (lower ? 1 : -1) * (radius + 17) * Math.cos(angle * rad / 2)}" text-anchor="middle" fill="${color}" font-size="17">${label}</text>`; };
  let ticks = '';
  if ($('protractor').checked) { for (let a = 0; a < 360; a += 5) { const t = a * rad, major = a % 30 === 0, inner = major ? 178 : 185; ticks += `<line x1="${cx + inner * Math.sin(t)}" y1="${cy - inner * Math.cos(t)}" x2="${cx + 192 * Math.sin(t)}" y2="${cy - 192 * Math.cos(t)}" stroke="#c0d2cf" stroke-width="${major ? 1.5 : 1}"/>`; if (major) ticks += `<text x="${cx + 207 * Math.sin(t)}" y="${cy - 207 * Math.cos(t) + 4}" text-anchor="middle" fill="#8ca6a1" font-size="10">${a <= 90 ? a : a <= 180 ? 180-a : a <= 270 ? a-180 : 360-a}°</text>`; } }
  const markers = [['in','#df9443'],['out','#b773cf'],['through','#008d89']].map(([id,color]) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`).join('');
  $('scene').innerHTML = `<defs>${markers}</defs><rect width="760" height="260" fill="#f4f8f7"/><rect y="260" width="760" height="260" fill="#e0efed"/><text x="24" y="32" fill="#61747a" font-size="14">Середовище 1 · n₁ = ${fmt(r.n1,3)}</text><text x="24" y="490" fill="#61747a" font-size="14">Середовище 2 · n₂ = ${fmt(r.n2,3)}</text>${ticks}<line x1="0" y1="260" x2="760" y2="260" stroke="#8faaa4" stroke-width="1.5"/><line x1="380" y1="20" x2="380" y2="500" stroke="#91a6a1" stroke-dasharray="6 6"/><text x="392" y="22" fill="#849398" font-size="11">Нормаль</text>${line(incoming,[cx,cy],'#df9443','in')}${line([cx,cy],reflected,'#b773cf','out')}${r.tir ? '' : line([cx,cy],[cx+length*Math.sin(r.beta*rad),cy+length*Math.cos(r.beta*rad)],'#008d89','through')}${arc(r.angle,false,true,'#ba782f','α')}${arc(r.angle,false,false,'#9f5fbb','α′')}${r.tir ? '' : arc(r.beta,true,false,'#007c72','β')}<circle cx="380" cy="260" r="5" fill="#172f39"/>`;
}
function update() {
  const inputs = ['angle','n1','n2'];
  inputs.forEach(id => $(id).setCustomValidity(''));
  if (inputs.some(id => !$(id).checkValidity())) { $('record').disabled = true; $('status').textContent = 'Введіть кут від 0° до 89° та показники заломлення від 1 до 3.'; return; }
  current = calculate(...inputs.map(id => Number($(id).value)));
  $('record').disabled = false; $('angle-range').value = current.angle;
  $('reflection').textContent = fmt(current.reflection) + '°'; $('refraction').textContent = current.beta === null ? '—' : fmt(current.beta) + '°'; $('ratio').textContent = fmt(current.ratio,3); $('critical').textContent = current.critical === null ? '—' : fmt(current.critical) + '°';
  $('status').textContent = current.tir ? 'Повне внутрішнє відбиття — заломлений промінь відсутній.' : current.beta >= 89.999999 ? 'Критичний кут — заломлений промінь іде вздовж межі.' : current.n1 === current.n2 ? 'Однакові показники — промінь не змінює напрямку.' : 'Заломлення та відбиття на межі двох середовищ.';
  renderScene(current);
}
function renderRows() {
  $('results').innerHTML = rows.length ? rows.map((r,i) => `<tr><td>${i+1}</td><td>${fmt(r.n1,3)}</td><td>${fmt(r.n2,3)}</td><td>${fmt(r.angle)}</td><td>${fmt(r.reflection)}</td><td>${fmt(r.beta)}</td><td>${fmt(r.sinA,4)}</td><td>${fmt(r.sinB,4)}</td><td>${fmt(r.measuredRatio,4)}</td><td>${r.tir ? 'Повне відбиття' : 'Заломлення'}</td><td><button class="remove" data-index="${i}" aria-label="Видалити вимірювання ${i+1}">×</button></td></tr>`).join('') : '<tr><td colspan="11" class="empty">Змініть параметри досліду та зафіксуйте перше вимірювання.</td></tr>';
  $('count').textContent = `Кількість вимірювань: ${rows.length}`; $('export').disabled = !rows.length; $('clear').disabled = !rows.length;
}
for (const id of ['angle','n1','n2']) $(id).addEventListener('input', () => { if (id !== 'angle') $('medium'+id.slice(-1)).value = 'custom'; update(); });
$('angle-range').addEventListener('input', () => { $('angle').value = $('angle-range').value; update(); });
for (const i of [1,2]) $('medium'+i).addEventListener('change', () => { if ($('medium'+i).value !== 'custom') $('n'+i).value = $('medium'+i).value; update(); });
$('protractor').addEventListener('change', update);
$('swap').addEventListener('click', () => { for (const prefix of ['medium','n']) { const value = $(prefix+'1').value; $(prefix+'1').value = $(prefix+'2').value; $(prefix+'2').value = value; } update(); });
$('record').addEventListener('click', () => { update(); if ($('record').disabled) return; rows.push({...current}); persist(); renderRows(); });
$('results').addEventListener('click', e => { const button = e.target.closest('button[data-index]'); if (!button) return; rows.splice(Number(button.dataset.index),1); persist(); renderRows(); });
$('clear').addEventListener('click', () => { if (!confirm('Очистити всі вимірювання?')) return; rows = []; persist(); renderRows(); });
$('export').addEventListener('click', () => { const header = ['№','n1','n2','alpha_deg','reflection_deg','beta_deg','sin_alpha','sin_beta','sin_alpha/sin_beta','n2/n1','critical_deg','mode']; const data = rows.map((r,i) => [i+1,r.n1,r.n2,r.angle,r.reflection,r.beta,r.sinA,r.sinB,r.measuredRatio,r.ratio,r.critical,r.tir ? 'Повне внутрішнє відбиття' : 'Заломлення']); const csv = '\uFEFF'+[header,...data].map(row => row.map(v => v === null ? '' : String(v)).join(';')).join('\r\n'); const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = 'lab-01-results.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); });
update(); renderRows();
