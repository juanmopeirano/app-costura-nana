import { get, set } from 'idb-keyval';
import type { Patron } from '../patrones/tipos';
import { KEY } from './schema';

export async function listarPatrones(): Promise<Patron[]> {
  const data = (await get<Patron[]>(KEY.patrones)) ?? [];
  return data.sort((a, b) => b.createdAt - a.createdAt);
}

export async function obtenerPatron(id: string): Promise<Patron | undefined> {
  const data = (await get<Patron[]>(KEY.patrones)) ?? [];
  return data.find((p) => p.id === id);
}

export async function guardarPatron(p: Patron): Promise<void> {
  const data = (await get<Patron[]>(KEY.patrones)) ?? [];
  const idx = data.findIndex((x) => x.id === p.id);
  if (idx >= 0) data[idx] = p;
  else data.push(p);
  await set(KEY.patrones, data);
}

export async function eliminarPatron(id: string): Promise<void> {
  const data = (await get<Patron[]>(KEY.patrones)) ?? [];
  await set(KEY.patrones, data.filter((p) => p.id !== id));
}
