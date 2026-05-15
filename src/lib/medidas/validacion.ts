import type { Medidas } from '../patrones/tipos';
import { CATALOGO_MEDIDAS } from './catalogo';

export type ErrorMedida = { id: keyof Medidas; mensaje: string };

export function validarMedida(id: keyof Medidas, valor: number): string | null {
  const paso = CATALOGO_MEDIDAS.find((p) => p.id === id);
  if (!paso) return null;
  if (!Number.isFinite(valor) || valor <= 0) {
    return paso.requerida ? 'Falta ingresar la medida.' : null;
  }
  if (valor < paso.min) return `Parece muy poco — el mínimo razonable es ${paso.min} cm.`;
  if (valor > paso.max) return `Parece mucho — el máximo razonable es ${paso.max} cm.`;
  return null;
}

export function validarMedidas(m: Partial<Medidas>): ErrorMedida[] {
  const errores: ErrorMedida[] = [];
  for (const paso of CATALOGO_MEDIDAS) {
    const valor = m[paso.id] ?? 0;
    const err = validarMedida(paso.id, valor);
    if (err) errores.push({ id: paso.id, mensaje: err });
  }
  // Cruzados: la cadera suele ser mayor o muy cercana al busto, y el busto > cintura.
  if (m.busto && m.cintura && m.busto < m.cintura - 5) {
    errores.push({ id: 'busto', mensaje: 'El busto es mucho menor que la cintura. Revisá.' });
  }
  if (m.cadera && m.cintura && m.cadera < m.cintura - 5) {
    errores.push({ id: 'cadera', mensaje: 'La cadera es menor que la cintura. Revisá.' });
  }
  return errores;
}
