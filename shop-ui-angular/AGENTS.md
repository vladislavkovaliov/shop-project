# shop-ui-angular

Angular 21.2 CLI scaffold — standalone components, SSR, Tailwind v4, Vitest.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `ng serve` (port 4200) |
| Build (SSR) | `ng build` → `dist/shop-ui-angular/{browser,server}/` |
| SSR server | `node dist/shop-ui-angular/server/server.mjs` (port 4000) |
| Test (Vitest) | `ng test` |
| Format | `npx prettier --write .` |

## Framework & quirks

- **Standalone components only** — no `NgModule`. Generated via `ng generate component`.
- **SSR** via `@angular/ssr` + Express (`src/server.ts`). All routes prerendered by default (`RenderMode.Prerender`).
- **Tailwind CSS v4** via PostCSS plugin (`@tailwindcss/postcss`). Global import in `src/styles.css`: `@import 'tailwindcss'`. No `tailwind.config.*` — use inline `@theme` directives.
- **Vitest** (not Karma/Jasmine). Test runner configured by `@angular/build:unit-test` builder — no `vitest.config.ts`. Globals (`describe`, `it`, `expect`) available without imports (`vitest/globals` in `tsconfig.spec.json`).
- **Prettier** only formatter — `printWidth: 100`, `singleQuote`, `angular` parser for HTML (`npx prettier --write .`). No ESLint.
- **Strict TypeScript** (`strict`, `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` all on).
- **No CI/CD**, no git hooks, no task runner config found.
