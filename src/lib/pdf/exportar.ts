import { PDFDocument, PDFImage, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import type { Patron, Pieza, Punto } from '../patrones/tipos';
import { offsetPolilineaCerrada } from '../patrones/offset';
import { cmAPuntos } from '../utils/unidades';
import { A4, MARGEN, TILE, disposicionPlana, tilesConPiezas, type Tile } from './tiler';

const COLOR_CONTORNO = rgb(0.12, 0.16, 0.22);
const COLOR_SEAM = rgb(0.6, 0.6, 0.65);
const COLOR_PIQUETE = rgb(0.61, 0.16, 0.29);
const COLOR_MARCO = rgb(0.83, 0.78, 0.72);
const COLOR_BERRY = rgb(0.48, 0.16, 0.24); // baya-700
const COLOR_BERRY_SOFT = rgb(0.92, 0.83, 0.85);
const COLOR_CREMA = rgb(0.99, 0.97, 0.93);
const COLOR_TXT = rgb(0.16, 0.14, 0.12);
const COLOR_TXT_SOFT = rgb(0.48, 0.42, 0.37);
const COLOR_HILO_DORADO = rgb(0.72, 0.54, 0.29);

const ETIQUETA_COL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type Ctx = Awaited<ReturnType<typeof crearContexto>>;

async function crearContexto() {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Patrón Costura Nana');
  pdf.setCreator('Costura Nana');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  return { pdf, font, fontBold, fontItalic };
}

const NOMBRE_PRENDA: Record<Patron['diseno']['prenda'], string> = {
  pollera: 'Pollera',
  top: 'Top',
  blusa: 'Blusa',
  vestido: 'Vestido',
  pantalon: 'Pantalon',
};

const NOMBRE_CIERRE: Record<string, string> = {
  cremallera_invisible: 'Cremallera invisible',
  cremallera_visible: 'Cremallera visible',
  botones: 'Botones',
  elastico: 'Elastico',
  ninguno: 'Sin cierre',
};

export async function exportarPatronPDF(patron: Patron): Promise<Uint8Array> {
  const ctx = await crearContexto();
  const disp = disposicionPlana(patron.piezas);
  const tiles = tilesConPiezas(disp, patron.diseno.margenCostura);

  // Embebemos la foto al inicio si existe (puede tardar)
  let imgFoto: PDFImage | null = null;
  if (patron.diseno.fotoReferencia) {
    try {
      const dataUrl = patron.diseno.fotoReferencia;
      if (dataUrl.startsWith('data:image/jpeg')) {
        imgFoto = await ctx.pdf.embedJpg(dataUrl);
      } else if (dataUrl.startsWith('data:image/png')) {
        imgFoto = await ctx.pdf.embedPng(dataUrl);
      }
    } catch (e) {
      console.warn('No se pudo embeber la foto en el PDF:', e);
    }
  }

  // === PAGINA 1: Portada ===
  dibujarPortada(ctx, patron, disp, tiles, imgFoto);

  // === PAGINAS 2..N+1: Tiles del patron ===
  for (let i = 0; i < tiles.length; i++) {
    dibujarPaginaTile(ctx, patron, disp.piezas, tiles[i], i + 1, tiles);
  }

  return ctx.pdf.save();
}

// ---------- PORTADA ----------
function dibujarPortada(
  ctx: Ctx,
  patron: Patron,
  disp: ReturnType<typeof disposicionPlana>,
  tiles: Tile[],
  imgFoto: PDFImage | null,
) {
  const pagina = ctx.pdf.addPage([cmAPuntos(A4.ancho), cmAPuntos(A4.alto)]);
  const W = pagina.getWidth();
  const H = pagina.getHeight();
  const M = cmAPuntos(1.5);

  // Encabezado: linea de berry arriba
  pagina.drawRectangle({
    x: 0,
    y: H - cmAPuntos(0.4),
    width: W,
    height: cmAPuntos(0.4),
    color: COLOR_BERRY,
  });

  // Eyebrow + Título
  pagina.drawText('COSTURA NANA · ATELIER DIGITAL', {
    x: M,
    y: H - cmAPuntos(1.2),
    size: 8,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  const titulo = aWinAnsi(
    patron.diseno.tituloPatron ||
      `${NOMBRE_PRENDA[patron.diseno.prenda]} de ${patron.nombrePerfil}`,
  );
  pagina.drawText(titulo, {
    x: M,
    y: H - cmAPuntos(2.2),
    size: 26,
    font: ctx.fontBold,
    color: COLOR_TXT,
  });
  pagina.drawText(aWinAnsi(`Patron a medida · ${new Date(patron.createdAt).toLocaleDateString('es-UY')}`), {
    x: M,
    y: H - cmAPuntos(2.8),
    size: 9,
    font: ctx.fontItalic,
    color: COLOR_TXT_SOFT,
  });

  // Linea decorativa horizontal de puntadas
  dibujarPuntadasHor(pagina, M, H - cmAPuntos(3.4), W - 2 * M, COLOR_BERRY);

  // === Bloque izquierdo: Foto de referencia (si la hay) ===
  const yBloque = H - cmAPuntos(4.2);
  const altoFoto = cmAPuntos(8);
  const anchoFoto = cmAPuntos(7);
  pagina.drawRectangle({
    x: M,
    y: yBloque - altoFoto,
    width: anchoFoto,
    height: altoFoto,
    borderColor: COLOR_MARCO,
    borderWidth: 0.6,
    color: COLOR_CREMA,
  });
  pagina.drawText('FOTO DE REFERENCIA', {
    x: M + 4,
    y: yBloque - 12,
    size: 7,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  if (imgFoto) {
    // calcula tamaño manteniendo aspecto
    const ratio = imgFoto.width / imgFoto.height;
    let dibW = anchoFoto - 16;
    let dibH = dibW / ratio;
    if (dibH > altoFoto - 24) {
      dibH = altoFoto - 24;
      dibW = dibH * ratio;
    }
    pagina.drawImage(imgFoto, {
      x: M + (anchoFoto - dibW) / 2,
      y: yBloque - altoFoto + (altoFoto - dibH) / 2 - 4,
      width: dibW,
      height: dibH,
    });
  } else {
    pagina.drawText(aWinAnsi('No se subio foto'), {
      x: M + anchoFoto / 2 - 40,
      y: yBloque - altoFoto / 2,
      size: 8,
      font: ctx.fontItalic,
      color: COLOR_TXT_SOFT,
    });
  }

  // === Bloque derecho: Cuadro 10x10cm + Info ===
  const xDer = M + anchoFoto + cmAPuntos(0.8);

  // Cuadro de calibración 10x10 cm
  const calBox = {
    x: xDer,
    y: yBloque - cmAPuntos(10) - 12,
    w: cmAPuntos(10),
    h: cmAPuntos(10),
  };
  pagina.drawRectangle({
    x: calBox.x,
    y: calBox.y,
    width: calBox.w,
    height: calBox.h,
    borderColor: COLOR_BERRY,
    borderWidth: 1.5,
  });
  // grilla interior 1cm
  for (let i = 1; i < 10; i++) {
    pagina.drawLine({
      start: { x: calBox.x + cmAPuntos(i), y: calBox.y },
      end: { x: calBox.x + cmAPuntos(i), y: calBox.y + calBox.h },
      thickness: 0.3,
      color: COLOR_BERRY_SOFT,
    });
    pagina.drawLine({
      start: { x: calBox.x, y: calBox.y + cmAPuntos(i) },
      end: { x: calBox.x + calBox.w, y: calBox.y + cmAPuntos(i) },
      thickness: 0.3,
      color: COLOR_BERRY_SOFT,
    });
  }
  pagina.drawText('CUADRO DE PRUEBA · 10 x 10 cm', {
    x: calBox.x,
    y: calBox.y + calBox.h + 5,
    size: 7,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  pagina.drawText(aWinAnsi('Antes de cortar, imprimi al "Tamano real / 100%"'), {
    x: calBox.x,
    y: calBox.y - 12,
    size: 8,
    font: ctx.font,
    color: COLOR_TXT,
  });
  pagina.drawText(aWinAnsi('y verifica con regla que este cuadro mida 10x10 cm.'), {
    x: calBox.x,
    y: calBox.y - 22,
    size: 8,
    font: ctx.font,
    color: COLOR_TXT,
  });

  // === Tabla de información ===
  const yTabla = yBloque - altoFoto - cmAPuntos(1);
  pagina.drawText('FICHA DEL PATRON', {
    x: M,
    y: yTabla,
    size: 8,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  dibujarPuntadasHor(pagina, M, yTabla - 4, W - 2 * M, COLOR_BERRY);

  const datos: [string, string][] = [
    ['Prenda', aWinAnsi(NOMBRE_PRENDA[patron.diseno.prenda])],
    ['Perfil de medidas', aWinAnsi(patron.nombrePerfil)],
    ['Ajuste', aWinAnsi(patron.diseno.ajuste)],
    ['Tela', aWinAnsi(patron.diseno.tela.replace('_', ' '))],
    ['Largo', `${patron.diseno.largo} cm`],
    ['Margen de costura', `${patron.diseno.margenCostura} cm`],
    [
      'Cierre',
      aWinAnsi(NOMBRE_CIERRE[patron.diseno.cierre] ?? patron.diseno.cierre),
    ],
  ];
  if (patron.diseno.prenda !== 'pollera' && patron.diseno.prenda !== 'pantalon') {
    datos.push(['Escote', aWinAnsi(patron.diseno.escote)]);
    datos.push(['Manga', aWinAnsi(patron.diseno.manga.replace('_', ' '))]);
  }
  if (patron.diseno.variantePollera) {
    datos.push(['Variante', aWinAnsi(patron.diseno.variantePollera.replace('_', ' '))]);
  }
  datos.push(['Cantidad de hojas', `${tiles.length} (grilla ${disp.cols} x ${disp.rows})`]);
  datos.push([
    'Tamano del patron',
    `${disp.bbox.w.toFixed(1)} x ${disp.bbox.h.toFixed(1)} cm`,
  ]);

  let yt = yTabla - 18;
  const colA = M;
  const colB = M + cmAPuntos(5);
  for (const [k, v] of datos) {
    pagina.drawText(k, {
      x: colA,
      y: yt,
      size: 8,
      font: ctx.font,
      color: COLOR_TXT_SOFT,
    });
    pagina.drawText(v, {
      x: colB,
      y: yt,
      size: 9,
      font: ctx.fontBold,
      color: COLOR_TXT,
    });
    yt -= 13;
  }

  // === Esquema de ensamble (a la derecha de la ficha) ===
  const yEnsamble = yTabla - 18;
  const xEnsamble = cmAPuntos(12);
  pagina.drawText('ESQUEMA DE ENSAMBLE', {
    x: xEnsamble,
    y: yTabla,
    size: 8,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  dibujarEsquemaEnsamble(
    pagina,
    ctx,
    disp,
    tiles,
    xEnsamble,
    yEnsamble,
    W - xEnsamble - M,
    yt + 14, // alto restante hasta el final de la ficha
  );

  // === Especificaciones (footer) ===
  const yEsp = Math.max(yt - 16, cmAPuntos(4.5));
  pagina.drawText('NOTAS Y ESPECIFICACIONES', {
    x: M,
    y: yEsp,
    size: 8,
    font: ctx.fontBold,
    color: COLOR_BERRY,
  });
  dibujarPuntadasHor(pagina, M, yEsp - 4, W - 2 * M, COLOR_BERRY);

  const especif = patron.diseno.especificaciones?.trim() || 'Sin especificaciones adicionales.';
  let yE = yEsp - 16;
  const lineas = textWrap(aWinAnsi(especif), 95);
  for (const ln of lineas.slice(0, 8)) {
    pagina.drawText(ln, { x: M, y: yE, size: 9, font: ctx.font, color: COLOR_TXT });
    yE -= 11;
  }

  // Footer fino
  pagina.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: cmAPuntos(0.4),
    color: COLOR_BERRY,
  });
  pagina.drawText('costura-nana · github.com/juanmopeirano/app-costura-nana', {
    x: M,
    y: cmAPuntos(0.55),
    size: 7,
    font: ctx.fontItalic,
    color: COLOR_TXT_SOFT,
  });
}

function dibujarEsquemaEnsamble(
  pagina: PDFPage,
  ctx: Ctx,
  disp: ReturnType<typeof disposicionPlana>,
  tiles: Tile[],
  x: number,
  yTop: number,
  ancho: number,
  alto: number,
) {
  // Caja contenedora
  const padTop = 18;
  const padX = 6;
  const padBot = 4;
  const innerW = ancho - 2 * padX;
  const innerH = alto - padTop - padBot;
  // Escala para que la disposicion entre en la caja
  const escala = Math.min(innerW / Math.max(1, disp.bbox.w), innerH / Math.max(1, disp.bbox.h));
  const cellW = (TILE.ancho - 0) * escala;
  const cellH = (TILE.alto - 0) * escala;
  // Avance entre tiles (con solapado) en pt
  const avanceW = cellW * (1 - 1 / TILE.ancho); // simplificacion: 1cm solapado
  const avanceH = cellH * (1 - 1 / TILE.alto);

  // Origen del grid (esquina superior izquierda dentro de la caja)
  const x0 = x + padX;
  const y0 = yTop - padTop;

  // Dibujamos cada tile como un rectangulo etiquetado
  for (const t of tiles) {
    const tx = x0 + t.col * avanceW;
    const ty = y0 - t.row * avanceH - cellH;
    pagina.drawRectangle({
      x: tx,
      y: ty,
      width: cellW,
      height: cellH,
      borderColor: COLOR_BERRY,
      borderWidth: 0.6,
      color: COLOR_BERRY_SOFT,
      opacity: 0.4,
    });
    const etq = `${ETIQUETA_COL[t.col] ?? '?'}${t.row + 1}`;
    pagina.drawText(etq, {
      x: tx + cellW / 2 - 6,
      y: ty + cellH / 2 - 4,
      size: 9,
      font: ctx.fontBold,
      color: COLOR_BERRY,
    });
  }

  // Dibujamos las siluetas de las piezas (escaladas) por encima
  for (const pp of disp.piezas) {
    const traza = pp.pieza.contornoPuntos.map((p) => ({
      x: x0 + (p.x + pp.dx) * escala,
      y: y0 - (p.y + pp.dy) * escala,
    }));
    for (let i = 0; i < traza.length; i++) {
      const a = traza[i];
      const b = traza[(i + 1) % traza.length];
      pagina.drawLine({
        start: a,
        end: b,
        thickness: 0.5,
        color: COLOR_TXT,
      });
    }
  }
}

// ---------- PAGINA TILE ----------
function dibujarPaginaTile(
  ctx: Ctx,
  patron: Patron,
  piezas: { pieza: Pieza; dx: number; dy: number }[],
  tile: Tile,
  numero: number,
  tiles: Tile[],
) {
  const total = tiles.length;
  const hayVecino = (col: number, row: number) =>
    tiles.some((t) => t.col === col && t.row === row);

  const pagina = ctx.pdf.addPage([cmAPuntos(A4.ancho), cmAPuntos(A4.alto)]);
  const altoPt = pagina.getHeight();
  const origenX = cmAPuntos(MARGEN);
  const origenY = altoPt - cmAPuntos(MARGEN);

  const aPdf = (p: Punto) => ({
    x: origenX + cmAPuntos(p.x - tile.x0),
    y: origenY - cmAPuntos(p.y - tile.y0),
  });

  // Etiqueta del tile (A1, B1, A2...)
  const etqCol = ETIQUETA_COL[tile.col] ?? '?';
  const etqTile = `${etqCol}${tile.row + 1}`;

  // Marco utilizable
  pagina.drawRectangle({
    x: origenX,
    y: origenY - cmAPuntos(TILE.alto),
    width: cmAPuntos(TILE.ancho),
    height: cmAPuntos(TILE.alto),
    borderColor: COLOR_MARCO,
    borderWidth: 0.5,
    borderDashArray: [2, 2],
  });

  // Encabezado: etiqueta grande + nombre patron + hoja N de M
  pagina.drawRectangle({
    x: origenX,
    y: altoPt - cmAPuntos(MARGEN) + 4,
    width: 50,
    height: 18,
    color: COLOR_BERRY,
  });
  pagina.drawText(etqTile, {
    x: origenX + 8,
    y: altoPt - cmAPuntos(MARGEN) + 8,
    size: 11,
    font: ctx.fontBold,
    color: COLOR_CREMA,
  });
  const titulo = aWinAnsi(
    patron.diseno.tituloPatron ||
      `${NOMBRE_PRENDA[patron.diseno.prenda]} de ${patron.nombrePerfil}`,
  );
  pagina.drawText(titulo, {
    x: origenX + 60,
    y: altoPt - cmAPuntos(MARGEN) + 8,
    size: 10,
    font: ctx.fontBold,
    color: COLOR_TXT,
  });
  pagina.drawText(`Hoja ${numero} de ${total} (col ${etqCol}, fila ${tile.row + 1})`, {
    x: cmAPuntos(A4.ancho) - cmAPuntos(MARGEN) - 130,
    y: altoPt - cmAPuntos(MARGEN) + 8,
    size: 9,
    font: ctx.font,
    color: COLOR_TXT_SOFT,
  });

  // Indicadores de unión con las hojas vecinas que realmente se imprimieron
  if (hayVecino(tile.col + 1, tile.row)) {
    pagina.drawText(`-> ${ETIQUETA_COL[tile.col + 1]}${tile.row + 1}`, {
      x: origenX + cmAPuntos(TILE.ancho) - 44,
      y: origenY - cmAPuntos(TILE.alto / 2),
      size: 8,
      font: ctx.fontBold,
      color: COLOR_BERRY,
    });
  }
  if (hayVecino(tile.col - 1, tile.row)) {
    pagina.drawText(`${ETIQUETA_COL[tile.col - 1]}${tile.row + 1} <-`, {
      x: origenX + 4,
      y: origenY - cmAPuntos(TILE.alto / 2),
      size: 8,
      font: ctx.fontBold,
      color: COLOR_BERRY,
    });
  }
  if (hayVecino(tile.col, tile.row + 1)) {
    pagina.drawText(`v ${etqCol}${tile.row + 2}`, {
      x: origenX + cmAPuntos(TILE.ancho / 2) - 10,
      y: origenY - cmAPuntos(TILE.alto) + 4,
      size: 8,
      font: ctx.fontBold,
      color: COLOR_BERRY,
    });
  }
  if (hayVecino(tile.col, tile.row - 1)) {
    pagina.drawText(`^ ${etqCol}${tile.row}`, {
      x: origenX + cmAPuntos(TILE.ancho / 2) - 10,
      y: origenY - 12,
      size: 8,
      font: ctx.fontBold,
      color: COLOR_BERRY,
    });
  }

  // Dibujar cada pieza filtrada por las que tocan el tile
  for (const pp of piezas) {
    const contornoGlobal = pp.pieza.contornoPuntos.map((p) => ({
      x: p.x + pp.dx,
      y: p.y + pp.dy,
    }));
    const bb = bboxPuntos(contornoGlobal);
    if (!bboxTocaTile(bb, tile, patron.diseno.margenCostura)) continue;

    // Linea de costura (seam) interna
    dibujarPoligono(pagina, contornoGlobal, aPdf, {
      color: COLOR_SEAM,
      grosor: 0.4,
      dash: [3, 2],
    });

    // Linea de corte (con margen) — solida
    const corte = offsetPolilineaCerrada(contornoGlobal, patron.diseno.margenCostura);
    dibujarPoligono(pagina, corte, aPdf, { color: COLOR_CONTORNO, grosor: 0.9 });

    // Pinzas
    for (const linea of pp.pieza.pinzas) {
      const a = aPdf({ x: linea.a.x + pp.dx, y: linea.a.y + pp.dy });
      const b = aPdf({ x: linea.b.x + pp.dx, y: linea.b.y + pp.dy });
      pagina.drawLine({ start: a, end: b, thickness: 0.5, color: COLOR_CONTORNO });
    }
    // Linea de hilo
    const ha = aPdf({ x: pp.pieza.hilo.a.x + pp.dx, y: pp.pieza.hilo.a.y + pp.dy });
    const hb = aPdf({ x: pp.pieza.hilo.b.x + pp.dx, y: pp.pieza.hilo.b.y + pp.dy });
    pagina.drawLine({
      start: ha,
      end: hb,
      thickness: 0.6,
      color: COLOR_HILO_DORADO,
      dashArray: [5, 3],
    });
    // Piquetes
    for (const piq of pp.pieza.piquetes) {
      const p = aPdf({ x: piq.x + pp.dx, y: piq.y + pp.dy });
      pagina.drawCircle({ x: p.x, y: p.y, size: 2, borderColor: COLOR_PIQUETE, borderWidth: 0.6 });
    }
    // Nombre de la pieza al centro
    const centro = { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2 };
    if (puntoEnTile(centro, tile)) {
      const c = aPdf(centro);
      const nombre = aWinAnsi(pp.pieza.nombre);
      pagina.drawText(nombre, {
        x: c.x - nombre.length * 2.4,
        y: c.y,
        size: 11,
        font: ctx.fontBold,
        color: COLOR_TXT,
      });
      const sub = `cortar ${pp.pieza.cantidad}x${pp.pieza.cortarSobreDoblez ? ' sobre doblez' : ''}`;
      pagina.drawText(sub, {
        x: c.x - sub.length * 1.7,
        y: c.y - 12,
        size: 8,
        font: ctx.fontItalic,
        color: COLOR_TXT_SOFT,
      });
    }
  }
}

// ---------- HELPERS ----------
function dibujarPuntadasHor(pagina: PDFPage, x: number, y: number, ancho: number, color: ReturnType<typeof rgb>) {
  const dash = 4;
  const sep = 3;
  let cur = x;
  while (cur < x + ancho) {
    pagina.drawLine({
      start: { x: cur, y },
      end: { x: Math.min(cur + dash, x + ancho), y },
      thickness: 0.6,
      color,
    });
    cur += dash + sep;
  }
}

function dibujarPoligono(
  pagina: PDFPage,
  puntos: Punto[],
  aPdf: (p: Punto) => Punto,
  opciones: { color: ReturnType<typeof rgb>; grosor: number; dash?: number[] },
) {
  for (let i = 0; i < puntos.length; i++) {
    const a = aPdf(puntos[i]);
    const b = aPdf(puntos[(i + 1) % puntos.length]);
    pagina.drawLine({
      start: { x: a.x, y: a.y },
      end: { x: b.x, y: b.y },
      thickness: opciones.grosor,
      color: opciones.color,
      dashArray: opciones.dash,
    });
  }
}

function bboxPuntos(puntos: Punto[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of puntos) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function bboxTocaTile(b: { x: number; y: number; w: number; h: number }, t: Tile, margen = 0) {
  return !(
    b.x + b.w + margen < t.x0 ||
    b.x - margen > t.x1 ||
    b.y + b.h + margen < t.y0 ||
    b.y - margen > t.y1
  );
}

function puntoEnTile(p: Punto, t: Tile) {
  return p.x >= t.x0 && p.x <= t.x1 && p.y >= t.y0 && p.y <= t.y1;
}

function textWrap(s: string, max: number): string[] {
  const lines: string[] = [];
  for (const raw of s.split('\n')) {
    if (raw.length <= max) {
      lines.push(raw);
      continue;
    }
    const words = raw.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > max) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = (cur ? cur + ' ' : '') + w;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

// Las fuentes estándar de pdf-lib sólo codifican WinAnsi: cualquier otro
// caracter hace fallar el guardado. El título y las especificaciones los escribe
// la usuaria, así que después de transliterar lo previsible descartamos lo que
// quede fuera del juego en vez de romper la exportación.
const SUSTITUCIONES: [RegExp, string][] = [
  [/[áàä]/g, 'a'], [/[éèë]/g, 'e'], [/[íìï]/g, 'i'], [/[óòö]/g, 'o'], [/[úùü]/g, 'u'],
  [/[ÁÀÄ]/g, 'A'], [/[ÉÈË]/g, 'E'], [/[ÍÌÏ]/g, 'I'], [/[ÓÒÖ]/g, 'O'], [/[ÚÙÜ]/g, 'U'],
  [/[→↑]/g, '->'], [/[←↓]/g, '<-'], [/[·•]/g, '-'], [/×/g, 'x'], [/…/g, '...'],
  [/[“”„]/g, '"'], [/[‘’‛]/g, "'"], [/[–—]/g, '-'],
];

// Rangos de WinAnsi (cp1252): ASCII imprimible, los símbolos del bloque 0x80-0x9F
// y Latin-1 de 0xA0 en adelante.
const EN_WINANSI = (c: string) => {
  const p = c.codePointAt(0)!;
  if (p === 10) return true; // el salto de línea lo maneja textWrap
  if (p >= 0x20 && p <= 0x7e) return true;
  if (p >= 0xa0 && p <= 0xff) return true;
  return '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'.includes(c);
};

export function aWinAnsi(texto: string): string {
  const transliterado = SUSTITUCIONES.reduce((s, [re, a]) => s.replace(re, a), texto);
  return [...transliterado].filter(EN_WINANSI).join('');
}

export function descargarPDF(bytes: Uint8Array, nombre: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
