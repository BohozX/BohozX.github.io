(() => {
  const doc = document.documentElement;
  const lienzo = document.getElementById('cubo');
  if (!lienzo || !window.THREE) { doc.classList.remove('intro'); return; }
  const T = window.THREE;
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enIntro = doc.classList.contains('intro');

  let render;
  try {
    render = new T.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
  } catch (e) {
    lienzo.hidden = true;
    doc.classList.remove('intro');
    return;
  }
  render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  render.setClearColor(0x000000, 0);

  const escena = new T.Scene();
  const camara = new T.PerspectiveCamera(30, 1, 0.1, 100);
  const lejosPortada = 13, lejosIntro = 20;
  escena.add(new T.HemisphereLight(0xffffff, 0x1a1a1a, 0.85));
  const sol = new T.DirectionalLight(0xffffff, 0.75);
  sol.position.set(5, 9, 10);
  escena.add(sol);
  const contra = new T.DirectionalLight(0xffffff, 0.35);
  contra.position.set(-9, -3, -4);
  escena.add(contra);

  const raiz = new T.Group();
  escena.add(raiz);
  const mec = new T.Group();
  raiz.add(mec);
  const pivote = new T.Group();
  mec.add(pivote);
  const Q = Math.PI / 2;

  const cuadro = (l, r) => {
    const h = l / 2, s = new T.Shape();
    s.moveTo(-h + r, -h);
    s.lineTo(h - r, -h);
    s.quadraticCurveTo(h, -h, h, -h + r);
    s.lineTo(h, h - r);
    s.quadraticCurveTo(h, h, h - r, h);
    s.lineTo(-h + r, h);
    s.quadraticCurveTo(-h, h, -h, h - r);
    s.lineTo(-h, -h + r);
    s.quadraticCurveTo(-h, -h, -h + r, -h);
    return new T.ShapeGeometry(s, 6);
  };

  const geoCuerpo = new T.BoxGeometry(0.97, 0.97, 0.97);
  const matCuerpo = new T.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.5, metalness: 0.25 });
  const geoPegatina = cuadro(0.84, 0.13);
  const caras = [
    { eje: 'x', s: 1, tono: 0xf5f5f5, rot: [0, Q, 0] },
    { eje: 'x', s: -1, tono: 0x7a7a7a, rot: [0, -Q, 0] },
    { eje: 'y', s: 1, tono: 0xd6d6d6, rot: [-Q, 0, 0] },
    { eje: 'y', s: -1, tono: 0x3d3d3d, rot: [Q, 0, 0] },
    { eje: 'z', s: 1, tono: 0xadadad, rot: [0, 0, 0] },
    { eje: 'z', s: -1, tono: 0x5a5a5a, rot: [0, Math.PI, 0] }
  ];

  const piezas = [], pegatinas = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    if (!x && !y && !z) continue;
    const pieza = new T.Group();
    pieza.position.set(x, y, z);
    pieza.add(new T.Mesh(geoCuerpo, matCuerpo));
    const p = { x, y, z };
    caras.forEach(c => {
      if (p[c.eje] !== c.s) return;
      const m = new T.Mesh(geoPegatina, new T.MeshStandardMaterial({ color: c.tono, roughness: 0.32, metalness: 0.05, emissive: 0x000000 }));
      m.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
      m.position[c.eje] = c.s * 0.488;
      pieza.add(m);
      pegatinas.push(m);
    });
    mec.add(pieza);
    piezas.push(pieza);
  }

  const ajustar = o => {
    o.updateMatrix();
    const e = o.matrix.elements;
    [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14].forEach(i => { e[i] = Math.round(e[i]); });
    o.matrix.decompose(o.position, o.quaternion, o.scale);
  };

  let actual = null;
  function empezar(m, ahora) {
    raiz.updateMatrixWorld(true);
    pivote.rotation.set(0, 0, 0);
    pivote.updateMatrixWorld(true);
    m.grupo = piezas.filter(p => Math.round(p.position[m.eje]) === m.capa);
    m.grupo.forEach(p => pivote.attach(p));
    m.t0 = ahora;
    actual = m;
  }
  function terminar() {
    pivote.rotation.set(0, 0, 0);
    pivote.rotation[actual.eje] = actual.dir * Q;
    pivote.updateMatrixWorld(true);
    actual.grupo.forEach(p => { mec.attach(p); ajustar(p); });
    pivote.rotation.set(0, 0, 0);
    actual = null;
  }
  const inmediato = m => { empezar(m, 0); terminar(); };

  const azar = a => a[Math.floor(Math.random() * a.length)];
  function mezcla(n) {
    const s = [];
    let previo = null;
    while (s.length < n) {
      const m = { eje: azar(['x', 'y', 'z']), capa: azar([-1, 0, 1]), dir: azar([1, -1]) };
      if (previo && previo.eje === m.eje && previo.capa === m.capa) continue;
      s.push(m);
      previo = m;
    }
    return s;
  }
  const inversa = s => s.slice().reverse().map(m => ({ eje: m.eje, capa: m.capa, dir: -m.dir }));
  const suave = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let pasos = [], esperaHasta = 0, proximo = Infinity, pulso = -1e9;
  function ciclo(primera) {
    const s = mezcla(primera ? 22 : 18);
    if (primera) s.forEach(inmediato);
    else s.forEach(m => pasos.push({ ...m, dur: 80 }));
    pasos.push({ espera: primera ? 500 : 400 });
    inversa(s).forEach(m => pasos.push({ ...m, dur: 170 }));
    pasos.push({ fin: true });
  }

  let armado = null, saliendo = false;
  function prepararIntro() {
    const s = mezcla(6);
    s.forEach(inmediato);
    piezas.forEach(p => {
      const fin = { pos: p.position.clone(), q: p.quaternion.clone() };
      p.userData.fin = fin;
      p.userData.ini = { pos: fin.pos.clone().multiplyScalar(2.6), q: fin.q.clone() };
      p.userData.retraso = (Math.abs(fin.pos.x) + Math.abs(fin.pos.y) + Math.abs(fin.pos.z) - 1) * 110;
      p.position.copy(p.userData.ini.pos);
    });
    armado = { t0: null, dur: 900 };
    vGiro = 0.045;
    pasos.push({ espera: 160 });
    inversa(s).forEach(m => pasos.push({ ...m, dur: 150 }));
    pasos.push({ fin: true, intro: true });
  }
  function encajar() {
    piezas.forEach(p => { p.position.copy(p.userData.fin.pos); p.quaternion.copy(p.userData.fin.q); });
    armado = null;
  }
  function ensamblar(ahora) {
    if (armado.t0 === null) armado.t0 = ahora;
    let listo = true;
    piezas.forEach(p => {
      const u = p.userData;
      const k = Math.min(1, Math.max(0, (ahora - armado.t0 - u.retraso) / armado.dur));
      if (k < 1) listo = false;
      const e = 1 - Math.pow(1 - k, 4);
      p.position.lerpVectors(u.ini.pos, u.fin.pos, e);
      p.quaternion.copy(u.ini.q).slerp(u.fin.q, e);
    });
    if (listo) encajar();
  }
  function salir() {
    if (saliendo || !doc.classList.contains('intro')) return;
    saliendo = true;
    window.scrollTo(0, 0);
    const caja = document.getElementById('cubo-caja'), ranura = document.getElementById('ranura');
    const a = caja.getBoundingClientRect(), b = ranura.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    caja.style.transition = 'transform .7s cubic-bezier(.65,0,.35,1)';
    caja.style.transform = `translate(${dx}px,${dy}px) scale(${(b.width / Math.min(a.width, a.height)) * (lejosIntro / lejosPortada)})`;
    doc.classList.add('saliendo');
    setTimeout(() => {
      caja.style.transition = '';
      caja.style.transform = '';
      doc.classList.remove('intro', 'saliendo');
    }, 740);
  }

  function avanzar(ahora) {
    if (armado) { ensamblar(ahora); return; }
    if (actual) {
      const p = Math.min(1, (ahora - actual.t0) / actual.dur);
      pivote.rotation.set(0, 0, 0);
      pivote.rotation[actual.eje] = actual.dir * Q * suave(p);
      if (p >= 1) terminar();
      return;
    }
    if (ahora < esperaHasta) return;
    const paso = pasos.shift();
    if (!paso) {
      if (ahora >= proximo) { proximo = Infinity; ciclo(false); }
      return;
    }
    if (paso.espera) { esperaHasta = ahora + paso.espera; return; }
    if (paso.fin) {
      pulso = ahora;
      proximo = quieto ? Infinity : ahora + 8000;
      if (paso.intro) setTimeout(salir, 250);
      return;
    }
    empezar(paso, ahora);
  }

  let giro = -0.7, incl = 0.5, vGiro = 0, vIncl = 0, mx = 0, my = 0, tx = 0, ty = 0, arrastre = null;
  const limitar = v => Math.max(-1.25, Math.min(1.25, v));

  const rayo = new T.Raycaster(), ptr = new T.Vector2();
  let marcada = null, encima = false;
  function marcar(m) {
    if (m === marcada) return;
    if (marcada) marcada.material.emissive.setHex(0x000000);
    if (m) m.material.emissive.setHex(0x4a4a4a);
    marcada = m;
  }
  function apuntar(e) {
    const r = lienzo.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    encima = true;
  }
  function rastrear() {
    if (!encima || arrastre) return;
    escena.updateMatrixWorld(true);
    rayo.setFromCamera(ptr, camara);
    const hit = rayo.intersectObjects(piezas, true)[0];
    marcar(hit && pegatinas.includes(hit.object) ? hit.object : null);
  }

  function mezclar() {
    if (actual || pasos.length || quieto) return;
    proximo = 0;
  }

  lienzo.addEventListener('pointerdown', e => {
    if (arrastre) return;
    arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
    try { lienzo.setPointerCapture(e.pointerId); } catch (err) {}
    lienzo.classList.add('arrastrando');
    marcar(null);
  });
  lienzo.addEventListener('pointermove', e => {
    if (arrastre) {
      if (e.pointerId !== arrastre.id) return;
      const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      arrastre.x = e.clientX;
      arrastre.y = e.clientY;
      vGiro = dx * 0.009;
      vIncl = dy * 0.009;
      giro += vGiro;
      incl = limitar(incl + vIncl);
      return;
    }
    if (e.pointerType === 'mouse') apuntar(e);
  });
  const soltar = clic => e => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    const mov = Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0);
    arrastre = null;
    lienzo.classList.remove('arrastrando');
    if (clic && mov < 6) mezclar();
  };
  lienzo.addEventListener('pointerup', soltar(true));
  lienzo.addEventListener('pointercancel', soltar(false));
  lienzo.addEventListener('pointerleave', () => { encima = false; marcar(null); });
  lienzo.addEventListener('keydown', e => {
    const teclas = { ArrowLeft: [-0.06, 0], ArrowRight: [0.06, 0], ArrowUp: [0, -0.06], ArrowDown: [0, 0.06] };
    if (teclas[e.key]) {
      e.preventDefault();
      vGiro += teclas[e.key][0];
      vIncl += teclas[e.key][1];
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      mezclar();
    }
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function medir() {
    const w = lienzo.clientWidth, h = lienzo.clientHeight;
    if (!w || !h) return;
    render.setSize(w, h, false);
    camara.aspect = w / h;
    camara.position.set(0, 0, (doc.classList.contains('intro') ? lejosIntro : lejosPortada) / Math.min(1, w / h));
    camara.lookAt(0, 0, 0);
    camara.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(lienzo);
  else window.addEventListener('resize', medir);
  medir();

  let visible = true, corriendo = false;
  function cuadroAnim(ahora) {
    if (!visible || document.hidden) { corriendo = false; return; }
    avanzar(ahora);
    if (!arrastre) {
      giro += vGiro;
      incl = limitar(incl + vIncl);
      vGiro *= 0.94;
      vIncl *= 0.94;
      incl += (0.5 - incl) * 0.004;
      if (!quieto) giro += 0.0024;
    }
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    raiz.rotation.set(incl + my * 0.16, giro + mx * 0.3, 0);
    const k = Math.min(1, (ahora - pulso) / 650);
    raiz.scale.setScalar(1 + 0.045 * Math.sin(Math.PI * k));
    rastrear();
    render.render(escena, camara);
    requestAnimationFrame(cuadroAnim);
  }
  function pedir() {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(cuadroAnim);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) pedir(); }).observe(lienzo);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pedir(); });

  if (enIntro) {
    prepararIntro();
  } else if (!quieto) {
    ciclo(true);
  }
  pedir();
})();
