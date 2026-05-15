import type { Ajuste, Tela } from './tipos';

// Desahogos (ease) por zona, en cm. Valores acordes a manual SENA y prácticas
// estándar de patronaje. Para tela de punto se restan ligeramente porque la
// elasticidad ya provee comodidad.
export type Desahogos = {
  busto: number;
  cintura: number;
  cadera: number;
  brazo: number;
};

const TABLA: Record<Ajuste, Record<Tela, Desahogos>> = {
  ajustado: {
    plano_ligero: { busto: 2, cintura: 1, cadera: 2, brazo: 2 },
    plano_medio: { busto: 3, cintura: 1.5, cadera: 3, brazo: 2.5 },
    plano_pesado: { busto: 4, cintura: 2, cadera: 4, brazo: 3 },
    punto: { busto: 0, cintura: 0, cadera: 0, brazo: 0 },
  },
  regular: {
    plano_ligero: { busto: 4, cintura: 2, cadera: 4, brazo: 3 },
    plano_medio: { busto: 5, cintura: 2.5, cadera: 5, brazo: 4 },
    plano_pesado: { busto: 6, cintura: 3, cadera: 6, brazo: 5 },
    punto: { busto: 2, cintura: 1, cadera: 2, brazo: 1.5 },
  },
  holgado: {
    plano_ligero: { busto: 8, cintura: 4, cadera: 8, brazo: 5 },
    plano_medio: { busto: 10, cintura: 5, cadera: 10, brazo: 6 },
    plano_pesado: { busto: 12, cintura: 6, cadera: 12, brazo: 7 },
    punto: { busto: 6, cintura: 3, cadera: 6, brazo: 4 },
  },
};

export function desahogos(ajuste: Ajuste, tela: Tela): Desahogos {
  return TABLA[ajuste][tela];
}
