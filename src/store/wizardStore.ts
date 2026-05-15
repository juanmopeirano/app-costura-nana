import { create } from 'zustand';
import type { Medidas } from '../lib/patrones/tipos';
import { MEDIDAS_VACIAS } from '../lib/patrones/tipos';

type WizardState = {
  perfilId: string | null;
  nombre: string;
  paso: number;
  medidas: Medidas;
  setNombre: (n: string) => void;
  setPaso: (n: number) => void;
  setMedida: (id: keyof Medidas, v: number) => void;
  cargarPerfil: (id: string, nombre: string, m: Medidas) => void;
  reiniciar: () => void;
};

export const useWizard = create<WizardState>((set) => ({
  perfilId: null,
  nombre: '',
  paso: 0,
  medidas: { ...MEDIDAS_VACIAS },
  setNombre: (nombre) => set({ nombre }),
  setPaso: (paso) => set({ paso }),
  setMedida: (id, v) =>
    set((s) => ({ medidas: { ...s.medidas, [id]: v } })),
  cargarPerfil: (perfilId, nombre, medidas) =>
    set({ perfilId, nombre, medidas, paso: 0 }),
  reiniciar: () =>
    set({ perfilId: null, nombre: '', paso: 0, medidas: { ...MEDIDAS_VACIAS } }),
}));
