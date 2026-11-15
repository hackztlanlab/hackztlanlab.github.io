// Hackztlan Lab — animaciones del sitio. Sin librerías ni recursos externos.
(() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- aviso del QR (se puede cerrar; se recuerda solo en este navegador)
  const aviso = document.getElementById('aviso');
  try { if (localStorage.getItem('aviso-qr') === '1') aviso.hidden = true; } catch (e) {}
  aviso.querySelector('.x').addEventListener('click', () => {
    aviso.hidden = true;
    try { localStorage.setItem('aviso-qr', '1'); } catch (e) {}
  });

  // ---- aparición al hacer scroll
  const revs = document.querySelectorAll('.rev');
  if (quieto || !('IntersectionObserver' in window)) revs.forEach(el => el.classList.add('vis'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    revs.forEach(el => io.observe(el));
  }

  // ---- terminal que escribe sola
  const tty = document.getElementById('tty');
  const P = '<span class="p">ana@linux</span>:<span class="d">~</span>$ ';
  const guion = [
    { cmd: 'whoami', out: 'ana' },
    { cmd: 'ls cursos/', out: '<span class="d">linux-desde-cero/</span>  <span class="d">monta-tu-soc/</span>' },
    { cmd: 'cat cursos/linux-desde-cero/LEEME', out: '12 clases · gratis · en orden\nempieza por la <span class="m">0.5</span>: instala Linux sin borrar Windows' },
    { cmd: './empezar.sh', out: '<span class="ok">[✓]</span> terminal lista\n<span class="ok">[✓]</span> libro descargado\n<span class="ok">[✓]</span> vamos.' },
  ];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const dormir = ms => new Promise(r => setTimeout(r, ms));
  async function escribir() {
    if (quieto) {
      tty.innerHTML = guion.map(g => P + esc(g.cmd) + '\n' + g.out).join('\n') + '\n' + P + '<span class="cursor"></span>';
      return;
    }
    for (;;) {
      let hecho = '';
      for (const g of guion) {
        for (let i = 1; i <= g.cmd.length; i++) {
          tty.innerHTML = hecho + P + esc(g.cmd.slice(0, i)) + '<span class="cursor"></span>';
          await dormir(55 + Math.random() * 70);
        }
        await dormir(380);
        hecho += P + esc(g.cmd) + '\n' + g.out + '\n';
        tty.innerHTML = hecho + P + '<span class="cursor"></span>';
        await dormir(900);
      }
      await dormir(4200);
    }
  }
  escribir();

  // ---- ruta del curso: el riel se llena y los puntos se encienden al bajar
  const rutas = [...document.querySelectorAll('.ruta')];
  const clases = [...document.querySelectorAll('.ruta .clase')];
  function avanceRuta() {
    const mira = innerHeight * 0.62;
    rutas.forEach(ruta => {
      const r = ruta.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (mira - r.top) / r.height));
      ruta.style.setProperty('--avance', (k * 100).toFixed(1) + '%');
    });
    clases.forEach(c => {
      const cr = c.getBoundingClientRect();
      c.classList.toggle('lit', !c.classList.contains('pronto') && cr.top + cr.height / 2 < mira);
    });
  }
  if (quieto) { rutas.forEach(r => r.style.setProperty('--avance', '100%')); clases.forEach(c => c.classList.toggle('lit', !c.classList.contains('pronto'))); }
  else { addEventListener('scroll', avanceRuta, { passive: true }); addEventListener('resize', avanceRuta); avanceRuta(); }

  // ---- ver las clases aquí mismo: el reproductor de YouTube se carga solo al dar clic
  const visor = document.getElementById('visor'), vVideo = document.getElementById('visor-video');
  function cerrarVisor() { visor.hidden = true; vVideo.textContent = ''; document.body.style.overflow = ''; }
  document.querySelectorAll('a.clase[data-yt]').forEach(a => a.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return; // abrir en pestaña nueva sigue funcionando
    e.preventDefault();
    const id = a.dataset.yt;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
    f.title = a.querySelector('.nom').firstChild.textContent.trim();
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    vVideo.textContent = ''; vVideo.appendChild(f);
    document.getElementById('visor-titulo').textContent = a.querySelector('.n').textContent + ' · ' + f.title;
    document.getElementById('visor-yt').href = a.href;
    visor.hidden = false; document.body.style.overflow = 'hidden';
    visor.querySelector('.x').focus();
  }));
  visor.querySelector('.x').addEventListener('click', cerrarVisor);
  visor.addEventListener('click', e => { if (e.target === visor) cerrarVisor(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.hidden) cerrarVisor(); });

  // ---- cursos: la tarjeta despliega su lista de clases (una a la vez)
  const tarjetas = [...document.querySelectorAll('.curso-card')];
  tarjetas.forEach(t => {
    const io2 = new IntersectionObserver(es => { if (es[0].isIntersecting) { t.style.setProperty('--avance', (t.dataset.avance || 0) + '%'); io2.disconnect(); } });
    io2.observe(t);
  });
  function abrirCurso(id, desplazar) {
    tarjetas.forEach(t => {
      const p = document.getElementById(t.dataset.panel), abre = t.dataset.panel === id && p.hidden;
      p.hidden = !abre; t.setAttribute('aria-expanded', abre);
      if (abre) p.querySelectorAll('.rev').forEach(el => el.classList.add('vis'));
    });
    const p = document.getElementById(id);
    if (desplazar && p && !p.hidden) setTimeout(() => p.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' }), 60);
    avanceRuta();
  }
  tarjetas.forEach(t => t.addEventListener('click', () => abrirCurso(t.dataset.panel, true)));
  document.querySelectorAll('.pc-cerrar').forEach(b => b.addEventListener('click', () => {
    abrirCurso(b.dataset.cierra, false);
    document.getElementById('cursos').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' });
  }));
  // los enlaces #curso y #soc (menú, botón "Empieza el curso") abren su tarjeta
  document.querySelectorAll('a[href="#curso"], a[href="#soc"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); const id = a.getAttribute('href').slice(1);
    if (document.getElementById(id).hidden) abrirCurso(id, true); else document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  }));
  if (location.hash === '#curso' || location.hash === '#soc') abrirCurso(location.hash.slice(1), true);

  // ---- tarjetas: brillo que sigue al mouse
  document.querySelectorAll('.tarjeta').forEach(t => t.addEventListener('pointermove', e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  if (quieto) return;

  // ---- fondo: el mapa del SOC del video "El mapa de tu SOC", en vivo (solo roles, sin IPs ni nombres reales)
  const mapa = document.getElementById('mapa');
  const escenario = mapa.querySelector('.mapa-esc');
  const mc = document.getElementById('mapa-c').getContext('2d');
  let dpr = Math.min(devicePixelRatio || 1, 2);
  const ICON = {
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    skull: '<path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>',
  };
  const N = {
    internet: { x: 330, y: 160, r: 48, c: 'cy', ic: 'globe', lb: 'Internet' },
    opnsense: { x: 720, y: 160, r: 66, c: 'cy', lo: 'opnsense', lb: 'OPNsense', sub: 'Firewall', ids: 1 },
    wifi: { x: 1060, y: 165, r: 42, c: 'cy', ic: 'wifi', lb: 'Wi-Fi' },
    honeypot: { x: 1620, y: 165, r: 48, c: 'am', lo: 't-pot', lb: 'Honeypot', sub: 'nube ⟡', rm: 1 },
    pihole: { x: 250, y: 445, r: 46, c: 'gr', lo: 'pi-hole', lb: 'Pi-hole', sub: 'DNS' },
    remnux: { x: 520, y: 445, r: 44, c: 'gr', ic: 'monitor', lb: 'REMnux', ag: 1 },
    endpoint: { x: 900, y: 445, r: 44, c: 'gr', ic: 'monitor', lb: 'Endpoint', sub: 'Sysmon', ag: 1 },
    servidor: { x: 1180, y: 445, r: 44, c: 'gr', ic: 'server', lb: 'Servidor', ag: 1 },
    kali: { x: 1180, y: 290, r: 42, c: 'rd', ic: 'skull', lb: 'Kali', sub: 'ataque' },
    wazuh: { x: 720, y: 700, r: 82, c: 'bl', lo: 'wazuh', lb: 'Wazuh', sub: 'el cerebro' },
    analista: { x: 1120, y: 700, r: 42, c: 'cy', ic: 'user', lb: 'Analista' },
    wireshark: { x: 1430, y: 700, r: 46, c: 'cy', lo: 'wireshark', lb: 'Wireshark', sub: 'lupa' },
    thehive: { x: 430, y: 945, r: 42, c: 'cy', lo: 'thehive', lb: 'TheHive+Cortex', rm: 1 },
    misp: { x: 720, y: 945, r: 42, c: 'cy', lo: 'misp', lb: 'MISP', rm: 1 },
    greenbone: { x: 1040, y: 945, r: 42, c: 'cy', lo: 'greenbone', lb: 'GreenBone', rm: 1 },
  };
  const E = [
    ['internet', 'opnsense', 'cy', 0], ['internet', 'honeypot', 'am', 1, [[1620, 160]]],
    ['opnsense', 'wifi', 'cy', 0], ['opnsense', 'pihole', 'cy', 0], ['opnsense', 'remnux', 'cy', 0], ['opnsense', 'endpoint', 'cy', 0], ['opnsense', 'servidor', 'cy', 0],
    ['opnsense', 'wazuh', 'verde', 0], ['remnux', 'wazuh', 'verde', 0], ['endpoint', 'wazuh', 'verde', 0], ['servidor', 'wazuh', 'verde', 0],
    ['kali', 'servidor', 'rojo', 0, null, 'attack'], ['honeypot', 'wazuh', 'am', 1, [[1620, 700]]],
    ['analista', 'wazuh', 'cy', 0], ['wireshark', 'analista', 'cy', 0],
    ['wazuh', 'thehive', 'cy', 1], ['wazuh', 'misp', 'cy', 1], ['wazuh', 'greenbone', 'cy', 1],
  ];
  const COL = { cy: '86,214,255', verde: '55,255,133', am: '245,185,73', rojo: '255,85,102' };
  const cont = mapa.querySelector('.mapa-nodos');
  for (const id in N) {
    const n = N[id], d = document.createElement('div');
    d.className = 'm-nodo ' + n.c + (n.rm ? ' rm' : ''); d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
    const anillo = document.createElement('div'); anillo.className = 'm-anillo';
    anillo.style.width = anillo.style.height = (n.r * 2) + 'px';
    anillo.innerHTML = (n.lo ? `<img src="img/mapa/${n.lo}.png" alt="">` : `<svg viewBox="0 0 24 24">${ICON[n.ic]}</svg>`)
      + (n.ag ? '<i class="m-agente"></i>' : '')
      + (n.ids ? '<span class="m-ids d"><img src="img/mapa/suricata.png" alt=""></span><span class="m-ids i"><img src="img/mapa/zeek.png" alt=""></span>' : '');
    d.appendChild(anillo);
    d.insertAdjacentHTML('beforeend', `<b>${n.lb}</b>` + (n.sub ? `<small>${n.sub}</small>` : ''));
    cont.appendChild(d); n.el = d;
  }
  const trazo = e => { const a = N[e[0]], b = N[e[1]]; return [[a.x, a.y], ...(e[4] || []), [b.x, b.y]]; };
  function along(p, f) {
    let len = 0; const seg = [];
    for (let i = 0; i < p.length - 1; i++) { const d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); seg.push(d); len += d; }
    let d = f * len;
    for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [p[i][0] + (p[i + 1][0] - p[i][0]) * k, p[i][1] + (p[i + 1][1] - p[i][1]) * k]; } d -= seg[i]; }
    return p[p.length - 1];
  }
  // cámara: recorre el mapa despacio (vista completa → acercamientos → vista completa)
  const PASEO = [[940, 560, 1], [720, 250, 1.35], [940, 560, 1], [760, 700, 1.3], [940, 560, 1], [1180, 380, 1.3]];
  const suave = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const chico = () => innerWidth < 700;
  let ataque = -99;
  function cuadroMapa(now) {
    const t = now / 1000, W = innerWidth, H = innerHeight;
    const base = Math.max(W / 1920, H / 1080) * (chico() ? 1.6 : 1.05);
    const tramo = 9, k = (t / tramo) % PASEO.length, i = Math.floor(k), p = suave(Math.min(1, (k - i) / .45));
    const A = PASEO[i], B = PASEO[(i + 1) % PASEO.length];
    const cx = A[0] + (B[0] - A[0]) * p, cy = A[1] + (B[1] - A[1]) * p, s = base * (A[2] + (B[2] - A[2]) * p);
    escenario.style.transform = `translate(${(W / 2 - cx * s).toFixed(1)}px,${(H / 2 - cy * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
    // ataque de Kali cada 12 s: el servidor y Wazuh se encienden en rojo
    if (t - ataque > 12) ataque = t;
    const fa = t - ataque, alerta = fa > 1.4 && fa < 4 ? 1 - (fa - 1.4) / 2.6 : 0;
    N.wazuh.el.classList.toggle('alerta', alerta > .05);
    N.servidor.el.classList.toggle('alerta', fa > .9 && fa < 2.6);
    // líneas y paquetes
    mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, 1920, 1080);
    E.forEach((e, n) => {
      const col = COL[e[2]], P = trazo(e), atq = e[5] === 'attack';
      mc.strokeStyle = `rgba(${col},${e[3] ? .3 : .5})`; mc.lineWidth = atq ? 4 : 3;
      if (e[3]) { mc.setLineDash([9, 13]); mc.lineDashOffset = -(t * 40) % 22; } else mc.setLineDash([]);
      mc.beginPath(); mc.moveTo(P[0][0], P[0][1]); for (let j = 1; j < P.length; j++) mc.lineTo(P[j][0], P[j][1]); mc.stroke(); mc.setLineDash([]);
      if (atq && fa > 1.2) return;
      const cuantos = atq ? 1 : 2;
      for (let q = 0; q < cuantos; q++) {
        const f = atq ? Math.min(1, fa / 1.2) : ((t * .42) + n * .13 + q * .5) % 1;
        const [qx, qy] = along(P, f), cerca = atq ? 1 : .5 + .5 * Math.sin(f * Math.PI);
        mc.fillStyle = `rgba(${col},${cerca.toFixed(2)})`;
        if (!chico()) { mc.shadowColor = `rgb(${col})`; mc.shadowBlur = 14; }
        mc.beginPath(); mc.arc(qx, qy, atq ? 9 : 6, 0, 6.29); mc.fill(); mc.shadowBlur = 0;
      }
    });
    if (alerta > 0) {
      const w = N.wazuh; mc.strokeStyle = `rgba(255,85,102,${alerta.toFixed(2)})`; mc.lineWidth = 4;
      mc.beginPath(); mc.arc(w.x, w.y, w.r + 20 + (1 - alerta) * 90, 0, 6.29); mc.stroke();
    }
    requestAnimationFrame(cuadroMapa);
  }
  requestAnimationFrame(cuadroMapa);

  // ---- pirámide: energía que sube de la base al templo (solo cuando se ve)
  const en = document.getElementById('energia');
  const ec = en.getContext('2d');
  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) requestAnimationFrame(cuadroEn); }).observe(en);
  // coordenadas normalizadas sobre la imagen (0..1)
  const RAMPAS = [[[.028, .668], [.412, .315]], [[.972, .668], [.593, .315]]];
  const TOPE = [.5, .239];
  function brillo(x, y, r, col, a) {
    const g = ec.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ec.fillStyle = g; ec.beginPath(); ec.arc(x, y, r, 0, 6.29); ec.fill();
  }
  const t0 = performance.now();
  function cuadroEn(now) {
    if (!visible) return;
    const w = en.clientWidth, h = en.clientHeight;
    if (en.width !== w * dpr) { en.width = w * dpr; en.height = h * dpr; }
    ec.setTransform(dpr, 0, 0, dpr, 0, 0); ec.clearRect(0, 0, w, h);
    const k = ((now - t0) / 1000 % 6) / 6;
    brillo(w * .5, h * .74, w * .5, '74,222,128', .14 + .16 * (.5 + .5 * Math.sin(k * Math.PI * 4)));
    for (const [[x0, y0], [x1, y1]] of RAMPAS) for (let i = 0; i < 6; i++) {
      const p = (k + i / 6) % 1, v = Math.sin(p * Math.PI);
      const x = w * (x0 + (x1 - x0) * p), y = h * (y0 + (y1 - y0) * p);
      brillo(x, y, w * .055, '110,255,170', .75 * v);
      brillo(x, y, w * .012, '240,255,245', v);
    }
    const pul = Math.pow(.5 + .5 * Math.sin(k * Math.PI * 6 - Math.PI / 2), 3);
    brillo(w * TOPE[0], h * TOPE[1], w * .22, '45,212,191', .16 + .28 * pul);
    brillo(w * TOPE[0], h * TOPE[1] - 8, w * .07, '220,255,250', .08 + .3 * pul);
    requestAnimationFrame(cuadroEn);
  }

  // ---- visitantes: un cohete, un ovni o un tux astronauta cruzan de vez en cuando
  const capa = document.getElementById('visitas');
  const COHETE = `<svg viewBox="0 0 150 60" width="100%"><g class="fuego"><path d="M22 30 L0 22 L6 30 L0 38Z" fill="#f5b949"/><path d="M22 30 L8 26 L12 30 L8 34Z" fill="#fff6c9"/></g>
    <path d="M22 18 H100 Q140 22 148 30 Q140 38 100 42 H22Z" fill="#e8ecfb"/><path d="M100 18 Q140 22 148 30 Q140 38 100 42Z" fill="#e11d9b"/>
    <path d="M30 18 L18 4 H40 L52 18Z M30 42 L18 56 H40 L52 42Z" fill="#2dd4bf"/><rect x="22" y="27" width="70" height="6" fill="#c9d1ee"/>
    <circle cx="90" cy="30" r="13" fill="#0b1030" stroke="#2dd4bf" stroke-width="3"/></svg><img class="tux" src="img/tux-cool.png" alt="">`;
  const OVNI = `<svg viewBox="0 0 170 120" width="100%"><path class="rayo" d="M62 52 L108 52 L150 120 L20 120Z" fill="#a3e635"/>
    <path d="M52 34 Q85 -6 118 34Z" fill="rgba(160,230,255,.25)" stroke="#bfefff" stroke-width="2"/>
    <ellipse cx="85" cy="40" rx="80" ry="16" fill="#9aa6cf"/><ellipse cx="85" cy="36" rx="80" ry="12" fill="#dfe5fb"/>
    <ellipse cx="85" cy="48" rx="46" ry="7" fill="#5d6894"/>
    <circle class="luz" cx="30" cy="40" r="4" fill="#a3e635"/><circle class="luz" cx="62" cy="44" r="4" fill="#a3e635"/><circle class="luz" cx="108" cy="44" r="4" fill="#a3e635"/><circle class="luz" cx="140" cy="40" r="4" fill="#a3e635"/></svg><img class="tux" src="img/tux-feliz.png" alt="">`;
  const azar = (a, b) => a + Math.random() * (b - a);
  const visitas = [
    () => { // cohete: cruza rápido en diagonal
      const el = nuevo('cohete', COHETE), w = innerWidth, h = innerHeight, izq = Math.random() < .5;
      const y0 = azar(.15, .7) * h, y1 = y0 - azar(.1, .3) * h, x0 = izq ? -200 : w + 200, x1 = izq ? w + 200 : -200;
      const ang = Math.atan2(y1 - y0, Math.abs(x1 - x0)) * 180 / Math.PI, giro = izq ? '' : 'scaleX(-1) ';
      return el.animate([{ transform: `translate(${x0}px,${y0}px) ${giro}rotate(${ang}deg)` }, { transform: `translate(${x1}px,${y1}px) ${giro}rotate(${ang}deg)` }], { duration: azar(3200, 4500), easing: 'cubic-bezier(.4,0,.7,1)' });
    },
    () => { // ovni: entra, se detiene, se balancea y sale disparado
      const el = nuevo('ovni', OVNI), w = innerWidth, h = innerHeight, y = azar(.12, .5) * h, mid = azar(.25, .7) * w;
      return el.animate([
        { transform: `translate(${-220}px,${y}px) rotate(-8deg)` },
        { transform: `translate(${mid}px,${y + 20}px) rotate(4deg)`, offset: .35 },
        { transform: `translate(${mid + 10}px,${y + 8}px) rotate(-3deg)`, offset: .5 },
        { transform: `translate(${mid}px,${y + 18}px) rotate(3deg)`, offset: .65 },
        { transform: `translate(${w + 260}px,${y - 160}px) rotate(-12deg)` }], { duration: 6500, easing: 'ease-in-out' });
    },
    () => { // tux astronauta: flota despacio girando
      const el = nuevo('astro', '<img src="img/tux-feliz.png" alt="">'), w = innerWidth, h = innerHeight, izq = Math.random() < .5;
      const y = azar(.2, .75) * h;
      return el.animate([
        { transform: `translate(${izq ? -120 : w + 120}px,${y}px) rotate(0deg)` },
        { transform: `translate(${izq ? w + 120 : -120}px,${y - azar(-80, 120)}px) rotate(${izq ? 300 : -300}deg)` }], { duration: azar(16000, 22000), easing: 'linear' });
    },
  ];
  function nuevo(cls, html) { const d = document.createElement('div'); d.className = 'visita ' + cls; d.innerHTML = html; capa.appendChild(d); return d; }
  let ultima = -1;
  function siguiente(espera) {
    setTimeout(() => {
      if (document.hidden) return siguiente(5000);
      let i; do { i = Math.random() * visitas.length | 0; } while (i === ultima); ultima = i;
      const anim = visitas[i]();
      anim.onfinish = () => { anim.effect.target.remove(); siguiente(azar(18000, 35000)); };
    }, espera);
  }
  siguiente(6000);
})();
