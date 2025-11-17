# Repository Guidelines

## Project Structure & Module Organization
Application code resides in `src/`: feature pages in `src/pages`, shared widgets in `src/components`, layouts in `src/layouts`, and REST helpers in `src/services`. Assets and SCSS stay in `src/assets` and `src/css`. Documentation for onboarding, bugs, and QA is in `docs/`; cite the exact file you update. Browser-facing HTML lives in `public/`, while `mock-server.js` and `test-print-server.js` mirror the ticket API and printer bridge. Keep configuration changes limited to `quasar.config.js`.

## Build, Test, and Development Commands
- `npm install`: install dependencies declared in `package.json`.
- `npm run dev` (or `./start-dev.sh`): run the Quasar dev server at `http://localhost:9000`.
- `node mock-server.js`: spin up the local REST stub used by both kiosk and admin views.
- `npm run build`: emit production assets in `dist/`.
- `npm run lint`: execute ESLint with the Vue plugin across `src/` and scripts.
- `npm run format`: apply shared Prettier settings (`.js`, `.vue`, `.scss`, `.md`, `.json`).
- `node test-print-server.js`: emulate badge printer callbacks during manual QA.

## Coding Style & Naming Conventions
Default to 2-space indentation and `<script setup>` in Vue SFCs. Components/layouts follow PascalCase (`SelfPrintPage.vue`), helpers use camelCase, and SCSS variables stay kebab-case. Favor Quasar components before raw HTML so layouts remain kiosk-safe. Always run `npm run format` then `npm run lint`, and add inline comments only when behavior is non-obvious.

## Testing Guidelines
Scenario scripts live in `docs/testing/`; update them when you alter forms, polling, or admin filters. Place Vue Test Utils or Pinia specs beside the module with the `*.spec.js` suffix. Before review, run `npm run lint`, keep the mock server online, and exercise both kiosk and admin flows via `test-preview.html` to confirm the 3-second printer status poll.

## Commit & Pull Request Guidelines
Commits follow the existing Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) with concise Chinese descriptions when user behavior shifts. Keep one logical change per commit. PRs should include a summary, screenshots for UI tweaks, linked issue IDs, and the commands/tests executed; highlight any docs or config updates so kiosk deploy notes stay fresh.

## Environment & Mocking Tips
Never commit `.env` values; inject runtime config through `quasar.config.js` and document new flags in `docs/guide/START.md`. When adding API fields, update `src/services/api.js`, `mock-server.js`, and `test-print-server.js` in the same PR so QA remains reproducible. Stick to the provided mock servers—custom scripts make kiosk regressions hard to reproduce.
