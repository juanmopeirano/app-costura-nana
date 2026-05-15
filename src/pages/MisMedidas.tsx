import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPerfil, listarPerfiles } from '../lib/storage/perfiles';
import type { PerfilMedidas } from '../lib/patrones/tipos';
import { IconEdit, IconPlus, IconRuler, IconTrash } from '../components/Icon';

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
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Perfiles corporales</p>
          <h1 className="font-display text-4xl text-tinta-900">Mis medidas</h1>
        </div>
        <Link to="/medidas/nueva" className="btn-primary">
          <IconPlus size={16} /> Nuevo perfil
        </Link>
      </header>

      {perfiles === null && (
        <div className="card text-tinta-600 text-sm">Cargando…</div>
      )}

      {perfiles && perfiles.length === 0 && <EmptyState />}

      {perfiles && perfiles.length > 0 && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfiles.map((p) => (
            <li key={p.id} className="card-stitched group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-display text-2xl text-tinta-900 truncate">
                    {p.nombre}
                  </div>
                  <p className="text-xs text-tinta-500 mt-0.5">
                    Editado{' '}
                    {new Date(p.updatedAt).toLocaleDateString('es-UY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-baya-300">
                  <IconRuler size={22} />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Busto" valor={p.medidas.busto} />
                <Stat label="Cintura" valor={p.medidas.cintura} />
                <Stat label="Cadera" valor={p.medidas.cadera} />
              </dl>
              <div className="flex gap-2 mt-4 pt-3 border-t border-baya-100">
                <Link
                  to={`/medidas/${p.id}`}
                  className="btn-outline flex-1 !px-3 !py-1.5 text-sm"
                >
                  <IconEdit size={14} /> Editar
                </Link>
                <button
                  type="button"
                  onClick={() => borrar(p.id, p.nombre)}
                  className="btn-ghost !px-3 !py-1.5 text-sm text-tinta-500 hover:text-baya-700"
                  aria-label="Borrar"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-lg bg-crema-100 py-2">
      <div className="text-[10px] uppercase tracking-wider text-tinta-500">
        {label}
      </div>
      <div className="font-display text-lg text-baya-700">
        {valor || '—'}
        {valor > 0 && <span className="text-xs text-tinta-500 ml-0.5">cm</span>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-stitched text-center py-12 px-4 space-y-4">
      <div className="text-baya-300 mx-auto w-fit">
        <IconRuler size={48} />
      </div>
      <div>
        <h2 className="font-display text-2xl text-tinta-900 mb-1">
          Sin perfiles todavía
        </h2>
        <p className="text-sm text-tinta-600 max-w-sm mx-auto">
          Antes de coser cualquier prenda necesitamos tus medidas. Te vamos a
          guiar paso a paso para tomarlas, no tarda más de diez minutos.
        </p>
      </div>
      <Link to="/medidas/nueva" className="btn-primary inline-flex">
        <IconPlus size={16} /> Crear mi primer perfil
      </Link>
    </div>
  );
}
