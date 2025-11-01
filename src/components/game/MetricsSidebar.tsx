import { Card, Stack, Title, Text, Group, Badge, Progress, Divider, ScrollArea } from '@mantine/core';

interface GameState {
  week: number;
  bank: number;
  burn: number;
  runway_months: number;
  mrr: number;
  wau: number;
  wau_growth_rate: number;
  churn_rate: number;
  morale: number;
  reputation: number;
  nps: number;
  tech_debt: number;
  velocity: number;
  founder_equity: number;
  momentum: number;
  escape_velocity_progress: {
    revenue_covers_burn: boolean;
    growth_sustained: boolean;
    customer_love: boolean;
    founder_healthy: boolean;
    streak_weeks: number;
  };
}

interface MetricsSidebarProps {
  gameState: GameState;
  selectedMetric: string | null;
}

const METRIC_INFO: Record<string, {
  icon: string;
  name: string;
  description: string;
  importance: string;
  tips: string[];
  dangerZone: string;
  targetZone: string;
  realWorldExample: string;
  whyItMatters: string;
  relatedConcepts: string[];
  learnMore: string;
}> = {
  bank: {
    icon: '💰',
    name: 'Cash Reserves',
    description: 'Your current cash in the bank. This is your lifeline - if it reaches $0, game over.',
    importance: 'CRITICAL - Game ending condition',
    tips: [
      'Watch your runway closely (bank / burn)',
      'Fundraise before you run out (needs good reputation)',
      'MRR reduces burn when it exceeds it',
      'Every action costs time, which costs money'
    ],
    dangerZone: 'Less than 3 months runway',
    targetZone: 'At least 6 months runway for safety',
    realWorldExample: 'Instagram had $500k when they launched, burned through it in 8 weeks, then raised $7M from Sequoia. Twitter nearly ran out of cash multiple times before finding product-market fit.',
    whyItMatters: 'Cash is oxygen for startups. Unlike established businesses with predictable revenue, startups burn cash while searching for a scalable business model. Running out means game over - no second chances.',
    relatedConcepts: ['Burn Rate', 'Runway', 'Working Capital', 'Bridge Financing', 'Default Alive vs Default Dead'],
    learnMore: 'Paul Graham\'s "Default Alive or Default Dead" essay explains why founders must know their runway and burn rate at all times. Most startups die from running out of cash, not from competition.'
  },
  burn: {
    icon: '🔥',
    name: 'Monthly Burn Rate',
    description: 'How much cash you spend per month. Increases when you hire, decreases when MRR > Burn.',
    importance: 'HIGH - Determines how long you can survive',
    tips: [
      'Hiring increases burn by $10k/mo per person',
      'Burn is shown weekly (monthly / 4)',
      'When MRR > Burn, you become profitable',
      'Lower burn = longer runway = more time to experiment'
    ],
    dangerZone: 'Burn > 2x your MRR',
    targetZone: 'MRR ≥ Burn (profitability!)',
    realWorldExample: 'Airbnb cut burn from $300k/mo to near-zero during 2008 recession by selling cereal boxes. This gave them runway to pivot. Conversely, WeWork burned $2B/year with no path to profitability, leading to collapse.',
    whyItMatters: 'Burn rate determines your "runway" - how long you can survive. High burn means you need to raise money frequently, giving up equity and control. Low burn gives you time to experiment and find product-market fit.',
    relatedConcepts: ['Unit Economics', 'Gross Margin', 'Operating Leverage', 'Ramen Profitability', 'Blitzscaling'],
    learnMore: 'The trade-off: Bootstrap (low burn, slow growth, keep equity) vs VC-backed (high burn, fast growth, dilution). Neither is "better" - it depends on your market and competitive dynamics.'
  },
  mrr: {
    icon: '💵',
    name: 'Monthly Recurring Revenue',
    description: 'Predictable monthly revenue from customers. Need this ≥ Burn for escape velocity!',
    importance: 'CRITICAL - Win condition component',
    tips: [
      'Grows through Sales Calls (probabilistic)',
      'WAU growth indirectly helps MRR',
      'High reputation improves sales conversion',
      'Need MRR ≥ Burn for 12 weeks to win'
    ],
    dangerZone: 'MRR < 50% of burn',
    targetZone: 'MRR ≥ Burn (escape velocity!)',
    realWorldExample: 'Slack grew MRR from $0 to $12M in first year through viral adoption and word-of-mouth. Netflix pivoted from DVD rentals to streaming, building MRR from subscription model to $30B+ annual revenue.',
    whyItMatters: 'MRR is the holy grail of SaaS metrics. It\'s predictable, compounds over time, and makes your business valuable. Investors value SaaS companies at 10-20x annual recurring revenue. One-time sales lack this multiplier effect.',
    relatedConcepts: ['ARR', 'Net Revenue Retention', 'Customer Lifetime Value (LTV)', 'CAC Payback Period', 'Rule of 40'],
    learnMore: 'SaaS businesses are valued higher because recurring revenue is predictable and compounds. Focus on retention (keeping MRR) as much as acquisition (adding MRR). Churn kills growth!'
  },
  wau: {
    icon: '👥',
    name: 'Weekly Active Users',
    description: 'Number of active users per week. Need ≥10% growth for escape velocity!',
    importance: 'CRITICAL - Win condition component',
    tips: [
      'Ship Quick = highest WAU growth',
      'Ship Balanced = moderate WAU growth',
      'Ship Polish = slowest WAU growth',
      'Churn reduces your user base weekly'
    ],
    dangerZone: 'Negative or stagnant growth',
    targetZone: '≥10% weekly growth (escape velocity!)',
    realWorldExample: 'Facebook grew from 1M to 50M users in one year (2004-2005) through viral college network effects. Instagram hit 1M users in 2 months. Sustainable growth beats viral spikes - Clubhouse had explosive growth but couldn\'t retain users.',
    whyItMatters: 'User growth is the leading indicator of product-market fit. Investors look for "the hockey stick" - sustained exponential growth. But growth without retention is a leaky bucket. You need both acquisition AND engagement.',
    relatedConcepts: ['DAU/MAU Ratio', 'Viral Coefficient', 'Network Effects', 'Growth Loops', 'Product-Led Growth'],
    learnMore: 'Paul Graham: "Make something people want, then get it in front of them." Growth comes from product-market fit first, distribution second. No amount of marketing fixes a product people don\'t love.'
  },
  nps: {
    icon: '⭐',
    name: 'Net Promoter Score',
    description: 'Customer satisfaction metric. Need ≥30 for escape velocity!',
    importance: 'CRITICAL - Win condition component',
    tips: [
      'Tech debt hurts NPS',
      'High velocity helps NPS',
      'Shipping Polish improves NPS faster',
      'Low NPS increases churn rate'
    ],
    dangerZone: 'NPS < 20',
    targetZone: 'NPS ≥ 30 (escape velocity!)',
    realWorldExample: 'Apple consistently scores 70+ NPS. Tesla has 97 NPS - highest in auto industry. Dropbox achieved product-market fit at 40+ NPS. Comcast had negative NPS showing deep customer dissatisfaction.',
    whyItMatters: 'NPS predicts organic growth. High NPS means customers become your sales force through word-of-mouth. Every 10-point NPS increase correlates with 3-7% growth. Low NPS means you\'re fighting churn while trying to grow.',
    relatedConcepts: ['Customer Satisfaction (CSAT)', 'Product-Market Fit', 'Viral Growth', 'Word-of-Mouth Marketing', 'Customer Success'],
    learnMore: 'NPS asks: "Would you recommend us?" Scores 9-10 are promoters, 0-6 detractors. NPS = % promoters - % detractors. Above 30 is good, 50+ is excellent, 70+ is world-class. Focus on delighting customers, not just satisfying them.'
  },
  morale: {
    icon: '💪',
    name: 'Founder Morale',
    description: 'Your mental health and energy. If it reaches 0, you burn out - game over!',
    importance: 'CRITICAL - Game ending condition & win component',
    tips: [
      'Take Break restores morale (+20-30)',
      'Hiring boosts team morale (+5-10)',
      'Sales Calls drain morale (-3-5 per call)',
      'Need morale > 40 for escape velocity'
    ],
    dangerZone: 'Morale < 20',
    targetZone: 'Morale > 40 (escape velocity!)',
    realWorldExample: 'Arianna Huffington collapsed from exhaustion and broke her cheekbone, leading her to write "Thrive" about founder burnout. Many founders report depression and anxiety. Stewart Butterfield (Slack) emphasizes work-life balance as competitive advantage.',
    whyItMatters: 'Founder burnout is real and kills startups. The "hustle culture" glorifies 100-hour weeks, but sustainable pace wins long-term. You can\'t build a great company if you\'re mentally and physically exhausted. Taking breaks is strategic, not lazy.',
    relatedConcepts: ['Founder Mental Health', 'Sustainable Pace', 'Work-Life Integration', 'Burnout Prevention', 'Self-Care as Strategy'],
    learnMore: 'Studies show founders have 2x higher depression rates than general population. Mental health is your most important asset. Schedule breaks, exercise, sleep. Investors prefer healthy founders who can run marathons over sprinters who crash.'
  },
  reputation: {
    icon: '🎖️',
    name: 'Market Reputation',
    description: 'How the market views you. If it drops to 10, your brand is destroyed - game over!',
    importance: 'CRITICAL - Game ending condition & affects fundraising',
    tips: [
      'Ship Polish boosts reputation faster',
      'High reputation improves fundraising odds',
      'Low reputation makes sales harder',
      'Failed fundraising hurts reputation'
    ],
    dangerZone: 'Reputation < 30',
    targetZone: 'Reputation > 70 for good fundraising odds',
    realWorldExample: 'Uber\'s reputation plummeted from scandals and aggressive tactics, making fundraising harder. In contrast, Stripe built stellar reputation through developer advocacy. Your reputation opens or closes doors - investors, customers, talent all check it.',
    whyItMatters: 'Reputation is your social proof and credibility. It takes years to build, moments to destroy. Good reputation = easier fundraising, hiring, sales, partnerships. Bad reputation makes everything harder and more expensive. Protect it fiercely.',
    relatedConcepts: ['Brand Equity', 'Social Capital', 'Network Effects', 'Trust Economy', 'Founder Brand'],
    learnMore: 'Warren Buffett: "It takes 20 years to build a reputation and five minutes to ruin it." In startup world, your reputation travels through investor networks, customer communities, and talent circles. Transparency and integrity compound over time.'
  },
  tech_debt: {
    icon: '⚠️',
    name: 'Technical Debt',
    description: 'Accumulated shortcuts and hacks. Slows velocity and hurts NPS.',
    importance: 'HIGH - Compounds over time',
    tips: [
      'Ship Quick adds tech debt (+6-8)',
      'Ship Polish reduces tech debt (-4-6)',
      'High tech debt hurts velocity',
      'High tech debt hurts NPS (customer bugs)'
    ],
    dangerZone: 'Tech debt > 70',
    targetZone: 'Tech debt < 40 for good velocity',
    realWorldExample: 'Stripe spent 2 years refactoring to pay down tech debt before scaling. Twitter\'s "fail whale" was tech debt from rapid growth. Netscape died partly from rewriting their codebase. Balance is key - some debt is strategic.',
    whyItMatters: 'Tech debt is like financial debt - strategic in moderation, crushing in excess. Early-stage: move fast, accumulate some debt. Growth-stage: pay it down or it compounds. Every hack makes future changes harder and slower.',
    relatedConcepts: ['Code Quality', 'Refactoring', 'Technical Excellence', 'Development Velocity', 'Software Entropy'],
    learnMore: 'Martin Fowler\'s quadrant: Reckless vs Prudent, Deliberate vs Inadvertent. Taking deliberate, prudent debt (ship fast, fix later) is smart. Reckless debt (bad code, no plan to fix) kills companies. Always have a paydown plan.'
  },
  velocity: {
    icon: '⚡',
    name: 'Team Velocity',
    description: 'Productivity multiplier. Affected by morale, tech debt, and team size.',
    importance: 'MEDIUM - Affects feature shipping speed',
    tips: [
      'High morale boosts velocity',
      'High tech debt slows velocity',
      'Hiring increases velocity',
      'Velocity affects NPS (faster fixes)'
    ],
    dangerZone: 'Velocity < 0.8x',
    targetZone: 'Velocity > 1.5x for rapid shipping',
    realWorldExample: 'Amazon\'s "two-pizza teams" maintain high velocity through small, autonomous groups. Spotify\'s squad model optimizes for speed. In contrast, large enterprises slow to 0.5x due to bureaucracy and tech debt.',
    whyItMatters: 'Velocity determines how fast you can iterate, experiment, and respond to customers. High velocity = faster learning cycles. Low velocity = competitors out-ship you. The goal isn\'t just speed, but sustainable speed.',
    relatedConcepts: ['Agile Development', 'DevOps', 'Continuous Deployment', 'Team Autonomy', 'Flow State'],
    learnMore: 'Brooks\' Law: "Adding people to a late project makes it later." Team size doesn\'t linearly increase velocity. Communication overhead grows exponentially. Keep teams small, focused, and empowered for maximum velocity.'
  },
  equity: {
    icon: '📊',
    name: 'Founder Equity',
    description: 'Your ownership percentage. Dilutes when you successfully fundraise.',
    importance: 'MEDIUM - Affects final score',
    tips: [
      'Starts at 85% (15% option pool)',
      'Each successful fundraise dilutes ~15-20%',
      'Bootstrapping (90%+ equity) = legendary achievement',
      'More equity = higher founder score at victory'
    ],
    dangerZone: 'Equity < 25% (lost control)',
    targetZone: 'Depends on strategy: bootstrap (90%+) or VC (<50%)',
    realWorldExample: 'Mark Zuckerberg kept >50% control through multi-class shares. WhatsApp founders sold for $19B with minimal dilution (they bootstrapped). Uber founders diluted to <10% but built a $90B company. Basecamp never raised, kept 100%.',
    whyItMatters: 'Equity represents your ownership and control. More equity = more upside but slower growth. Less equity = faster growth but smaller percentage of larger outcome. Classic trade-off: own 100% of small vs 10% of huge.',
    relatedConcepts: ['Dilution', 'Ownership vs Control', 'Bootstrap vs VC', 'Founder Liquidity', 'Secondary Sales'],
    learnMore: 'Naval Ravikant: "Ownership is better than salary. Equity is better than options." The goal isn\'t maximum equity, it\'s maximum value. Sometimes 10% of $1B (=$100M) beats 100% of $10M. Know when to dilute strategically vs when to bootstrap.'
  }
};

