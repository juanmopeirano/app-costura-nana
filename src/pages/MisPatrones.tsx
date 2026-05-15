import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarPatron, listarPatrones } from '../lib/storage/patrones';
import type { Patron } from '../lib/patrones/tipos';
import ThumbnailPatron from '../components/ThumbnailPatron';

const NOMBRE_PRENDA: Record<Patron['diseno']['prenda'], string> = {
  pollera: 'Pollera',
  top: 'Top',
  blusa: 'Blusa',
  vestido: 'Vestido',
};

export default function MisPatrones() {
  const navigate = useNavigate();
  const [patrones, setPatrones] = useState<Patron[] | null>(null);
  const [exportandoId, setExportandoId] = useState<string | null>(null);

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

  async function descargar(p: Patron) {
    setExportandoId(p.id);
    try {
      const { exportarPatronPDF, descargarPDF } = await import('../lib/pdf/exportar');
      const bytes = await exportarPatronPDF(p);
      const fecha = new Date(p.createdAt).toISOString().slice(0, 10);
      const nombre = `patron-${p.diseno.prenda}-${p.nombrePerfil}-${fecha}.pdf`
        .replace(/\s+/g, '_')
        .toLowerCase();
      descargarPDF(bytes, nombre);
    } catch (e) {
      alert(`Error generando PDF: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setExportandoId(null);
    }
  }

  function editar(p: Patron) {
    navigate(`/nuevo?id=${p.id}`);
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
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patrones.map((p) => (
            <li key={p.id} className="card !p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-tinta">
                    {NOMBRE_PRENDA[p.diseno.prenda]}
                  </div>
                  <div className="text-xs text-tinta/60">
                    {p.nombrePerfil} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString('es-UY', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>
                </div>
                {p.diseno.fotoReferencia && (
                  <img
                    src={p.diseno.fotoReferencia}
                    alt=""
                    className="w-10 h-10 rounded object-cover border border-rosa-100"
                  />
                )}
              </div>
              <div className="bg-marfil rounded-lg p-2 h-32 flex items-center justify-center">
                <ThumbnailPatron patron={p} />
              </div>
              <div className="text-[11px] text-tinta/60 space-y-0.5">
                <div>{p.diseno.ajuste} · {p.diseno.tela.replace('_', ' ')} · {p.diseno.largo}cm</div>
                <div>
                  {p.diseno.prenda !== 'pollera' && `escote ${p.diseno.escote} · `}
                  {p.diseno.prenda !== 'pollera' && p.diseno.manga !== 'sin' && `manga ${p.diseno.manga} · `}
                  margen {p.diseno.margenCostura}cm · {p.piezas.length} piezas
                </div>
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  type="button"
                  className="btn-primary text-xs flex-1 !py-1.5"
                  onClick={() => descargar(p)}
                  disabled={exportandoId === p.id}
                >
                  {exportandoId === p.id ? '…' : 'PDF'}
                </button>
                <button
                  type="button"
                  className="btn-outline text-xs flex-1 !py-1.5"
                  onClick={() => editar(p)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs !py-1.5"
                  onClick={() => borrar(p.id)}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
