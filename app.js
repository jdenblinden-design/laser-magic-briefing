{
const ROOM = document.body.dataset.room;
const CFG = window.LM_CONFIG[ROOM];
const LANGS = [
  { k: 'fr', label: 'Français', flag: '<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>' },
  { k: 'nl', label: 'Nederlands', flag: '<svg viewBox="0 0 3 2"><rect width="3" height=".67" fill="#ae1c28"/><rect y=".67" width="3" height=".67" fill="#fff"/><rect y="1.33" width="3" height=".67" fill="#21468b"/></svg>' },
  { k: 'en', label: 'English', flag: '<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="12"/><path d="M30 0V40M0 20H60" stroke="#c8102e" stroke-width="7"/></svg>' }
];
const VIDS = 'lm-videos';
const all = CFG.sections.flatMap(s => Object.values(s.videos)).filter(Boolean);
const abs = u => new URL(u, location.href).href;
const have = new Set();

const main = document.getElementById('menu');
main.innerHTML = CFG.sections.map((s, i) => `
  <section class="row">
    <div class="pic${s.img ? '' : ' dark'}" ${s.img ? `style="background-image:url('${s.img}')"` : ''}></div>
    <div class="body">
      <div><h2>${s.title}</h2><p>${s.sub}</p></div>
      <div class="langs">${LANGS.map(l => {
        const v = s.videos[l.k];
        return `<button class="lang${v ? '' : ' off'}" data-s="${i}" data-l="${l.k}" ${v ? '' : 'disabled'}>
          ${l.flag}<b>${l.label}</b>${v ? '' : '<small>Bientôt</small>'}</button>`;
      }).join('')}</div>
    </div>
  </section>`).join('');

// ---------- lecture ----------
const player = document.getElementById('player');
const video = document.getElementById('video');
function stop() {
  video.pause(); video.removeAttribute('src'); video.load();
  player.classList.remove('on');
}
main.addEventListener('click', e => {
  const b = e.target.closest('.lang'); if (!b || b.disabled) return;
  const url = CFG.sections[b.dataset.s].videos[b.dataset.l];
  video.src = url;
  player.classList.add('on');
  video.play().catch(() => {});
  try { video.webkitEnterFullscreen && video.webkitEnterFullscreen(); } catch (err) {}
});
video.addEventListener('ended', () => {
  try { video.webkitExitFullscreen && video.webkitExitFullscreen(); } catch (err) {}
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  stop();
});
video.addEventListener('webkitendfullscreen', () => { if (!video.ended) stop(); });
document.getElementById('close').addEventListener('click', stop);

// ---------- vidéos gardées sur l'iPad ----------
const statusText = document.getElementById('stxt');
const barFill = document.querySelector('.bar i');
const btn = document.getElementById('dl');
function show(msg, frac) { statusText.textContent = msg; barFill.style.width = Math.round((frac || 0) * 100) + '%'; }

async function check() {
  if (!('caches' in window)) { show('Lecture en ligne'); btn.hidden = true; return; }
  const c = await caches.open(VIDS);
  have.clear();
  for (const u of all) if (await c.match(abs(u))) have.add(u);
  for (const req of await c.keys()) if (!all.map(abs).includes(req.url)) await c.delete(req); // anciennes versions
  const n = have.size, t = all.length;
  show(n === t ? `${t}/${t} vidéos sur l'iPad ✓` : `${n}/${t} vidéos sur l'iPad`, n / t);
  btn.hidden = n === t;
  return n === t;
}

let busy = false;
async function download() {
  if (busy || !navigator.onLine) return; busy = true; btn.disabled = true;
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    const c = await caches.open(VIDS);
    const todo = all.filter(u => !have.has(u));
    for (let i = 0; i < todo.length; i++) {
      const u = todo[i];
      const res = await fetch(u, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      const total = +res.headers.get('Content-Length') || 0;
      const reader = res.body.getReader(); const parts = []; let got = 0;
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        parts.push(value); got += value.length;
        show(`Téléchargement ${i + 1}/${todo.length}…`, total ? got / total : 0);
      }
      const blob = new Blob(parts, { type: 'video/mp4' });
      await c.put(abs(u), new Response(blob, { headers: { 'Content-Type': 'video/mp4', 'Content-Length': blob.size } }));
      have.add(u);
    }
  } catch (err) {
    show('Téléchargement interrompu – réessayer', 0);
  }
  busy = false; btn.disabled = false;
  await check();
}
btn.addEventListener('click', download);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
check().then(ok => { if (!ok) download(); });
}
