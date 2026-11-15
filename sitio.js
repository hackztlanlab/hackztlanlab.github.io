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
    { cmd: 'ls cursos/', out: '<span class="d">linux-desde-cero/</span>  <span class="g">redes/  soc-en-casa/  (pronto)</span>' },
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
  const ruta = document.getElementById('ruta');
  const clases = [...ruta.querySelectorAll('.clase')];
  function avanceRuta() {
    const r = ruta.getBoundingClientRect();
    const mira = innerHeight * 0.62;
    const k = Math.min(1, Math.max(0, (mira - r.top) / r.height));
    ruta.style.setProperty('--avance', (k * 100).toFixed(1) + '%');
    clases.forEach(c => {
      const cr = c.getBoundingClientRect();
      c.classList.toggle('lit', !c.classList.contains('pronto') && cr.top + cr.height / 2 < mira);
    });
  }
  if (quieto) { ruta.style.setProperty('--avance', '100%'); clases.forEach(c => c.classList.toggle('lit', !c.classList.contains('pronto'))); }
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

  // ---- tarjetas: brillo que sigue al mouse
  document.querySelectorAll('.tarjeta').forEach(t => t.addEventListener('pointermove', e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  if (quieto) return;

  // ---- fondo: red de nodos muy tenue (paquetes que viajan)
  const red = document.getElementById('red');
  const rc = red.getContext('2d');
  let W, H, nodos = [], dpr = Math.min(devicePixelRatio || 1, 2);
  function tam() {
    W = red.clientWidth; H = red.clientHeight;
    red.width = W * dpr; red.height = H * dpr; rc.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W * H / 26000));
    nodos = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18 }));
  }
  tam(); addEventListener('resize', tam);
  const pulsos = [];
  function cuadroRed() {
    rc.clearRect(0, 0, W, H);
    for (const p of nodos) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
    const D = 150;
    for (let i = 0; i < nodos.length; i++) for (let j = i + 1; j < nodos.length; j++) {
      const a = nodos[i], b = nodos[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) { rc.strokeStyle = `rgba(45,212,191,${(1 - d / D) * .22})`; rc.lineWidth = 1; rc.beginPath(); rc.moveTo(a.x, a.y); rc.lineTo(b.x, b.y); rc.stroke(); }
    }
    rc.fillStyle = 'rgba(45,212,191,.55)';
    for (const p of nodos) { rc.beginPath(); rc.arc(p.x, p.y, 1.4, 0, 6.29); rc.fill(); }
    if (Math.random() < .03 && nodos.length > 2) {
      const a = nodos[Math.random() * nodos.length | 0];
      const b = nodos.filter(q => q !== a && Math.hypot(q.x - a.x, q.y - a.y) < D)[0];
      if (b) pulsos.push({ a, b, t: 0 });
    }
    for (let i = pulsos.length - 1; i >= 0; i--) {
      const q = pulsos[i]; q.t += .02;
      if (q.t >= 1) { pulsos.splice(i, 1); continue; }
      const x = q.a.x + (q.b.x - q.a.x) * q.t, y = q.a.y + (q.b.y - q.a.y) * q.t;
      rc.fillStyle = 'rgba(163,230,53,.9)'; rc.beginPath(); rc.arc(x, y, 2, 0, 6.29); rc.fill();
    }
    requestAnimationFrame(cuadroRed);
  }
  requestAnimationFrame(cuadroRed);

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
