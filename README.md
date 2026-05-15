# Costura Nana 🧵

App web gratuita de patronaje personalizado: tomá tus medidas, elegí una prenda, descargá un patrón A4 listo para imprimir.

**Estado**: en construcción (Etapa 0 — scaffolding).

## Alcance V1

- Prendas femeninas simples: top, blusa, pollera, vestido simple
- Wizard guiado de 20 medidas corporales con ilustraciones
- Foto de diseño como referencia visual
- Selección de escote, manga, largo, ajuste, tela y cierre
- Patrón generado paramétricamente desde las medidas
- PDF A4 con escala 1:1, margen de costura, piquetes, dirección de hilo y cuadro de calibración
- Todo local (IndexedDB): sin servidor ni cuenta

## Base técnica

Stack: React 19 + Vite + TypeScript + Tailwind + Zustand + idb-keyval + pdf-lib.
Hosting: GitHub Pages (deploy automático con Actions).

Referencia de patronaje: Manual de Patronaje Básico — SENA Colombia 2011 (CC BY-NC-SA 4.0).

## Desarrollo local

```bash
npm install
npm run dev          # servidor de desarrollo
npm test             # tests unitarios
npm run build        # build de producción
npm run preview      # preview del build
```

El proyecto se publica en `https://<usuario>.github.io/<repo>/` automáticamente al hacer `push` a `main`.

## Estructura

```
src/
  pages/           Inicio, MisMedidas, MedidasWizard, NuevoProyecto, MisPatrones
  components/      Componentes reutilizables (medida input, wizard, preview...)
  lib/
    patrones/      Motor de patronaje (bases corpiño/manga/falda + transformaciones)
    medidas/       Catálogo de medidas + validación
    pdf/           Exportador A4 con tiler y marcas de calibración
    storage/       Persistencia IndexedDB
    utils/         Helpers (id, unidades)
tests/             Tests con Vitest
```

## Licencia

Código MIT. La metodología de patronaje se basa en el manual del SENA (CC BY-NC-SA 4.0).
