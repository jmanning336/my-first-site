# HANDOFF.md

## Current Goal
Build a sports betting edge dashboard (EdgeBoard) that shows NBA, MLB, NHL betting trends ranked by potential edge.

## Progress
- Landing page with project cards — DONE
- Express server + API routes — DONE
- The Odds API integration (odds, arbitrage, spreads) — DONE
- Edge ranking algorithm (scores 0-100) — DONE
- Dashboard UI with sport filters, sortable table, stats bar — DONE
- Edge Score explainer panel — DONE
- Railway deployment — IN PROGRESS (build failing, see "What Didn't Work")

## What Didn't Work
- Railway build fails with `secret ODDS_API_KEY: not found`
- Railpack auto-detects env vars and requires them as build-time secrets
- Adding the variable in Railway's Variables tab didn't fix it
- Got a second error: `invalid key-value pair "= ODDS_API_KEY=..."` suggesting the variable was entered with an extra = or space
- Need to: delete the variable in Railway, re-add it cleanly, and possibly configure it as a build secret too

## Not Yet Built
- PostgreSQL database (planned for Railway)
- Line movement tracking over time
- Public vs sharp money indicators
- ATS / O/U historical trends
- Sports betting news feed
- SharpAPI integration for +EV detection
- Search history / saved queries

## Next Steps
1. Fix Railway deployment (resolve the build secret issue)
2. Add PostgreSQL database on Railway
3. Add more data signals to the edge ranker
4. Add news feed
5. Add SharpAPI as second data source
