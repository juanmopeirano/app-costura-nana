import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarPatron, listarPatrones } from '../lib/storage/patrones';
import type { Patron } from '../lib/patrones/tipos';
import ThumbnailPatron from '../components/ThumbnailPatron';
import {
  IconArchive,
  IconDownload,
  IconEdit,
  IconPlus,
  IconTrash,
} from '../components/Icon';

const NOMBRE_PRENDA: Record<Patron['diseno']['prenda'], string> = {
  pollera: 'Pollera',
  top: 'Top',
  blusa: 'Blusa',
  vestido: 'Vestido',
  pantalon: 'Pantalón',
};

export default function MisPatrones() {
  const navigate = useNavigate();
  const [patrones, setPatrones] = useState<Patron[] | null>(null);
  const [exportandoId, setExportandoId] = useState<string | null>(null);

  async function refrescar() {
    setPatrones(await listarPatrones());
  }
  useEffect(() => {
    let vivo = true;
    void listarPatrones().then((p) => {
      if (vivo) setPatrones(p);
    });
    return () => {
      vivo = false;
    };
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Tu archivo</p>
          <h1 className="font-display text-4xl text-tinta-900">Mis patrones</h1>
        </div>
        <Link to="/nuevo" className="btn-primary">
          <IconPlus size={16} /> Nuevo patrón
        </Link>
      </header>

      {patrones === null && (
        <div className="card text-tinta-600 text-sm">Cargando…</div>
      )}

      {patrones && patrones.length === 0 && (
        <div className="card-stitched text-center py-12 px-4 space-y-4">
          <div className="text-baya-300 mx-auto w-fit">
            <IconArchive size={48} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-tinta-900 mb-1">
              Sin patrones todavía
            </h2>
            <p className="text-sm text-tinta-600 max-w-sm mx-auto">
              Acá se va a archivar cada patrón que generes, con miniatura y
              opción de re-descargar el PDF o editarlo.
            </p>
          </div>
          <Link to="/nuevo" className="btn-primary inline-flex">
            <IconPlus size={16} /> Crear el primero
          </Link>
        </div>
      )}

      {patrones && patrones.length > 0 && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patrones.map((p) => (
            <li key={p.id} className="card !p-0 overflow-hidden hover:shadow-paper-lg transition">
              <div className="relative bg-crema-100 h-40 flex items-center justify-center p-4 border-b border-baya-100 bg-paper-grid bg-grid-mm">
                <ThumbnailPatron patron={p} />
                {p.diseno.fotoReferencia && (
                  <img
                    src={p.diseno.fotoReferencia}
                    alt=""
                    className="absolute top-2 right-2 w-12 h-12 rounded-lg object-cover border border-baya-200 shadow-paper"
                  />
                )}
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-wider text-tinta-500">
                  {p.piezas.length} piezas
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xl text-tinta-900 leading-tight">
                      {NOMBRE_PRENDA[p.diseno.prenda]}
                    </div>
                    <p className="text-xs text-tinta-500">
                      {p.nombrePerfil} ·{' '}
                      {new Date(p.createdAt).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{p.diseno.ajuste}</Chip>
                  <Chip>{p.diseno.tela.replace('_', ' ')}</Chip>
                  <Chip>{p.diseno.largo}cm</Chip>
                  {p.diseno.prenda !== 'pollera' && <Chip>{p.diseno.escote}</Chip>}
                  {p.diseno.prenda !== 'pollera' && p.diseno.manga !== 'sin' && (
                    <Chip>manga {p.diseno.manga}</Chip>
                  )}
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-baya-50">
                  <button
                    type="button"
                    className="btn-primary flex-1 !px-3 !py-1.5 text-sm"
                    onClick={() => descargar(p)}
                    disabled={exportandoId === p.id}
                  >
                    {exportandoId === p.id ? (
                      '…'
                    ) : (
                      <>
                        <IconDownload size={14} /> PDF
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-outline !px-3 !py-1.5 text-sm"
                    onClick={() => navigate(`/nuevo?id=${p.id}`)}
                  >
                    <IconEdit size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1.5 text-sm text-tinta-500 hover:text-baya-700"
                    onClick={() => borrar(p.id)}
                    aria-label="Borrar"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-crema-200 text-tinta-700">
      {children}
    </span>
  );
}
