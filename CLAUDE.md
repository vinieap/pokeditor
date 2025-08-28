# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React Router 7 application deployed on Cloudflare Workers named "pokeditor". It appears to be a Pokémon data editor with extensive data files for various Pokémon game elements including trainers, moves, items, encounters, and tournament configurations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with HMR on http://localhost:5173
npm run dev

# Build for production
npm run build

# Type checking and validation
npm run typecheck

# Full validation: TypeScript check + build + dry-run deploy
npm run check

# Generate Cloudflare binding types
npm run cf-typegen

# Preview production build locally
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

## Architecture Overview

### Core Stack
- **Framework**: React Router 7 with file-based routing and SSR
- **Runtime**: Cloudflare Workers (edge deployment)
- **Language**: TypeScript with strict mode enabled
- **Styling**: TailwindCSS v4 (configured via Vite plugin)
- **Build Tool**: Vite with Cloudflare plugin

### Project Structure
- `workers/app.ts` - Cloudflare Worker entry point that handles requests
- `app/root.tsx` - React application root with layout and error boundaries
- `app/routes/` - File-based routes (React Router 7 convention)
- `data/` - Extensive Pokémon data files (trainers, moves, items, encounters, etc.)
- `public/` - Static assets served directly

### Key Technical Details
- **SSR**: Server-side rendering is enabled via `react-router.config.ts`
- **Context**: Cloudflare environment variables and execution context available via `context.cloudflare.env` in loaders
- **Type Safety**: Strict TypeScript with route-specific type generation
- **Observability**: Monitoring enabled in production via Cloudflare

### Data Files
The `/data` directory contains numerous `.txt` files with Pokémon game data:
- `pokemon.txt`, `pokemonforms.txt` - Pokémon species data
- `trainers.txt`, `trainertypes.txt`, `trainerlists.txt` - Trainer configurations
- `moves.txt`, `shadowmoves.txt` - Move data
- `items.txt`, `abilities.txt` - Game items and abilities
- Various tournament configurations (pikacup, pokecup, littlecup, fancycup)
- `encounters.txt`, `connections.txt`, `townmap.txt` - World/map data

### Deployment Configuration
- **Wrangler Config**: `wrangler.json` defines the Worker name, compatibility date, and environment variables
- **Compatibility**: Uses `nodejs_compat` flag for Node.js API compatibility
- **Source Maps**: Enabled for better debugging in production