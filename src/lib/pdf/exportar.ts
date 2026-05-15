import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Patron, Pieza, Punto } from '../patrones/tipos';
import { offsetPolilineaCerrada } from '../patrones/offset';
import { cmAPuntos } from '../utils/unidades';
import { A4, MARGEN, TILE, disposicionPlana, type Tile } from './tiler';

const COLOR_CONTORNO = rgb(0.12, 0.16, 0.22);
const COLOR_SEAM = rgb(0.6, 0.6, 0.65);
const COLOR_HILO = rgb(0.74, 0.23, 0.46);
const COLOR_PIQUETE = rgb(0.61, 0.16, 0.29);
const COLOR_MARCO = rgb(0.83, 0.78, 0.72);
const COLOR_CAL = rgb(0.74, 0.23, 0.46);
const COLOR_TXT = rgb(0.12, 0.16, 0.22);

type CtxPagina = Awaited<ReturnType<typeof crearContexto>>;

async function crearContexto() {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Patrón Costura Nana');
  pdf.setCreator('Costura Nana');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { pdf, font, fontBold };
}

export async function exportarPatronPDF(patron: Patron): Promise<Uint8Array> {
  const ctx = await crearContexto();
  const disp = disposicionPlana(patron.piezas);

  const total = disp.tiles.length;
  for (let i = 0; i < total; i++) {
    const tile = disp.tiles[i];
    dibujarPagina(ctx, patron, disp.piezas, tile, i + 1, total, disp.cols);
  }

  return ctx.pdf.save();
}

function dibujarPagina(
  ctx: CtxPagina,
  patron: Patron,
  piezas: { pieza: Pieza; dx: number; dy: number }[],
  tile: Tile,
  numero: number,
  total: number,
  cols: number,
) {
  const pagina = ctx.pdf.addPage([cmAPuntos(A4.ancho), cmAPuntos(A4.alto)]);
  const altoPt = pagina.getHeight();

  // Origen de la "zona útil" en el sistema PDF (puntos), bottom-left.
  const origenX = cmAPuntos(MARGEN);
  const origenY = altoPt - cmAPuntos(MARGEN); // queda en top-left esquina superior izq de zona útil

  // Helper: convierte punto de molde global (cm) a coordenadas PDF (pt)
  const aPdf = (p: Punto) => ({
    x: origenX + cmAPuntos(p.x - tile.x0),
    y: origenY - cmAPuntos(p.y - tile.y0),
  });

  // Marco de la zona útil
  pagina.drawRectangle({
    x: origenX,
    y: origenY - cmAPuntos(TILE.alto),
    width: cmAPuntos(TILE.ancho),
    height: cmAPuntos(TILE.alto),
    borderColor: COLOR_MARCO,
    borderWidth: 0.5,
    borderDashArray: [2, 2],
  });

  // Encabezado
  const titulo = aWinAnsi(`${patron.diseno.prenda} - ${patron.nombrePerfil}`);
  pagina.drawText(titulo, {
    x: origenX,
    y: altoPt - cmAPuntos(MARGEN) + 6,
    size: 9,
    font: ctx.fontBold,
    color: COLOR_TXT,
  });
  pagina.drawText(`Hoja ${numero} de ${total} (col ${tile.col + 1}, fila ${tile.row + 1})`, {
    x: cmAPuntos(A4.ancho) - cmAPuntos(MARGEN) - 130,
    y: altoPt - cmAPuntos(MARGEN) + 6,
    size: 9,
    font: ctx.font,
    color: COLOR_TXT,
  });

  // En la primera hoja: cuadro de calibración 5x5cm
  if (numero === 1) {
    const calX = origenX + cmAPuntos(0.5);
    const calY = origenY - cmAPuntos(0.5);
    pagina.drawRectangle({
      x: calX,
      y: calY - cmAPuntos(5),
      width: cmAPuntos(5),
      height: cmAPuntos(5),
      borderColor: COLOR_CAL,
      borderWidth: 1,
    });
    pagina.drawText('5 cm', {
      x: calX + cmAPuntos(2),
      y: calY - cmAPuntos(2.6),
      size: 10,
      font: ctx.fontBold,
      color: COLOR_CAL,
    });
    pagina.drawText('Imprimir al 100% (Tamaño real).', {
      x: calX,
      y: calY - cmAPuntos(5.5),
      size: 8,
      font: ctx.font,
      color: COLOR_TXT,
    });
    pagina.drawText('Verificar con regla antes de cortar.', {
      x: calX,
      y: calY - cmAPuntos(5.9),
      size: 8,
      font: ctx.font,
      color: COLOR_TXT,
    });
  }

  // Marcas de unión: triángulos en cada lado que se conecta con otra hoja
  dibujarMarcasUnion(pagina, ctx, tile, numero, cols, origenX, origenY);

  // Dibujar cada pieza (filtrando por las que tocan el tile)
  for (const pp of piezas) {
    const contornoGlobal = pp.pieza.contornoPuntos.map((p) => ({
      x: p.x + pp.dx,
      y: p.y + pp.dy,
    }));
    const bboxGlobal = bboxPuntos(contornoGlobal);
    if (!bboxTocaTile(bboxGlobal, tile)) continue;

    // Línea de costura (seam line - interior, dashed)
    dibujarPoligono(pagina, contornoGlobal, aPdf, {
      color: COLOR_SEAM,
      grosor: 0.4,
      dash: [3, 2],
    });

    // Línea de corte (offset + margen, solida)
    const corteGlobal = offsetPolilineaCerrada(contornoGlobal, patron.diseno.margenCostura);
    dibujarPoligono(pagina, corteGlobal, aPdf, {
      color: COLOR_CONTORNO,
      grosor: 0.8,
    });

    // Pinzas (interior, líneas finas)
    for (const linea of pp.pieza.pinzas) {
      const a = { x: linea.a.x + pp.dx, y: linea.a.y + pp.dy };
      const b = { x: linea.b.x + pp.dx, y: linea.b.y + pp.dy };
      const pa = aPdf(a);
      const pb = aPdf(b);
      pagina.drawLine({
        start: { x: pa.x, y: pa.y },
        end: { x: pb.x, y: pb.y },
        thickness: 0.5,
        color: COLOR_CONTORNO,
      });
    }

    // Línea de hilo
    const ha = aPdf({ x: pp.pieza.hilo.a.x + pp.dx, y: pp.pieza.hilo.a.y + pp.dy });
    const hb = aPdf({ x: pp.pieza.hilo.b.x + pp.dx, y: pp.pieza.hilo.b.y + pp.dy });
    pagina.drawLine({
      start: { x: ha.x, y: ha.y },
      end: { x: hb.x, y: hb.y },
      thickness: 0.5,
      color: COLOR_HILO,
      dashArray: [4, 2],
    });

    // Piquetes (marca perpendicular de 5mm)
    for (const piquete of pp.pieza.piquetes) {
      const g = { x: piquete.x + pp.dx, y: piquete.y + pp.dy };
      const pp1 = aPdf(g);
      pagina.drawCircle({
        x: pp1.x,
        y: pp1.y,
        size: 2,
        borderColor: COLOR_PIQUETE,
        borderWidth: 0.6,
      });
    }

    // Nombre de la pieza al centro (si cae dentro del tile)
    const centro = { x: bboxGlobal.x + bboxGlobal.w / 2, y: bboxGlobal.y + bboxGlobal.h / 2 };
    if (puntoEnTile(centro, tile)) {
      const c = aPdf(centro);
      const nombreLimpio = aWinAnsi(pp.pieza.nombre);
      pagina.drawText(nombreLimpio, {
        x: c.x - nombreLimpio.length * 2.4,
        y: c.y,
        size: 10,
        font: ctx.fontBold,
        color: COLOR_TXT,
      });
      const sub = `cortar ${pp.pieza.cantidad}x${pp.pieza.cortarSobreDoblez ? ' sobre doblez' : ''}`;
      pagina.drawText(sub, {
        x: c.x - sub.length * 1.7,
        y: c.y - 10,
        size: 7,
        font: ctx.font,
        color: COLOR_TXT,
      });
    }
  }
}

