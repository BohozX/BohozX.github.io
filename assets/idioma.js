(() => {
  const textos = {
    en: {
      meta: 'Indicators and research on the Bolivian economy.',
      nav_inicio: 'Home',
      nav_secciones: 'Sections',
      nav_indicadores: 'Indicators',
      nav_investigacion: 'Research',
      nav_experiencia: 'Experience',
      nav_contacto: 'Contact',
      idioma: 'Language',
      cubo: 'Grayscale Rubik’s cube that solves itself. Drag it or use the arrow keys to rotate it; click, Enter or space scrambles it.',
      h1: 'Data and research on the Bolivian economy',
      sub: 'I’m <strong>Daniel Bohoz Oros Trujillo</strong>, an economist with a particular interest in data analysis, building indicators and econometric modeling. On this page you’ll find some of the indicators I’ve developed and the research I’ve carried out.',
      ind_kicker: 'Indicators',
      ind_titulo: 'Data Observatory',
      en_vivo: 'Live',
      sec_precios: 'Prices and inflation',
      sec_cambio: 'Foreign exchange market',
      sec_entorno: 'Sociopolitical environment',
      ipcaf_lab: 'Month-to-date change · three cities',
      p2p_titulo: 'Parallel exchange rate',
      p2p_lab: 'USDT buy price · last 30 days',
      ics_titulo: 'Social conflict',
      ics_lab: 'Blocked road points',
      abrir: 'Open dashboard',
      inv_kicker: 'Research',
      inv_titulo: 'My research',
      paper_estado: 'Working paper · 2026',
      paper_titulo: 'USDT Price Dynamics in Bolivia amid Episodes of Domestic Uncertainty, 2023–2026',
      paper_resumen: 'Examines whether the effect of exchange-rate uncertainty and social conflict on the USDT price changed between July 2023 and June 2026. Using daily data and TVP-SV and eGARCH models estimated over rolling windows, it finds that conflict initially pushed the USDT price up, but that from June 2025 the relationship weakened and then reversed.',
      tesis_estado: 'Undergraduate thesis · 2026',
      tesis_titulo: 'Optimal Monetary Policy in the Face of External Imbalances in Bolivia, 2011-2025',
      tesis_resumen: 'Assesses which monetary policy would have best addressed Bolivia’s external imbalances between 2011 and 2025. Using a DSGE model estimated with Bayesian techniques, it compares monetary and exchange-rate regimes under external shocks and concludes that a hybrid regime of inflation targeting with a managed float performs best.',
      ver_doc: 'View document',
      exp_kicker: 'Experience',
      exp_titulo: 'My professional experience',
      exp_fonplata: 'Vice Presidency of Strategic Development - Strategy and Development Effectiveness Area (i)',
      org_fonplata: 'FONPLATA Development Bank',
      exp_analista: 'Economic and Virtual Asset Research Analyst',
      exp_asistente: 'Blockchain and Digital Asset Research Assistant',
      exp_bcb: 'Economic Policy Advisory Office - Central Banking Analysis and Development Department (i)',
      org_bcb: 'Central Bank of Bolivia',
      con_kicker: 'Contact',
      con_titulo: 'Let’s talk',
      con_lead: 'Have a research idea or an indicator you’d like to build? I’d love to help. You can also reach out to use any of this data or for consulting.',
      copiar: 'Copy'
    },
    es: {
      meta: 'Indicadores e investigación sobre la economía de Bolivia.',
      nav_inicio: 'Inicio',
      nav_secciones: 'Secciones',
      nav_indicadores: 'Indicadores',
      nav_investigacion: 'Investigación',
      nav_experiencia: 'Experiencia',
      nav_contacto: 'Contacto',
      idioma: 'Idioma',
      cubo: 'Cubo Rubik en escala de grises que se arma solo. Se gira arrastrando o con las flechas y se mezcla con un clic, Enter o espacio.',
      h1: 'Datos e investigación sobre la economía de Bolivia',
      sub: 'Soy <strong>Daniel Bohoz Oros Trujillo</strong>, economista, con especial interés en el análisis de datos, la elaboración de indicadores y los modelos econométricos. En esta página encontrarás algunos de los indicadores que he desarrollado y las investigaciones que he realizado.',
      ind_kicker: 'Indicadores',
      ind_titulo: 'Observatorio de datos',
      en_vivo: 'En vivo',
      sec_precios: 'Precios e inflación',
      sec_cambio: 'Mercado cambiario',
      sec_entorno: 'Entorno sociopolítico',
      ipcaf_lab: 'Acumulado del mes · tres ciudades',
      p2p_titulo: 'Tipo de cambio paralelo',
      p2p_lab: 'Precio de compra del USDT · últimos 30 días',
      ics_titulo: 'Conflictos sociales',
      ics_lab: 'Puntos bloqueados en carreteras',
      abrir: 'Abrir tablero',
      inv_kicker: 'Investigación',
      inv_titulo: 'Mis investigaciones',
      paper_estado: 'Working paper · 2026',
      paper_titulo: 'La dinámica del precio del USDT en Bolivia ante episodios de incertidumbre interna, 2023–2026',
      paper_resumen: 'Estudia si el efecto de la incertidumbre cambiaria y de los conflictos sociales sobre el precio del USDT cambió entre julio de 2023 y junio de 2026. Con datos diarios y modelos TVP-SV y eGARCH en ventanas móviles, encuentra que al inicio los conflictos presionaban al alza el USDT, pero que desde junio de 2025 esa relación se debilitó y luego se revirtió.',
      tesis_estado: 'Tesis de licenciatura · 2026',
      tesis_titulo: 'La política monetaria óptima frente a desequilibrios externos en Bolivia 2011-2025',
      tesis_resumen: 'Evalúa qué política monetaria habría respondido mejor a los desequilibrios externos de Bolivia entre 2011 y 2025. Con un modelo DSGE estimado con técnicas bayesianas compara regímenes monetario-cambiarios ante shocks externos y concluye que un régimen híbrido de metas de inflación con flotación administrada tiene el mejor desempeño.',
      ver_doc: 'Ver documento',
      exp_kicker: 'Experiencia',
      exp_titulo: 'Mi experiencia profesional',
      exp_fonplata: 'Vicepresidencia de Desarrollo Estratégico - Área de Estrategia y Efectividad en el Desarrollo (p)',
      org_fonplata: 'FONPLATA Banco de Desarrollo',
      exp_analista: 'Analista de Investigación Económica y de Activos Virtuales',
      exp_asistente: 'Asistente de Investigación en Blockchain y Activos Digitales',
      exp_bcb: 'Asesoría de Política Económica - Departamento de Análisis y Desarrollo en Banca Central (p)',
      org_bcb: 'Banco Central de Bolivia',
      con_kicker: 'Contacto',
      con_titulo: 'Conversemos',
      con_lead: '¿Tienes una idea para investigar o un indicador que te gustaría construir? Me encantaría ayudarte. También puedes escribirme para usar alguno de estos datos o para una consultoría.',
      copiar: 'Copiar'
    }
  };

  const doc = document.documentElement;
  let actual = 'en';
  try {
    const guardado = localStorage.getItem('idioma');
    if (guardado === 'es' || guardado === 'en') actual = guardado;
  } catch (e) {}
  const oyentes = [];

  function aplicar() {
    const d = textos[actual];
    doc.lang = actual;
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = d[el.dataset.i18n]; if (v != null) el.textContent = v; });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { const v = d[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = d[el.dataset.i18nAria]; if (v != null) el.setAttribute('aria-label', v); });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', d.meta);
    document.querySelectorAll('#idioma [data-l]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === actual)));
  }

  function cambiar(l) {
    if (l === actual || !textos[l]) return;
    actual = l;
    try { localStorage.setItem('idioma', l); } catch (e) {}
    aplicar();
    oyentes.forEach(f => f(l));
  }

  window.idioma = { actual: () => actual, cambiar, alCambiar: f => oyentes.push(f) };
  document.querySelectorAll('#idioma [data-l]').forEach(b => b.addEventListener('click', () => cambiar(b.dataset.l)));
  aplicar();
})();
