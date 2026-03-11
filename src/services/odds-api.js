// Service for The Odds API — fetches odds from multiple bookmakers
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

const SPORT_KEYS = {
  nba: 'basketball_nba',
  mlb: 'baseball_mlb',
  nhl: 'icehockey_nhl'
};

const BOOKMAKERS = 'fanduel,draftkings,betmgm,pointsbet,caesars,wynn';

async function fetchOdds(sport, apiKey) {
  const sportKey = SPORT_KEYS[sport];
  if (!sportKey) throw new Error(`Unknown sport: ${sport}`);

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&bookmakers=${BOOKMAKERS}&oddsFormat=american`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Odds API error (${res.status}): ${text}`);
  }

  const remaining = res.headers.get('x-requests-remaining');
  console.log(`[Odds API] Requests remaining this month: ${remaining}`);

  return res.json();
}

// Detect arbitrage opportunities from odds data
function findArbitrageOpportunities(games) {
  const arbs = [];

  for (const game of games) {
    if (!game.bookmakers || game.bookmakers.length < 2) continue;

    // Check h2h (moneyline) markets
    const h2hBooks = game.bookmakers.filter(b =>
      b.markets.some(m => m.key === 'h2h')
    );

    if (h2hBooks.length < 2) continue;

    // Collect best odds for each outcome
    const bestOdds = {};
    const bestBooks = {};

    for (const book of h2hBooks) {
      const h2h = book.markets.find(m => m.key === 'h2h');
      if (!h2h) continue;

      for (const outcome of h2h.outcomes) {
        const american = outcome.price;
        const decimal = americanToDecimal(american);

        if (!bestOdds[outcome.name] || decimal > bestOdds[outcome.name]) {
          bestOdds[outcome.name] = decimal;
          bestBooks[outcome.name] = book.title;
        }
      }
    }

    const outcomes = Object.keys(bestOdds);
    if (outcomes.length === 2) {
      const impliedTotal = outcomes.reduce(
        (sum, name) => sum + (1 / bestOdds[name]), 0
      );

      if (impliedTotal < 1) {
        const profitPercent = ((1 / impliedTotal) - 1) * 100;
        arbs.push({
          type: 'arbitrage',
          sport: game.sport_key,
          game: `${game.away_team} @ ${game.home_team}`,
          commence: game.commence_time,
          profitPercent,
          legs: outcomes.map(name => ({
            outcome: name,
            bestOdds: decimalToAmerican(bestOdds[name]),
            bookmaker: bestBooks[name]
          }))
        });
      }
    }
  }

  return arbs;
}

// Detect odds spreads (discrepancies between bookmakers)
function findOddsSpreads(games) {
  const spreads = [];

  for (const game of games) {
    if (!game.bookmakers || game.bookmakers.length < 2) continue;

    for (const market of ['h2h', 'spreads', 'totals']) {
      const booksWithMarket = game.bookmakers.filter(b =>
        b.markets.some(m => m.key === market)
      );

      if (booksWithMarket.length < 2) continue;

      // Get all outcomes and find the max spread for each
      const outcomeOdds = {};

      for (const book of booksWithMarket) {
        const mkt = book.markets.find(m => m.key === market);
        if (!mkt) continue;

        for (const outcome of mkt.outcomes) {
          const key = outcome.name + (outcome.point !== undefined ? `_${outcome.point}` : '');
          if (!outcomeOdds[key]) outcomeOdds[key] = [];
          outcomeOdds[key].push({
            price: outcome.price,
            point: outcome.point,
            bookmaker: book.title,
            name: outcome.name
          });
        }
      }

      for (const [key, odds] of Object.entries(outcomeOdds)) {
        if (odds.length < 2) continue;
        const prices = odds.map(o => o.price);
        const spread = Math.max(...prices) - Math.min(...prices);

        if (spread >= 15) {
          const best = odds.reduce((a, b) => a.price > b.price ? a : b);
          const worst = odds.reduce((a, b) => a.price < b.price ? a : b);

          spreads.push({
            type: 'odds_spread',
            sport: game.sport_key,
            game: `${game.away_team} @ ${game.home_team}`,
            commence: game.commence_time,
            market,
            outcome: odds[0].name,
            point: odds[0].point,
            oddsSpread: spread,
            bestOdds: best.price,
            bestBook: best.bookmaker,
            worstOdds: worst.price,
            worstBook: worst.bookmaker
          });
        }
      }
    }
  }

  return spreads;
}

function americanToDecimal(american) {
  if (american > 0) return (american / 100) + 1;
  return (100 / Math.abs(american)) + 1;
}

function decimalToAmerican(decimal) {
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

module.exports = { fetchOdds, findArbitrageOpportunities, findOddsSpreads, SPORT_KEYS };
