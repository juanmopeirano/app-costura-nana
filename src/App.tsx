import { NavLink, Route, Routes } from 'react-router-dom';
import Inicio from './pages/Inicio';
import MedidasWizard from './pages/MedidasWizard';
import MisMedidas from './pages/MisMedidas';
import NuevoProyecto from './pages/NuevoProyecto';
import MisPatrones from './pages/MisPatrones';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-rosa-100 text-rosa-700' : 'text-tinta/70 hover:bg-rosa-50'
  }`;

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-rosa-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧵</span>
            <span className="font-display text-xl text-rosa-700">Costura Nana</span>
          </NavLink>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/nuevo" className={linkClass}>Nuevo proyecto</NavLink>
            <NavLink to="/medidas" className={linkClass}>Mis medidas</NavLink>
            <NavLink to="/patrones" className={linkClass}>Mis patrones</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/medidas" element={<MisMedidas />} />
            <Route path="/medidas/nueva" element={<MedidasWizard />} />
            <Route path="/medidas/:id" element={<MedidasWizard />} />
            <Route path="/nuevo" element={<NuevoProyecto />} />
            <Route path="/patrones" element={<MisPatrones />} />
          </Routes>
        </div>
      </main>
      <footer className="border-t border-rosa-100 py-4">
        <div className="mx-auto max-w-5xl px-4 text-xs text-tinta/50">
          Hecho con ❤️ — basado en el manual SENA de Patronaje Básico (CC BY-NC-SA 4.0).
        </div>
      </footer>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-rosa-100 px-2 py-2 flex justify-around">
        <NavLink to="/nuevo" className={linkClass}>Nuevo</NavLink>
        <NavLink to="/medidas" className={linkClass}>Medidas</NavLink>
        <NavLink to="/patrones" className={linkClass}>Patrones</NavLink>
      </nav>
    </div>
  );
}
