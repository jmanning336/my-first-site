# CLAUDE.md

## Project Overview
Sports betting edge dashboard ("EdgeBoard") built with Node.js + Express.
Deployed on Railway. Pulls live odds from The Odds API for NBA, MLB, NHL.

## Key Commands
- `npm start` — start server on port 3000
- `npm run dev` — same as start (for local development)
- Node/npm path: `/opt/homebrew/bin/node` and `/opt/homebrew/bin/npm`

## Architecture
- `server.js` — Express server entry point
- `public/` — static files (index.html landing page, dashboard.html)
- `src/api/odds.js` — API routes for /api/edges and /api/odds
- `src/services/odds-api.js` — The Odds API client, arbitrage + spread detection
- `src/edge-ranker.js` — scoring algorithm that ranks opportunities 0-100
- `.env` — API keys (never commit)

## APIs
- The Odds API (key in .env as ODDS_API_KEY) — odds from FanDuel, DraftKings, BetMGM, PointsBet, Caesars, Wynn

## Deployment
- Railway auto-deploys from `main` branch
- Railway URL: my-first-site-production-e576.up.railway.app
- Environment variables must be set in Railway Variables tab
- GitHub: github.com/jmanning336/my-first-site

## Style Rules
- No frameworks — vanilla HTML/CSS/JS on frontend
- Dark theme, CSS custom properties for colors
- Mobile responsive
- Keep it simple — Express + pg only on backend

## Important Constraints
- Never commit .env or API keys
- Cache API responses (10 min) to preserve free tier credits (500/month)
- Jeff is a total beginner — explain concepts clearly
