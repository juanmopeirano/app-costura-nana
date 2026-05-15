import { get, set } from 'idb-keyval';
import type { PerfilMedidas } from '../patrones/tipos';
import { KEY } from './schema';

export async function listarPerfiles(): Promise<PerfilMedidas[]> {
  const data = (await get<PerfilMedidas[]>(KEY.perfiles)) ?? [];
  return data.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function obtenerPerfil(id: string): Promise<PerfilMedidas | undefined> {
  const data = (await get<PerfilMedidas[]>(KEY.perfiles)) ?? [];
  return data.find((p) => p.id === id);
}

export async function guardarPerfil(p: PerfilMedidas): Promise<void> {
  const data = (await get<PerfilMedidas[]>(KEY.perfiles)) ?? [];
  const idx = data.findIndex((x) => x.id === p.id);
  if (idx >= 0) data[idx] = p;
  else data.push(p);
  await set(KEY.perfiles, data);
}

export async function eliminarPerfil(id: string): Promise<void> {
  const data = (await get<PerfilMedidas[]>(KEY.perfiles)) ?? [];
  await set(KEY.perfiles, data.filter((p) => p.id !== id));
}
