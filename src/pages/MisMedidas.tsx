import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPerfil, listarPerfiles } from '../lib/storage/perfiles';
import type { PerfilMedidas } from '../lib/patrones/tipos';

export default function MisMedidas() {
  const [perfiles, setPerfiles] = useState<PerfilMedidas[] | null>(null);

  async function refrescar() {
    setPerfiles(await listarPerfiles());
  }

  useEffect(() => {
    void refrescar();
  }, []);

  async function borrar(id: string, nombre: string) {
    if (!confirm(`¿Borrar el perfil "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await eliminarPerfil(id);
    await refrescar();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-rosa-700">Mis medidas</h1>
        <Link to="/medidas/nueva" className="btn-primary">
          + Nuevo perfil
        </Link>
      </div>

      {perfiles === null && <div className="card text-tinta/60 text-sm">Cargando…</div>}

      {perfiles && perfiles.length === 0 && (
        <div className="card text-tinta/70 text-sm space-y-2">
          <p>Todavía no tenés perfiles guardados.</p>
          <p>
            Creá uno con el botón "+ Nuevo perfil" y te vamos a guiar paso a paso para tomar las 23
            medidas que necesitamos para los patrones.
          </p>
        </div>
      )}

      {perfiles && perfiles.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {perfiles.map((p) => (
            <li key={p.id} className="card flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-tinta">{p.nombre}</div>
                <div className="text-xs text-tinta/60">
                  Busto {p.medidas.busto || '—'} · Cintura {p.medidas.cintura || '—'} · Cadera{' '}
                  {p.medidas.cadera || '—'}
                </div>
                <div className="text-xs text-tinta/40 mt-1">
                  Última edición: {new Date(p.updatedAt).toLocaleDateString('es-UY')}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link to={`/medidas/${p.id}`} className="text-rosa-600 text-sm hover:underline">
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => borrar(p.id, p.nombre)}
                  className="text-tinta/50 text-sm hover:text-rosa-700"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
