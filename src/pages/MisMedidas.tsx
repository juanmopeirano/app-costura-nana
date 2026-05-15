import { Link } from 'react-router-dom';

export default function MisMedidas() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-rosa-700">Mis medidas</h1>
        <Link to="/medidas/nueva" className="btn-primary">+ Nuevo perfil</Link>
      </div>
      <div className="card text-tinta/60 text-sm">
        Todavía no tenés perfiles guardados. Creá uno para empezar.
      </div>
    </div>
  );
}
