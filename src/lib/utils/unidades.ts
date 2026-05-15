export const CM_POR_PULGADA = 2.54;
export const MM_POR_CM = 10;
export const PT_POR_CM = 28.3464567; // 1 cm = 28.346 puntos PostScript

export const cmAPuntos = (cm: number) => cm * PT_POR_CM;
export const puntosACm = (pt: number) => pt / PT_POR_CM;
export const cmAMm = (cm: number) => cm * MM_POR_CM;
export const redondear = (n: number, decimales = 2) =>
  Math.round(n * 10 ** decimales) / 10 ** decimales;
