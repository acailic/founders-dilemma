import { GameState } from '../../types/game-systems';

// Port of Rust competitor system from src-tauri/src/game/competitors.rs

export interface Competitor {
  id: string;
  name: string;
  market_share: number; // Percentage of market
  funding: number; // Total funding raised
  reputation: number; // 0-100 reputation score
  product_quality: number; // 0-100 product quality
  marketing_spend: number; // Monthly marketing budget
  active: boolean;
  threat_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface CompetitiveLandscape {
  competitors: Competitor[];
  total_market_share: number;
  your_market_share: number;
  competitive_intensity: number; // 0-100
  summary: string;
}

export function updateCompetitors(state: GameState, competitors: Competitor[]): Competitor[] {
  // Update existing competitors
  for (const competitor of competitors) {
    if (!competitor.active) continue;

    // Competitors grow based on their funding and market conditions
    const growth_rate = (competitor.funding / 1000000) * 0.01 + // 1% growth per $1M funding
                       (competitor.reputation / 100) * 0.005 +  // Reputation bonus
                       (Math.random() - 0.5) * 0.02; // Random variance

    competitor.market_share *= (1 + growth_rate);

    // Update threat level based on market share and proximity to player
    competitor.threat_level = calculateThreatLevel(competitor, state);
  }

  // Potentially add new competitors
  if (shouldAddNewCompetitor(state, competitors)) {
    const newCompetitor = generateNewCompetitor(state, competitors);
    competitors.push(newCompetitor);
  }

  // Remove inactive competitors (market share below threshold)
  return competitors.filter(c => c.active && c.market_share >= 0.1);
}

function shouldAddNewCompetitor(state: GameState, competitors: Competitor[]): boolean {
  // Add competitors based on market success and time
  const success_factor = Math.max(0, (state.reputation - 30) / 70); // 0-1 based on reputation
  const time_factor = Math.min(1, state.week / 52); // Increases over first year
  const competitor_density = competitors.length / 10; // Fewer competitors = more likely to add

  const add_probability = (success_factor * time_factor * (1 - competitor_density)) * 0.1;

  return Math.random() < add_probability;
}

function generateNewCompetitor(state: GameState, competitors: Competitor[]): Competitor {
  const competitor_number = competitors.length + 1;
  const names = [
    'TechFlow', 'InnovateCorp', 'NextGen Solutions', 'CloudSync', 'DataDrive',
    'SmartTech', 'FutureWorks', 'AgileSoft', 'ScaleUp', 'Vertex Systems'
  ];

  const name = names[competitor_number % names.length] + (competitor_number > names.length ? ` ${competitor_number}` : '');

  // New competitors are typically smaller but well-funded
  const funding = 500000 + Math.random() * 2000000; // $500K to $2.5M
  const reputation = 30 + Math.random() * 40; // 30-70 reputation
  const product_quality = 40 + Math.random() * 40; // 40-80 quality
  const marketing_spend = 5000 + Math.random() * 15000; // $5K-$20K monthly

  return {
    id: `competitor_${competitor_number}`,
    name,
    market_share: 0.5 + Math.random() * 2, // 0.5-2.5% initial market share
    funding,
    reputation,
    product_quality,
    marketing_spend,
    active: true,
    threat_level: 'Low',
  };
}

function calculateThreatLevel(competitor: Competitor, state: GameState): 'Low' | 'Medium' | 'High' | 'Critical' {
  // Calculate threat based on multiple factors
  const market_share_factor = competitor.market_share / 10; // 10% market share = 1.0
  const funding_factor = Math.min(1, competitor.funding / 5000000); // $5M+ = max threat
  const reputation_factor = competitor.reputation / 100;
  const quality_factor = competitor.product_quality / 100;

  // Your competitive position
  const your_market_share = Math.max(1, state.wau / 1000); // Rough proxy
  const your_funding = Math.max(100000, state.bank); // Minimum $100K assumption
  const your_reputation = state.reputation / 100;
  const your_quality = (100 - state.tech_debt) / 100;

  // Relative threat
  const relative_market = competitor.market_share / your_market_share;
  const relative_funding = competitor.funding / your_funding;
  const relative_reputation = competitor.reputation / state.reputation;
  const relative_quality = competitor.product_quality / ((100 - state.tech_debt) * 100);

  const threat_score = (
    market_share_factor * 0.3 +
    funding_factor * 0.25 +
    reputation_factor * 0.2 +
    quality_factor * 0.15 +
    relative_market * 0.1
  );

  if (threat_score > 1.5) return 'Critical';
  if (threat_score > 1.0) return 'High';
  if (threat_score > 0.7) return 'Medium';
  return 'Low';
}

export function getCompetitiveLandscape(state: GameState, competitors: Competitor[]): CompetitiveLandscape {
  const activeCompetitors = competitors.filter(c => c.active);
  const total_competitor_share = activeCompetitors.reduce((sum, c) => sum + c.market_share, 0);

  // Estimate your market share (rough calculation)
  const your_market_share = Math.min(50, Math.max(0.1, state.wau / 2000)); // Rough proxy

  const competitive_intensity = Math.min(100,
    (activeCompetitors.length * 10) +
    (total_competitor_share * 2) +
    (state.reputation > 60 ? 20 : 0) // More competition in hot markets
  );

  const summary = generateCompetitiveSummary(activeCompetitors, competitive_intensity, state);

  return {
    competitors: activeCompetitors,
    total_market_share: total_competitor_share,
    your_market_share,
    competitive_intensity,
    summary,
  };
}

function generateCompetitiveSummary(competitors: Competitor[], intensity: number, state: GameState): string {
  if (competitors.length === 0) {
    return "No significant competitors in your market yet.";
  }

  let summary = `Facing ${competitors.length} competitor${competitors.length > 1 ? 's' : ''}`;

  const highThreat = competitors.filter(c => c.threat_level === 'High' || c.threat_level === 'Critical');
  if (highThreat.length > 0) {
    summary += `, with ${highThreat.length} posing significant threats`;
  }

  if (intensity > 70) {
    summary += ". Market is highly competitive.";
  } else if (intensity > 40) {
    summary += ". Market competition is moderate.";
  } else {
    summary += ". Market competition is light.";
  }

  // Add specific insights
  const wellFunded = competitors.filter(c => c.funding > 2000000);
  if (wellFunded.length > 0) {
    summary += ` ${wellFunded.length} well-funded competitor${wellFunded.length > 1 ? 's' : ''} present.`;
  }

  return summary;
}

export function calculateCompetitivePressure(state: GameState, landscape: CompetitiveLandscape): number {
  // Calculate how competitors affect your business
  let pressure = landscape.competitive_intensity;

  // Well-funded competitors increase pressure
  const wellFundedCount = landscape.competitors.filter(c => c.funding > 1000000).length;
  pressure += wellFundedCount * 5;

  // High reputation competitors increase pressure
  const reputableCount = landscape.competitors.filter(c => c.reputation > 70).length;
  pressure += reputableCount * 3;

  // Your market position affects perceived pressure
  if (state.reputation > 80) {
    pressure += 10; // Market leaders face more competition
  }

  return Math.min(100, Math.max(0, pressure));
}

export function getCompetitorInsights(state: GameState, landscape: CompetitiveLandscape): string[] {
  const insights: string[] = [];

  if (landscape.competitors.length === 0) {
    insights.push('No significant competitors - focus on product-market fit');
    return insights;
  }

  const pressure = calculateCompetitivePressure(state, landscape);

  if (pressure > 80) {
    insights.push('Extreme competitive pressure - consider differentiation or niche strategy');
  } else if (pressure > 60) {
    insights.push('High competitive pressure - monitor competitor moves closely');
  } else if (pressure > 40) {
    insights.push('Moderate competition - opportunity to gain market share');
  }

  // Funding analysis
  const betterFunded = landscape.competitors.filter(c => c.funding > state.bank * 2);
  if (betterFunded.length > 0) {
    insights.push(`${betterFunded.length} competitor${betterFunded.length > 1 ? 's are' : ' is'} much better funded - fundraising may be crucial`);
  }

  // Market share analysis
  const largerCompetitors = landscape.competitors.filter(c => c.market_share > landscape.your_market_share);
  if (largerCompetitors.length > 0) {
    insights.push(`${largerCompetitors.length} competitor${largerCompetitors.length > 1 ? 's have' : ' has'} larger market share - focus on growth`);
  }

  // Threat analysis
  const criticalThreats = landscape.competitors.filter(c => c.threat_level === 'Critical');
  const highThreats = landscape.competitors.filter(c => c.threat_level === 'High');

  if (criticalThreats.length > 0) {
    const criticalThreat = criticalThreats[0]!;
    insights.push(`Critical threat from ${criticalThreat.name} - immediate strategic response needed`);
  } else if (highThreats.length > 0) {
    insights.push(`High threat from ${highThreats.length} competitor${highThreats.length > 1 ? 's' : ''} - monitor closely`);
  }

  // Opportunity analysis
  const weakCompetitors = landscape.competitors.filter(c => c.threat_level === 'Low' && c.market_share < 5);
  if (weakCompetitors.length > 0) {
    insights.push(`${weakCompetitors.length} weak competitor${weakCompetitors.length > 1 ? 's' : ''} present - opportunity to gain share`);
  }

  return insights;
}

export function simulateCompetitorActions(state: GameState, competitors: Competitor[]): void {
  // Simplified competitor AI - they occasionally take actions that affect the market
  for (const competitor of competitors) {
    if (!competitor.active || Math.random() > 0.1) continue; // 10% chance per week

    // Simulate competitor marketing spend effect
    const marketing_impact = competitor.marketing_spend / 100000; // 1% market share per $100K spend
    competitor.market_share += marketing_impact;

    // Simulate funding rounds (small chance)
    if (Math.random() < 0.05 && competitor.funding < 10000000) {
      const new_funding = competitor.funding * (0.5 + Math.random());
      competitor.funding += new_funding;
      competitor.reputation += 5; // Funding boosts reputation
    }
  }
}

export function getCompetitorSummary(competitor: Competitor): string {
  return `${competitor.name}: ${competitor.market_share.toFixed(1)}% market share, $${(competitor.funding / 1000).toFixed(0)}K funding, ${competitor.threat_level} threat`;
}