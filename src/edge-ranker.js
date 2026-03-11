// Edge Ranker — scores betting opportunities by potential edge
// Higher score = more interesting for a sports bettor

function calculateEdgeScore(opportunity) {
  let score = 0;
  const factors = [];

  // Arbitrage opportunities get the highest base score
  if (opportunity.type === 'arbitrage') {
    score += 80 + (opportunity.profitPercent * 10); // 80-100 range
    factors.push(`Arb: ${opportunity.profitPercent.toFixed(1)}% profit`);
    return { score: Math.min(score, 100), factors, tier: 'arb' };
  }

  // Line movement — big moves suggest sharp action
  if (opportunity.lineMovement) {
    const move = Math.abs(opportunity.lineMovement);
    if (move >= 2) {
      score += 30;
      factors.push(`Major line move: ${move > 0 ? '+' : ''}${opportunity.lineMovement}`);
    } else if (move >= 1) {
      score += 15;
      factors.push(`Notable line move: ${opportunity.lineMovement}`);
    }
  }

  // Odds discrepancy across books — bigger spread = more opportunity
  if (opportunity.oddsSpread) {
    if (opportunity.oddsSpread >= 40) {
      score += 25;
      factors.push(`Wide odds spread across books: ${opportunity.oddsSpread}`);
    } else if (opportunity.oddsSpread >= 20) {
      score += 15;
      factors.push(`Moderate odds spread: ${opportunity.oddsSpread}`);
    }
  }

  // Public vs sharp divergence
  if (opportunity.publicPercent && opportunity.publicPercent > 70) {
    score += 20;
    factors.push(`${opportunity.publicPercent}% public on one side — potential fade`);
  }

  // Closing line value indicator
  if (opportunity.clvIndicator) {
    score += 15;
    factors.push('Closing line value detected');
  }

  // Determine tier
  let tier = 'low';
  if (score >= 60) tier = 'high';
  else if (score >= 35) tier = 'medium';

  return { score: Math.min(score, 100), factors, tier };
}

function rankOpportunities(opportunities) {
  return opportunities
    .map(opp => ({
      ...opp,
      edge: calculateEdgeScore(opp)
    }))
    .sort((a, b) => b.edge.score - a.edge.score);
}

module.exports = { calculateEdgeScore, rankOpportunities };