function dibujarMarcasUnion(
  pagina: ReturnType<PDFDocument['addPage']>,
  ctx: CtxPagina,
  tile: Tile,
  numero: number,
  cols: number,
  origenX: number,
  origenY: number,
) {
  const ancho = cmAPuntos(TILE.ancho);
  const alto = cmAPuntos(TILE.alto);
  const fontSize = 7;

  // Página a la derecha
  if (tile.col < cols - 1) {
    pagina.drawText(`-> hoja ${numero + 1}`, {
      x: origenX + ancho - 40,
      y: origenY - alto / 2,
      size: fontSize,
      font: ctx.font,
      color: COLOR_MARCO,
    });
  }
  // Página a la izquierda
  if (tile.col > 0) {
    pagina.drawText(`hoja ${numero - 1} <-`, {
      x: origenX + 4,
      y: origenY - alto / 2,
      size: fontSize,
      font: ctx.font,
      color: COLOR_MARCO,
    });
  }
  // Página abajo
  if (tile.y1 + 0.001 < (tile.row + 1) * (TILE.alto)) {
    // (no usado; usamos cols/rows directos)
  }
  // Pages numbering helpers (not implementing full triangles for V1).
}

function dibujarPoligono(
  pagina: ReturnType<PDFDocument['addPage']>,
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

function bboxTocaTile(b: { x: number; y: number; w: number; h: number }, t: Tile) {
  return !(b.x + b.w < t.x0 || b.x > t.x1 || b.y + b.h < t.y0 || b.y > t.y1);
}

function puntoEnTile(p: Punto, t: Tile) {
  return p.x >= t.x0 && p.x <= t.x1 && p.y >= t.y0 && p.y <= t.y1;
}

// Reemplaza caracteres fuera de WinAnsi (que Helvetica no soporta) por ASCII.
// Necesario porque pdf-lib con fuentes estándar requiere caracteres del codepage WinAnsi.
function aWinAnsi(texto: string): string {
  return texto
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/[ÁÀÄ]/g, 'A')
    .replace(/[ÉÈË]/g, 'E')
    .replace(/[ÍÌÏ]/g, 'I')
    .replace(/[ÓÒÖ]/g, 'O')
    .replace(/[ÚÙÜ]/g, 'U')
    // Estos sí los soporta WinAnsi:
    // ñ, Ñ, ¿, ¡ — los dejamos. Quitamos otros símbolos Unicode comunes.
    .replace(/[→↑]/g, '->')
    .replace(/[←↓]/g, '<-')
    .replace(/[·•]/g, '-')
    .replace(/×/g, 'x')
    .replace(/[…]/g, '...')
    .replace(/[""„]/g, '"')
    .replace(/['‛]/g, "'");
}

// Descarga un PDF generado como Uint8Array (browser only).
export function descargarPDF(bytes: Uint8Array, nombre: string) {
  // Cast a BlobPart: TS quiere ArrayBuffer estricto, Uint8Array funciona pero la
  // definición de tipos en versiones nuevas de TS marca SharedArrayBuffer como incompatible.
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
