# Taskboard — Angular 22 frontend

This is the UI tier of the three-tier Taskboard demo. See the
[repository README](../README.md) for the full architecture, Docker setup and
learning notes.

## Quick commands

```powershell
# Activate the portable Node 26 installation (no admin rights needed)
. ..\scripts\use-node.ps1

npm ci              # install exactly what package-lock.json pins
npm start           # dev server on http://localhost:4300, proxies /api -> :8080
npm run test:ci     # run the Vitest suite once
npm run build       # production build -> dist/frontend/browser
```

## Key ideas

- **Standalone components**, no NgModules.
- **Zoneless** change detection with **signals** and `computed`.
- **Lazy-loaded routes** in `src/app/app.routes.ts`.
- `TaskService` is a stateless `HttpClient` gateway using relative `/api` URLs.
- `proxy.conf.json` handles development; `nginx.conf` handles the container.
- Plain CSS with design tokens in `src/styles.css` — no UI library.

## Structure

```
src/app/
├── app.ts / app.html        shell: header, nav, router outlet
├── app.config.ts            HttpClient, router providers
├── app.routes.ts            lazy routes + page titles
├── tasks/
│   ├── task.model.ts        Types shared with the API contract
│   ├── task.service.ts      HTTP calls
│   ├── task-list.*          list, filter, delete confirmation
│   ├── task-form.*          create + edit with reactive forms
│   └── http-error.ts        Problem Details -> friendly message
└── shared/
    ├── toast.service.ts     signal-based notification store
    ├── toast.*              toast renderer
    └── confirm-dialog.*     native <dialog> modal
```
