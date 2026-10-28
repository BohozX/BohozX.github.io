(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lengua = () => (window.idioma ? window.idioma.actual() : 'en');
  const TEXTOS = {
    es: {
      meses: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      cargando: 'Cargando',
      al: 'al',
      Al: 'Al',
      por: 'por',
      puntos: ['punto bloqueado', 'puntos bloqueados'],
      sinConexion: 'Sin conexión con el tablero',
      sigue: 'El dato sigue disponible en su página.',
      copiado: 'Copiado',
      seleccionado: 'Seleccionado',
      copiar: 'Copiar',
      mapa: 'Mapa de Bolivia por departamento con los puntos bloqueados'
    },
    en: {
      meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cargando: 'Loading',
      al: 'as of',
      Al: 'As of',
      por: 'per',
      puntos: ['blocked point', 'blocked points'],
      sinConexion: 'Dashboard unavailable',
      sigue: 'The data is still available on its page.',
      copiado: 'Copied',
      seleccionado: 'Selected',
      copiar: 'Copy',
      mapa: 'Map of Bolivia by department with blocked points'
    }
  };
  const t = k => TEXTOS[lengua()][k];
  const fecha = iso => {
    const [a, m, d] = String(iso).slice(0, 10).split('-');
    const nombre = t('meses')[+m - 1];
    return lengua() === 'en' ? `${nombre} ${+d}, ${a}` : `${+d} ${nombre} ${a}`;
  };
  const mes = iso => { const [a, m] = String(iso).slice(0, 7).split('-'); return `${t('meses')[+m - 1]} ${a}`; };
  const formatos = {
    es: new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    en: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  };
  const pct = n => formatos[lengua()].format(n).replace('-', '−');
  const entero = n => n.toLocaleString(lengua() === 'en' ? 'en-US' : 'es-BO');
  const URL = {
    ipcaf: 'https://bohozx.github.io/IPCAF/datos.json',
    usdt: 'https://bohozx.github.io/P2P-Nowscast/data/USDT/compra/1d.json',
    icsRes: 'https://bohozx.github.io/Indicador-de-Conflictos-Sociales/data/resumen.json',
    icsCsv: 'https://bohozx.github.io/Indicador-de-Conflictos-Sociales/data/ultimos_90_dias.csv',
    icsGeo: 'https://bohozx.github.io/Indicador-de-Conflictos-Sociales/data/departamentos.geojson',
    icsPts: 'https://bohozx.github.io/Indicador-de-Conflictos-Sociales/data/puntos_90_dias.csv'
  };

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    : null;
  $$('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  const copiar = $('#copiar');
  if (copiar) copiar.addEventListener('click', async () => {
    const texto = $('#correo').textContent.trim();
    try {
      await navigator.clipboard.writeText(texto);
      copiar.textContent = t('copiado');
    } catch (e) {
      const sel = getSelection(), rango = document.createRange();
      rango.selectNodeContents($('#correo'));
      sel.removeAllRanges();
      sel.addRange(rango);
      copiar.textContent = t('seleccionado');
    }
    setTimeout(() => { copiar.textContent = t('copiar'); }, 2000);
  });

  const memoria = new Map();
  const traer = (u, tipo = 'json') => {
    const clave = `${tipo} ${u}`;
    if (!memoria.has(clave)) {
      memoria.set(clave, fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return tipo === 'json' ? r.json() : r.text(); }));
    }
    return memoria.get(clave);
  };

  function csv(texto) {
    const filas = [];
    let fila = [], campo = '', comillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (comillas) {
        if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else comillas = false; } else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === ',') { fila.push(campo); campo = ''; }
      else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
      else campo += c;
    }
    if (campo || fila.length) { fila.push(campo); filas.push(fila); }
    return filas.filter(f => f.length > 1 || f[0]);
  }
  const tabla = texto => {
    const [cab, ...filas] = csv(texto.replace(/^﻿/, ''));
    return filas.map(f => Object.fromEntries(cab.map((k, i) => [k.trim(), f[i]])));
  };

  const tarjetas = [];
  function cuando(el, fn) {
    if (!el) return;
    const registro = { el, fn, listo: false };
    tarjetas.push(registro);
    const correr = () => fn(el).then(() => { registro.listo = true; el.classList.remove('cargando'); }).catch(() => fallo(el));
    if (!('IntersectionObserver' in window)) { correr(); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { obs.disconnect(); correr(); } }, { rootMargin: '400px 0px' });
    obs.observe(el);
  }

  function fallo(card) {
    card.classList.remove('cargando');
    card.dataset.fallo = '1';
    const v = $('[data-v]', card);
    if (v) v.innerHTML = `<small style="margin:0">${t('sinConexion')}</small>`;
    const d = $('[data-d]', card);
    if (d) d.textContent = t('sigue');
  }

  function linea(caja, ys, xs, { cero = false, unidad = '', etiqueta = fecha, formato = pct } = {}) {
    const W = 600, H = 150, p = 8;
    const vals = ys.filter(Number.isFinite);
    let mn = Math.min(...vals), mx = Math.max(...vals);
    if (cero) { mn = Math.min(mn, 0); mx = Math.max(mx, 0); }
    if (mx === mn) { mx += 1; mn -= 1; }
    const x = i => (i / Math.max(1, ys.length - 1)) * W;
    const y = v => p + (1 - (v - mn) / (mx - mn)) * (H - 2 * p);
    const tramos = [];
    let tramo = null, ini = -1, fin = -1;
    ys.forEach((v, i) => {
      if (!Number.isFinite(v)) { tramo = null; return; }
      if (!tramo) { tramo = []; tramos.push(tramo); }
      tramo.push(i);
      if (ini < 0) ini = i;
      fin = i;
    });
    const pts = tr => tr.map((i, k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(ys[i]).toFixed(1)}`).join('');
    const d = tramos.map(pts).join('');
    const area = tramos.map(tr => `${pts(tr)}L${x(tr[tr.length - 1]).toFixed(1)},${H}L${x(tr[0]).toFixed(1)},${H}Z`).join('');
    const id = 'g' + Math.random().toString(36).slice(2, 8);
    caja.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>` +
      (cero ? `<line class="cero" x1="0" x2="${W}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>` : '') +
      `<path d="${area}" fill="url(#${id})"/><path class="trazo" d="${d}"/></svg>` +
      (ys.length <= 120 ? ys.map((v, i) => (Number.isFinite(v) && i !== fin ? `<i class="nodo" data-i="${i}" style="left:${(x(i) / W * 100).toFixed(2)}%;top:${(y(v) / H * 100).toFixed(2)}%"></i>` : '')).join('') : '') +
      `<span class="punto" style="left:${(x(fin) / W * 100).toFixed(2)}%;top:${(y(ys[fin]) / H * 100).toFixed(2)}%"></span>` +
      `<span class="guia"></span><span class="etq"></span>` +
      `<div class="chart-eje" style="position:absolute;left:0;right:0;top:100%"><span>${etiqueta(xs[ini])}</span><span>${etiqueta(xs[fin])}</span></div>`;
    caja.style.marginBottom = '22px';
    const guia = $('.guia', caja), etq = $('.etq', caja);
    let activo = null;
    const resaltar = i => {
      if (activo) activo.classList.remove('activo');
      activo = i == null ? null : $(`.nodo[data-i="${i}"]`, caja);
      if (activo) activo.classList.add('activo');
    };
    caja.onpointermove = e => {
      const r = caja.getBoundingClientRect();
      let i = Math.round(((e.clientX - r.left) / r.width) * (ys.length - 1));
      i = Math.max(ini, Math.min(fin, i));
      while (i > ini && !Number.isFinite(ys[i])) i--;
      const px = x(i) / W * r.width;
      guia.style.left = `${px}px`;
      etq.textContent = `${etiqueta(xs[i])} · ${formato(ys[i])}${unidad}`;
      const media = etq.offsetWidth / 2;
      etq.style.left = `${Math.max(media, Math.min(r.width - media, px))}px`;
      resaltar(i);
      caja.classList.add('mira');
    };
    caja.onpointerleave = () => { resaltar(null); caja.classList.remove('mira'); };
  }

  function barras(card, filas, alElegir) {
    const caja = $('[data-bars]', card), lectura = $('[data-lectura]', card);
    const mx = Math.max(1, ...filas.map(r => r.n));
    caja.innerHTML = filas.map(r => `<i class="${r.n > 0 ? 'on' : ''}" style="height:${r.n > 0 ? Math.max(8, r.n / mx * 100) : 0}%" data-f="${r.f}"></i>`).join('');
    const conteo = new Map(filas.map(r => [r.f, r.n]));
    const ultima = filas[filas.length - 1].f;
    $('[data-desde]', card).textContent = fecha(filas[0].f);
    $('[data-hasta]', card).textContent = fecha(ultima);
    let fija = ultima, marcada = null;
    const elegir = f => {
      const n = conteo.get(f) ?? 0;
      const nombres = t('puntos');
      lectura.textContent = `${fecha(f)} · ${entero(n)} ${n === 1 ? nombres[0] : nombres[1]}`;
      if (marcada) marcada.classList.remove('sel');
      marcada = caja.querySelector(`[data-f="${f}"]`);
      if (marcada) marcada.classList.add('sel');
      if (alElegir) alElegir(f);
    };
    caja.onpointerover = e => { const b = e.target.closest('i'); if (b) elegir(b.dataset.f); };
    caja.onclick = e => { const b = e.target.closest('i'); if (b) { fija = b.dataset.f; elegir(fija); } };
    caja.onpointerleave = () => elegir(fija);
    elegir(fija);
    return () => elegir(fija);
  }

  const ultimoValido = serie => { let u = serie.length - 1; while (u >= 0 && !Number.isFinite(serie[u])) u--; if (u < 0) throw new Error('sin datos'); return u; };

  cuando($('[data-ind="ipcaf"]'), async card => {
    const d = await traer(URL.ipcaf);
    const serie = d.propio.TRES.geometrica.TOTAL.mtd, fechas = d.fechas_d;
    const u = ultimoValido(serie);
    const mesActual = String(fechas[u]).slice(0, 7);
    let ini = u;
    while (ini > 0 && String(fechas[ini - 1]).slice(0, 7) === mesActual) ini--;
    $('[data-v]', card).innerHTML = `${pct(serie[u])}<small>%</small>`;
    $('[data-d]', card).textContent = `${mes(fechas[u])} · ${t('al')} ${fecha(fechas[u])}`;
    linea($('[data-chart]', card), serie.slice(ini, u + 1), fechas.slice(ini, u + 1), { cero: true, unidad: ' %' });
  });

  cuando($('[data-ind="p2p"]'), async card => {
    const d = await traer(URL.usdt);
    const pts = d.points;
    const u = pts.filter(q => Number.isFinite(q.vwap_bob)).pop();
    if (!u) throw new Error('sin datos');
    $('[data-v]', card).innerHTML = `${pct(u.vwap_bob)}<small>Bs ${t('por')} USDT</small>`;
    $('[data-d]', card).textContent = `${t('Al')} ${fecha(u.timestamp_bo)}`;
    linea($('[data-chart]', card), pts.map(q => (Number.isFinite(q.vwap_bob) ? q.vwap_bob : null)), pts.map(q => q.timestamp_bo), { unidad: ' Bs' });
  });

  function mapaBolivia(geo) {
    const cl = Math.cos(16.5 * Math.PI / 180);
    const P = ([lon, lat]) => [lon * cl * 100, -lat * 100];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const deptos = geo.features.map(f => {
      const g = f.geometry, polis = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      let d = '';
      polis.forEach(poli => poli.forEach(anillo => {
        let ult = null;
        anillo.forEach((c, i) => {
          const [x, y] = P(c);
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          if (ult && i < anillo.length - 1 && Math.abs(x - ult[0]) + Math.abs(y - ult[1]) < 0.8) return;
          d += `${ult ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
          ult = [x, y];
        });
        d += 'Z';
      }));
      return { nombre: f.properties.nombre, d };
    });
    return { P, deptos, caja: [x0, y0, x1 - x0, y1 - y0].map(v => v.toFixed(1)).join(' ') };
  }

  cuando($('[data-ind="ics"]'), async card => {
    const [res, txt] = await Promise.all([traer(URL.icsRes), traer(URL.icsCsv, 'text')]);
    const filas = tabla(txt).map(r => ({ f: r.fecha, n: Number(r.bloqueos) })).filter(r => r.f && Number.isFinite(r.n));
    if (!filas.length) throw new Error('sin datos');
    $('[data-v]', card).innerHTML = `${res.ultimo_valor}<small>${t('al')} ${fecha(res.hasta)}</small>`;
    let dia = null, porDia = new Map();
    const refrescar = barras(card, filas, f => {
      if (dia) dia.innerHTML = (porDia.get(f) || []).map(([x, y]) => `<circle class="onda" cx="${x}" cy="${y}" r="9"/><circle class="pdia" cx="${x}" cy="${y}" r="8"/>`).join('');
    });
    const [geo, pts] = await Promise.allSettled([traer(URL.icsGeo), traer(URL.icsPts, 'text')]);
    if (geo.status !== 'fulfilled') return;
    const { P, deptos, caja } = mapaBolivia(geo.value);
    const puntos = pts.status === 'fulfilled'
      ? tabla(pts.value).map(p => ({ f: p.fecha, la: Number(p.latitud), lo: Number(p.longitud) })).filter(p => p.f && Number.isFinite(p.la) && Number.isFinite(p.lo))
      : [];
    puntos.forEach(p => {
      if (!porDia.has(p.f)) porDia.set(p.f, []);
      porDia.get(p.f).push(P([p.lo, p.la]).map(v => v.toFixed(1)));
    });
    $('[data-mapa]', card).innerHTML =
      `<svg viewBox="${caja}" role="img" aria-label="${t('mapa')}">` +
      deptos.map(dp => `<path class="depto" d="${dp.d}"><title>${dp.nombre}</title></path>`).join('') +
      `<g>${[...porDia.values()].flat().map(([x, y]) => `<circle class="p90" cx="${x}" cy="${y}" r="5"/>`).join('')}</g><g data-dia></g></svg>`;
    dia = $('[data-dia]', card);
    refrescar();
  });

  const marcarCargando = () => $$('.cargando [data-v]').forEach(v => { v.textContent = t('cargando'); });
  marcarCargando();
  if (window.idioma) window.idioma.alCambiar(() => {
    marcarCargando();
    tarjetas.forEach(r => {
      if (r.el.dataset.fallo) fallo(r.el);
      else if (r.listo) r.fn(r.el).catch(() => fallo(r.el));
    });
    if (copiar) copiar.textContent = t('copiar');
  });
})();
