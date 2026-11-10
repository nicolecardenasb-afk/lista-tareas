/* Cotizador de eventos en Colombia - app.js */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const val = id => $('#' + id).value.trim();
const COP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

/* ---------- DATOS: departamentos y ciudades de Colombia ---------- */
const DEPTOS = {
  'Amazonas': ['Leticia', 'Puerto Nariño'],
  'Antioquia': ['Medellín', 'Envigado', 'Bello', 'Itagüí', 'Rionegro', 'Sabaneta', 'Guatapé', 'Turbo'],
  'Arauca': ['Arauca', 'Saravena', 'Tame'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'],
  'Bogotá D.C.': ['Bogotá'],
  'Bolívar': ['Cartagena', 'Magangué', 'Mompox', 'Turbaco'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Paipa', 'Villa de Leyva'],
  'Caldas': ['Manizales', 'Villamaría', 'Chinchiná', 'La Dorada'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'],
  'Cesar': ['Valledupar', 'Aguachica', 'Codazzi'],
  'Chocó': ['Quibdó', 'Istmina', 'Bahía Solano'],
  'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Sahagún'],
  'Cundinamarca': ['Soacha', 'Zipaquirá', 'Chía', 'Cajicá', 'Facatativá', 'Fusagasugá', 'Girardot'],
  'Guainía': ['Inírida'],
  'Guaviare': ['San José del Guaviare'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Fonseca'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada'],
  'Nariño': ['Pasto', 'Ipiales', 'Tumaco'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario'],
  'Putumayo': ['Mocoa', 'Puerto Asís'],
  'Quindío': ['Armenia', 'Calarcá', 'Montenegro', 'Salento'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
  'Sucre': ['Sincelejo', 'Corozal', 'Tolú'],
  'Tolima': ['Ibagué', 'Espinal', 'Honda', 'Melgar'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Cartago', 'Jamundí'],
  'Vaupés': ['Mitú'],
  'Vichada': ['Puerto Carreño']
};
// Factor de costo por ubicación (logística). La ciudad tiene prioridad sobre el departamento.
const CIUDAD_F = { 'Bogotá': 1.15, 'Medellín': 1.1, 'Cartagena': 1.2, 'Cali': 1.05, 'Barranquilla': 1.05, 'Santa Marta': 1.1 };
const DEPTO_F = { 'Amazonas': 1.25, 'Vaupés': 1.3, 'Guainía': 1.3, 'Vichada': 1.3, 'Guaviare': 1.2, 'San Andrés y Providencia': 1.3, 'Chocó': 1.15, 'Putumayo': 1.1 };

/* ---------- DATOS: tipos de evento ---------- */
const TIPOS = {
  boda: 'Boda', quince: 'Quince años', cumple: 'Cumpleaños', grado: 'Grado', bautizo: 'Bautizo o primera comunión',
  babyshower: 'Baby shower', aniversario: 'Aniversario', conferencia: 'Conferencia o congreso',
  corporativo: 'Evento empresarial', deporte: 'Evento deportivo', cultural: 'Evento cultural y familiar',
  feria: 'Feria o festival', otro: 'Otro tipo de evento'
};
const SOC = ['boda', 'quince', 'cumple', 'grado', 'bautizo', 'babyshower', 'aniversario'];
const CON_NINOS = ['cultural', 'feria', 'bautizo', 'babyshower'];

/* Servicio: [id, nombre, grupo, unidad (fijo | persona | nino), precio COP, eventos, obligatorio] */
const SERV = [
  ['coord', 'Coordinador del evento', 'Logística', 'fijo', 450000, '*', true],
  ['salon', 'Alquiler de salón o espacio', 'Logística', 'fijo', 1800000, '*'],
  ['mont', 'Montaje y desmontaje', 'Logística', 'fijo', 600000, '*'],
  ['mesas', 'Mesas y sillas', 'Logística', 'persona', 6500, '*'],
  ['trans', 'Transporte de invitados', 'Logística', 'fijo', 900000, '*'],
  ['banq', 'Banquete o almuerzo', 'Alimentos y bebidas', 'persona', 48000, [...SOC, 'corporativo']],
  ['pasa', 'Coctelería y pasabocas', 'Alimentos y bebidas', 'persona', 22000, [...SOC, 'corporativo', 'cultural', 'feria']],
  ['coffee', 'Coffee break y refrigerios', 'Alimentos y bebidas', 'persona', 15000, ['conferencia', 'corporativo', 'deporte', 'feria', 'cultural']],
  ['torta', 'Torta y mesa de postres', 'Alimentos y bebidas', 'fijo', 350000, SOC],
  ['bar', 'Barra de bebidas', 'Alimentos y bebidas', 'persona', 18000, ['boda', 'quince', 'grado', 'aniversario', 'corporativo', 'cumple']],
  ['hidra', 'Estaciones de hidratación', 'Alimentos y bebidas', 'fijo', 420000, ['deporte', 'feria']],
  ['deco', 'Decoración y ambientación', 'Decoración y entretenimiento', 'fijo', 1500000, [...SOC, 'cultural', 'feria']],
  ['flores', 'Flores y arreglos', 'Decoración y entretenimiento', 'fijo', 700000, ['boda', 'quince', 'grado', 'aniversario', 'bautizo']],
  ['dj', 'DJ y sonido', 'Decoración y entretenimiento', 'fijo', 1100000, [...SOC, 'feria']],
  ['vivo', 'Música en vivo', 'Decoración y entretenimiento', 'fijo', 2600000, ['boda', 'quince', 'aniversario', 'cultural', 'feria']],
  ['pres', 'Presentador o maestro de ceremonias', 'Decoración y entretenimiento', 'fijo', 650000, ['boda', 'quince', 'conferencia', 'deporte', 'cultural', 'corporativo', 'feria']],
  ['foto', 'Fotografía y video', 'Decoración y entretenimiento', 'fijo', 1300000, '*'],
  ['tarima', 'Tarima y escenografía', 'Tecnología y escenario', 'fijo', 1200000, ['conferencia', 'cultural', 'feria', 'corporativo', 'deporte']],
  ['av', 'Pantallas, micrófonos y proyección', 'Tecnología y escenario', 'fijo', 950000, ['conferencia', 'corporativo', 'cultural', 'deporte', 'grado']],
  ['live', 'Transmisión en vivo', 'Tecnología y escenario', 'fijo', 800000, '*'],
  ['reg', 'Registro y acreditación de asistentes', 'Tecnología y escenario', 'persona', 2500, ['conferencia', 'deporte', 'feria', 'corporativo']],
  ['cron', 'Arbitraje y cronometraje', 'Tecnología y escenario', 'fijo', 900000, ['deporte']],
  ['prem', 'Premiación y trofeos', 'Tecnología y escenario', 'fijo', 550000, ['deporte']],
  ['zona', 'Zona infantil con recreadores', 'Niños', 'fijo', 750000, '*'],
  ['show', 'Show infantil de títeres o magia', 'Niños', 'fijo', 600000, '*'],
  ['tall', 'Talleres culturales y de arte', 'Niños', 'nino', 9000, '*'],
  ['dulc', 'Piñata y bolsitas de dulces', 'Niños', 'nino', 7000, '*'],
  ['cuid', 'Cuidado infantil certificado', 'Niños', 'fijo', 520000, '*'],
  ['seg', 'Seguridad privada', 'Seguridad y permisos', 'fijo', 700000, '*', ['deporte', 'cultural', 'feria']],
  ['prim', 'Primeros auxilios y ambulancia', 'Seguridad y permisos', 'fijo', 650000, '*', ['deporte', 'cultural', 'feria']],
  ['poliza', 'Póliza de responsabilidad civil', 'Seguridad y permisos', 'fijo', 320000, '*', ['deporte', 'cultural', 'feria', 'conferencia']],
  ['sayco', 'Permisos Sayco y Acinpro (música)', 'Seguridad y permisos', 'fijo', 380000, '*']
];
const UNIDAD = { fijo: 'valor fijo', persona: 'por invitado', nino: 'por niño' };

/* ---------- RESTRICCIONES: ningún campo puede quedar vacío ---------- */
const d = new Date(); d.setDate(d.getDate() + 7);
const MIN_FECHA = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const ninosSi = () => $('input[name=ninos]:checked').value === 'si';

const V = {
  nombre: v => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,60}$/.test(v) && v.includes(' ') ? '' : 'Escribe tu nombre y apellido (solo letras).',
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  celular: v => /^3\d{9}$/.test(v) ? '' : 'El celular debe tener 10 dígitos y empezar por 3.',
  tipo: v => v ? '' : 'Elige el tipo de evento.',
  depto: v => v ? '' : 'Elige el departamento.',
  ciudad: v => v ? '' : 'Elige la ciudad o municipio.',
  fecha: v => !v ? 'Elige la fecha del evento.' : v < MIN_FECHA ? 'La fecha debe ser al menos 7 días después de hoy.' : '',
  invitados: v => Number.isInteger(+v) && +v >= 10 && +v <= 5000 ? '' : 'Ingresa un número de invitados entre 10 y 5000.',
  ninosN: v => !ninosSi() ? '' : Number.isInteger(+v) && +v >= 1 && +v <= (+val('invitados') || 5000) ? '' : 'Ingresa cuántos niños asistirán (mínimo 1 y no más que los invitados).'
};
const PASOS = { 1: ['nombre', 'correo', 'celular'], 2: ['tipo', 'depto', 'ciudad', 'fecha', 'invitados', 'ninosN'] };

function mostrarError(id, msg) {
  const campo = $('#' + id).closest('.campo');
  $('.err', campo).textContent = msg;
  campo.classList.toggle('mal', !!msg);
  $('#' + id).setAttribute('aria-invalid', !!msg);
}
function validarPaso(n) {
  let primero = null;
  (PASOS[n] || []).forEach(id => {
    const msg = V[id](val(id));
    mostrarError(id, msg);
    if (msg && !primero) primero = id;
  });
  if (n === 3) {
    const hay = $$('#lista input:checked:not(:disabled)').length > 0;
    $('#err-servicios').textContent = hay ? '' : 'Marca al menos un servicio adicional para continuar.';
    if (!hay) primero = 'lista';
  }
  if (n === 4) {
    const ok = $('#terminos').checked;
    mostrarError('terminos', ok ? '' : 'Debes aceptar las condiciones para generar la cotización.');
    if (!ok) primero = 'terminos';
  }
  if (primero) { const el = $('#' + primero); (el.matches('input,select') ? el : $('input', el)).focus(); }
  return !primero;
}

/* ---------- CÁLCULO ---------- */
const aplica = (s, t) => (s[5] === '*' || t === 'otro' || s[5].includes(t)) && (s[2] !== 'Niños' || ninosSi());
const obligatorio = (s, t) => s[6] === true || (Array.isArray(s[6]) && s[6].includes(t));
const sel = new Set();

function calcular() {
  const t = val('tipo'), inv = +val('invitados') || 0, ni = ninosSi() ? (+val('ninosN') || 0) : 0;
  const f = CIUDAD_F[val('ciudad')] ?? DEPTO_F[val('depto')] ?? 1;
  const lineas = SERV.filter(s => t && aplica(s, t) && (obligatorio(s, t) || sel.has(s[0]))).map(s => {
    const cant = s[3] === 'fijo' ? 1 : s[3] === 'persona' ? inv : ni;
    return { nombre: s[1], detalle: s[3] === 'fijo' ? 'Valor fijo' : `${COP(s[4] * f)} x ${cant}`, monto: s[4] * f * cant };
  });
  const sub = lineas.reduce((a, l) => a + l.monto, 0), iva = sub * 0.19;
  return { lineas, sub, iva, total: sub + iva };
}

/* ---------- PINTAR PANTALLA ---------- */
function opciones(sel, lista, texto) {
  sel.innerHTML = `<option value="">${texto}</option>` + lista.map(x => `<option>${x}</option>`).join('');
}
function renderLista() {
  const t = val('tipo');
  if (!t) { $('#lista').innerHTML = '<p class="ayuda">Primero elige el tipo de evento en el paso 2.</p>'; return; }
  const grupos = {};
  SERV.filter(s => aplica(s, t)).forEach(s => (grupos[s[2]] ||= []).push(s));
  $('#lista').innerHTML = Object.entries(grupos).map(([g, items]) => `<fieldset class="grupo"><legend>${g}</legend>` +
    items.map(s => {
      const fijo = obligatorio(s, t);
      return `<label class="item ${fijo ? 'fijo' : ''}"><input type="checkbox" value="${s[0]}" ${fijo || sel.has(s[0]) ? 'checked' : ''} ${fijo ? 'disabled' : ''}>
        <span>${fijo ? '🔒 ' : ''}${s[1]}<small>${COP(s[4])} ${UNIDAD[s[3]]}${fijo ? ' (obligatorio)' : ''}</small></span></label>`;
    }).join('') + '</fieldset>').join('');
}
function renderVivo() {
  const c = calcular(), pend = '<span class="pend">Pendiente</span>';
  const ciudad = val('ciudad') ? `${val('ciudad')}, ${val('depto')}` : pend;
  $('#vivo').innerHTML = `
    <dt>Evento</dt><dd>${TIPOS[val('tipo')] || pend}</dd>
    <dt>Lugar</dt><dd>${ciudad}</dd>
    <dt>Fecha</dt><dd>${val('fecha') || pend}</dd>
    <dt>Invitados</dt><dd>${val('invitados') || pend}</dd>
    <dt>Servicios</dt><dd>${c.lineas.length || pend}</dd>
    <div class="tot"><span>Total</span><span>${COP(c.total)}</span></div>
    <dd style="grid-column:1/-1;text-align:left;font-weight:400" class="pend">${val('tipo') ? 'Incluye IVA del 19%.' : 'Elige un tipo de evento para empezar a calcular.'}</dd>`;
}
function renderResumen() {
  const c = calcular();
  $('#resumen').innerHTML = `
    <dl class="datos">
      <dt>Cliente</dt><dd>${val('nombre')} - ${val('celular')}</dd>
      <dt>Correo</dt><dd>${val('correo')}</dd>
      <dt>Evento</dt><dd>${TIPOS[val('tipo')]} para ${val('invitados')} invitados${ninosSi() ? ` (${val('ninosN')} niños)` : ''}</dd>
      <dt>Lugar</dt><dd>${val('ciudad')}, ${val('depto')}, Colombia</dd>
      <dt>Fecha</dt><dd>${val('fecha')}</dd></dl>
    <table><thead><tr><th>Servicio</th><th>Detalle</th><th class="n">Valor</th></tr></thead><tbody>
    ${c.lineas.map(l => `<tr><td>${l.nombre}</td><td>${l.detalle}</td><td class="n">${COP(l.monto)}</td></tr>`).join('')}
    <tr><td colspan="2">Subtotal</td><td class="n">${COP(c.sub)}</td></tr>
    <tr><td colspan="2">IVA 19%</td><td class="n">${COP(c.iva)}</td></tr>
    <tr class="total"><td colspan="2">Total estimado</td><td class="n">${COP(c.total)}</td></tr></tbody></table>`;
}

/* ---------- NAVEGACIÓN ---------- */
let paso = 1, generada = false;
function ir(n) {
  paso = n;
  $$('.panel').forEach(p => p.hidden = +p.dataset.step !== n);
  $$('#steps li').forEach((li, i) => { li.className = i + 1 === n ? 'activo' : i + 1 < n ? 'hecho' : ''; });
  if (n === 3) renderLista();
  if (n === 4) renderResumen();
  $('#atras').style.visibility = n === 1 || generada ? 'hidden' : 'visible';
  $('#sig').textContent = n === 4 ? 'Generar cotización' : 'Continuar';
  $('#sig').hidden = generada;
  window.scrollTo({ top: 0 });
}
$('#sig').onclick = () => {
  if (!validarPaso(paso)) return;
  if (paso < 4) return ir(paso + 1);
  const num = 'COT-' + MIN_FECHA.replace(/-/g, '').slice(0, 6) + '-' + Math.floor(1000 + Math.random() * 9000);
  generada = true;
  $('#banner').hidden = false;
  $('#banner').innerHTML = `<strong>${num}</strong><br>Cotización generada para ${val('nombre')}. Es válida por 15 días y te contactaremos al ${val('celular')}.<br>
    <button type="button" onclick="window.print()">Imprimir o guardar PDF</button> <button type="button" onclick="location.reload()">Nueva cotización</button>`;
  $('#terminos').disabled = true; ir(4);
};
$('#atras').onclick = () => ir(paso - 1);

/* ---------- EVENTOS ---------- */
function actualizar(e) {
  const id = e.target.id;
  if (V[id] && e.target.closest('.campo')?.classList.contains('mal')) mostrarError(id, V[id](val(id)));
  if (id === 'celular') e.target.value = e.target.value.replace(/\D/g, '');
  if (e.target.closest('#lista') && e.target.type === 'checkbox') {
    e.target.checked ? sel.add(e.target.value) : sel.delete(e.target.value);
    $('#err-servicios').textContent = '';
  }
  renderVivo();
}
$('#form').addEventListener('input', actualizar);
$('#form').addEventListener('change', actualizar);
$('#form').addEventListener('submit', e => e.preventDefault());

$('#depto').addEventListener('change', () => {
  opciones($('#ciudad'), DEPTOS[val('depto')] || [], val('depto') ? 'Selecciona la ciudad' : 'Primero elige el departamento');
  renderVivo();
});
$('#tipo').addEventListener('change', () => {
  sel.clear();
  if (CON_NINOS.includes(val('tipo'))) $('input[name=ninos][value=si]').checked = true;
  alternarNinos(); renderVivo();
});
function alternarNinos() { $('#wrap-ninosN').hidden = !ninosSi(); if (!ninosSi()) $('#ninosN').value = ''; sel.forEach(id => { if (SERV.find(s => s[0] === id)[2] === 'Niños' && !ninosSi()) sel.delete(id); }); }
$$('input[name=ninos]').forEach(r => r.addEventListener('change', () => { alternarNinos(); renderVivo(); }));

/* ---------- INICIO ---------- */
opciones($('#tipo'), [], 'Selecciona el tipo de evento');
$('#tipo').innerHTML = '<option value="">Selecciona el tipo de evento</option>' + Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
opciones($('#depto'), Object.keys(DEPTOS), 'Selecciona el departamento');
opciones($('#ciudad'), [], 'Primero elige el departamento');
$('#fecha').min = MIN_FECHA;
renderVivo(); ir(1);
