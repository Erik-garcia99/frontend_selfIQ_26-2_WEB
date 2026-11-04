# SelfIQ Web

React + Vite (JavaScript) · React Router · CSS Modules. Consume el mismo backend FastAPI que la app móvil.

## Arrancar

```bash
npm install
cp .env.example .env      # y ajusta VITE_API_URL
npm run dev               # http://localhost:5173
```

## Variables (.env)
| Variable | Ejemplo |
|---|---|
| `VITE_API_URL` | `http://localhost:8000` (local) · `https://tu-backend.up.railway.app` (producción) |

Tras cambiar el `.env` hay que reiniciar `npm run dev`.

## Scripts
`npm run dev` · `npm run build` (genera `dist/`) · `npm run preview`

## Estructura
```
src/
  app/          router.jsx (rutas) · guards.jsx (público / privado / por rol)
  layouts/      AuthLayout · DashboardLayout (sidebar + topbar)
  components/   Button Field Card/Badge/Notice Modal FeedbackDialog Toast Icon Logo PageHeader
  pages/        auth/ (Login, Register, Recovery) · shared/Placeholder (fases siguientes)
  services/ context/ utils/ config/   <- lógica copiada del móvil
  styles/       tokens.css (paleta) · base.css
```

## Cambios respecto al móvil
- `config/env.js`: `EXPO_PUBLIC_API_URL` -> `VITE_API_URL`, `__DEV__` -> `import.meta.env.DEV`.
- `utils/appState.js`: sustituto de `AppState` (usa la visibilidad de la pestaña) para el polling.
- `context/AuthContext.jsx`: la sesión se guarda en `sessionStorage` y se valida con `/auth/me` al recargar.
- Rutas reales con URL (`/login`, `/inicio`, `/dispositivos`...) en lugar de `useState('home')`.

## Despliegue
`vercel.json` y `public/_redirects` ya incluyen la reescritura a `index.html` que necesita una SPA.
