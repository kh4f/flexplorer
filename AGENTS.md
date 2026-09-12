# AGENTS.md

**Flexplorer** is an Obsidian plugin that enhances the file explorer with custom sorting, pinning, and hiding.

## Stack
- TypeScript v6
- React v19
- Voicss (CSS-in-TS)
- tsdown (build)
- Bun (package management)

## Architecture
- core layer (`src/core/`): DnD engine, order management, explorer observation, and patching logic
- UI layer (`src/ui/`): React components and Obsidian views

## Scripts
- `bun dev` — development build in watch mode
- `bun run build` — production build
- `bun lint` — linting

## Guidelines
- Run `bun lint` after making changes