import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPatron, listarPatrones } from '../lib/storage/patrones';
import type { Patron } from '../lib/patrones/tipos';

const NOMBRE_PRENDA: Record<Patron['diseno']['prenda'], string> = {
  pollera: 'Pollera',
  top: 'Top',
  blusa: 'Blusa',
  vestido: 'Vestido',
};

export default function MisPatrones() {
  const [patrones, setPatrones] = useState<Patron[] | null>(null);

  async function refrescar() {
    setPatrones(await listarPatrones());
  }
  useEffect(() => {
    void refrescar();
  }, []);

  async function borrar(id: string) {
    if (!confirm('¿Borrar este patrón?')) return;
    await eliminarPatron(id);
    await refrescar();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-rosa-700">Mis patrones</h1>
        <Link to="/nuevo" className="btn-primary">
          + Nuevo patrón
        </Link>
      </div>

      {patrones === null && <div className="card text-tinta/60 text-sm">Cargando…</div>}

      {patrones && patrones.length === 0 && (
        <div className="card text-tinta/70 text-sm">
          Todavía no generaste ningún patrón.{' '}
          <Link to="/nuevo" className="text-rosa-600 hover:underline">
            Empezá uno
          </Link>.
        </div>
      )}

      {patrones && patrones.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {patrones.map((p) => (
            <li key={p.id} className="card space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-tinta">
                    {NOMBRE_PRENDA[p.diseno.prenda]} · {p.nombrePerfil}
                  </div>
                  <div className="text-xs text-tinta/60">
                    {new Date(p.createdAt).toLocaleString('es-UY')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => borrar(p.id)}
                  className="text-tinta/50 text-sm hover:text-rosa-700"
                >
                  Borrar
                </button>
              </div>
              <div className="text-xs text-tinta/70">
                {p.diseno.ajuste} · {p.diseno.tela.replace('_', ' ')} · largo {p.diseno.largo} cm · margen{' '}
                {p.diseno.margenCostura} cm
              </div>
              <div className="text-xs text-tinta/50">{p.piezas.length} piezas</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