export default function MetricsSidebar({ gameState, selectedMetric }: MetricsSidebarProps) {
  if (!selectedMetric || !METRIC_INFO[selectedMetric]) {
    return (
      <Card withBorder padding="lg" style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
        <Stack gap="md" align="center" style={{ padding: '2rem' }}>
          <Text size="lg">📊</Text>
          <Text size="sm" ta="center" c="dimmed">
            Click on any metric to see detailed information, tips, and strategies
          </Text>
        </Stack>
      </Card>
    );
  }

  const info = METRIC_INFO[selectedMetric];

  // Get current value and calculate status
  let currentValue: number | string = 0;
  let currentPercent = 0;
  let statusColor = 'gray';

  switch (selectedMetric) {
    case 'bank':
      currentValue = `$${(gameState.bank / 1000).toFixed(0)}k`;
      currentPercent = Math.min(100, (gameState.runway_months / 12) * 100);
      statusColor = gameState.runway_months > 6 ? 'green' : gameState.runway_months > 3 ? 'yellow' : 'red';
      break;
    case 'burn':
      currentValue = `$${(gameState.burn / 1000).toFixed(0)}k/mo`;
      currentPercent = Math.min(100, (gameState.mrr / gameState.burn) * 100);
      statusColor = gameState.mrr >= gameState.burn ? 'green' : 'yellow';
      break;
    case 'mrr':
      currentValue = `$${(gameState.mrr / 1000).toFixed(0)}k/mo`;
      currentPercent = Math.min(100, (gameState.mrr / gameState.burn) * 100);
      statusColor = gameState.mrr >= gameState.burn ? 'green' : 'yellow';
      break;
    case 'wau':
      currentValue = gameState.wau.toLocaleString();
      currentPercent = Math.min(100, Math.max(0, 50 + gameState.wau_growth_rate * 5));
      statusColor = gameState.wau_growth_rate >= 10 ? 'green' : gameState.wau_growth_rate > 0 ? 'yellow' : 'red';
      break;
    case 'nps':
      currentValue = gameState.nps.toFixed(0);
      currentPercent = Math.min(100, Math.max(0, gameState.nps));
      statusColor = gameState.nps >= 30 ? 'green' : gameState.nps >= 18 ? 'yellow' : 'red';
      break;
    case 'morale':
      currentValue = `${gameState.morale.toFixed(0)}%`;
      currentPercent = gameState.morale;
      statusColor = gameState.morale > 60 ? 'green' : gameState.morale > 40 ? 'yellow' : 'red';
      break;
    case 'reputation':
      currentValue = `${gameState.reputation.toFixed(0)}%`;
      currentPercent = gameState.reputation;
      statusColor = gameState.reputation > 70 ? 'green' : gameState.reputation > 40 ? 'yellow' : 'red';
      break;
    case 'tech_debt':
      currentValue = gameState.tech_debt.toFixed(0);
      currentPercent = gameState.tech_debt;
      statusColor = gameState.tech_debt < 40 ? 'green' : gameState.tech_debt < 70 ? 'yellow' : 'red';
      break;
    case 'velocity':
      currentValue = `${gameState.velocity.toFixed(2)}x`;
      currentPercent = Math.min(100, gameState.velocity * 50);
      statusColor = gameState.velocity > 1.5 ? 'green' : gameState.velocity > 0.8 ? 'yellow' : 'red';
      break;
    case 'equity':
      currentValue = `${gameState.founder_equity.toFixed(1)}%`;
      currentPercent = gameState.founder_equity;
      statusColor = gameState.founder_equity > 70 ? 'green' : gameState.founder_equity > 40 ? 'yellow' : 'red';
      break;
  }

  return (
    <Card withBorder padding="lg" style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
      <ScrollArea h="calc(100vh - 8rem)">
        <Stack gap="md">
          {/* Header */}
          <Group gap="xs">
            <Text size="xl">{info.icon}</Text>
            <Title order={3} size="h4">{info.name}</Title>
          </Group>

          {/* Current Value */}
          <Card withBorder padding="md" style={{ background: 'var(--fd-surface-2)' }}>
            <Stack gap="xs">
              <Text size="xs" c="dimmed">Current Value</Text>
              <Text size="xl" fw={700}>{currentValue}</Text>
              <Progress value={currentPercent} color={statusColor} size="lg" />
            </Stack>
          </Card>

          <Divider />

          {/* Description */}
          <div>
            <Text size="sm" fw={700} mb="xs">What is this?</Text>
            <Text size="xs">{info.description}</Text>
          </div>

          {/* Importance */}
          <div>
            <Text size="sm" fw={700} mb="xs">Importance</Text>
            <Badge size="lg" color={info.importance.includes('CRITICAL') ? 'red' : 'yellow'}>
              {info.importance}
            </Badge>
          </div>

          <Divider />

          {/* Tips */}
          <div>
            <Text size="sm" fw={700} mb="xs">💡 Strategy Tips</Text>
            <Stack gap="xs">
              {info.tips.map((tip, idx) => (
                <Text key={idx} size="xs">• {tip}</Text>
              ))}
            </Stack>
          </div>

          <Divider />

          {/* Zones */}
          <div>
            <Text size="sm" fw={700} mb="xs">⚠️ Danger Zone</Text>
            <Text size="xs" c="red">{info.dangerZone}</Text>
          </div>

          <div>
            <Text size="sm" fw={700} mb="xs">🎯 Target Zone</Text>
            <Text size="xs" c="green">{info.targetZone}</Text>
          </div>

          <Divider />

          {/* Real World Example */}
          <div>
            <Text size="sm" fw={700} mb="xs">🌍 Real World Example</Text>
            <Text size="xs" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
              {info.realWorldExample}
            </Text>
          </div>

          <Divider />

          {/* Why It Matters */}
          <div>
            <Text size="sm" fw={700} mb="xs">🔑 Why This Matters</Text>
            <Text size="xs" style={{ lineHeight: 1.6 }}>
              {info.whyItMatters}
            </Text>
          </div>

          <Divider />

          {/* Related Concepts */}
          <div>
            <Text size="sm" fw={700} mb="xs">📚 Related Concepts</Text>
            <Group gap="xs">
              {info.relatedConcepts.map((concept, idx) => (
                <Badge key={idx} size="sm" variant="light" color="blue">
                  {concept}
                </Badge>
              ))}
            </Group>
          </div>

          <Divider />

          {/* Learn More */}
          <div>
            <Text size="sm" fw={700} mb="xs">🎓 Learn More</Text>
            <Text size="xs" style={{ lineHeight: 1.6, background: 'var(--fd-surface-2)', padding: '8px', borderRadius: '8px' }}>
              {info.learnMore}
            </Text>
          </div>
        </Stack>
      </ScrollArea>
    </Card>
  );
}
