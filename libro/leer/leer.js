// Lectura en línea: barra de avance, índice que marca dónde vas y video de la clase.
(() => {
  const barra = document.querySelector('.avance');
  const indice = document.getElementById('indice');
  const enlaces = [...indice.querySelectorAll('a[href^="#"]')];
  const destinos = enlaces.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  function alMover() {
    const h = document.documentElement;
    const k = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    barra.style.setProperty('--a', (k * 100).toFixed(2) + '%');
    let actual = destinos[0];
    for (const d of destinos) if (d.getBoundingClientRect().top < 120) actual = d;
    enlaces.forEach(a => a.classList.toggle('aqui', a.getAttribute('href') === '#' + (actual && actual.id)));
  }
  addEventListener('scroll', alMover, { passive: true }); alMover();

  // índice plegable en celular
  const bIndice = document.querySelector('.b-indice');
  bIndice.addEventListener('click', () => {
    const abierto = indice.classList.toggle('abierto');
    bIndice.setAttribute('aria-expanded', abierto);
  });
  enlaces.forEach(a => a.addEventListener('click', () => { indice.classList.remove('abierto'); bIndice.setAttribute('aria-expanded', 'false'); }));

  // video de la clase: el reproductor de YouTube (sin cookies) se carga solo al dar clic
  const visor = document.getElementById('visor'), vv = document.getElementById('visor-video');
  function cerrar() { visor.hidden = true; vv.textContent = ''; document.body.style.overflow = ''; }
  document.querySelectorAll('.ver-clase, .momento').forEach(b => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    const ini = parseInt(b.dataset.t || '0', 10) || 0;
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.yt)}?autoplay=1&rel=0&modestbranding=1&start=${ini}`;
    f.title = 'Video de la clase';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    vv.textContent = ''; vv.appendChild(f);
    visor.hidden = false; document.body.style.overflow = 'hidden';
    visor.querySelector('.x').focus();
  }));
  visor.querySelector('.x').addEventListener('click', cerrar);
  visor.addEventListener('click', e => { if (e.target === visor) cerrar(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.hidden) cerrar(); });
})();
