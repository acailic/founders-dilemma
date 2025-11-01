import { Text, Stack, Divider, Group, Badge } from '@mantine/core';

interface EnhancedTooltipProps {
  title: string;
  icon: string;
  description: string;
  currentValue: string;
  goodRange: string;
  badRange: string;
  tip: string;
  relatedMetrics?: string[];
}

export default function EnhancedTooltip({
  title,
  icon,
  description,
  currentValue,
  goodRange,
  badRange,
  tip,
  relatedMetrics = [],
}: EnhancedTooltipProps) {
  return (
    <Stack gap="xs" style={{ maxWidth: '300px' }}>
      <Group gap="xs">
        <Text size="lg">{icon}</Text>
        <Text fw={700} size="sm">
          {title}
        </Text>
      </Group>

      <Text size="xs" c="dimmed">
        {description}
      </Text>

      <Divider />

      <Stack gap={4}>
        <Text size="xs">
          <strong>Current:</strong> {currentValue}
        </Text>
        <Text size="xs" c="green">
          <strong>Healthy:</strong> {goodRange}
        </Text>
        <Text size="xs" c="red">
          <strong>Critical:</strong> {badRange}
        </Text>
      </Stack>

      <Divider />

      <Text size="xs" c="blue" style={{ fontStyle: 'italic' }}>
        💡 {tip}
      </Text>

      {relatedMetrics.length > 0 && (
        <>
          <Divider />
          <Stack gap={4}>
            <Text size="xs" fw={600} c="dimmed">
              Related Metrics:
            </Text>
            <Group gap={4}>
              {relatedMetrics.map((metric) => (
                <Badge key={metric} size="xs" variant="light" color="gray">
                  {metric}
                </Badge>
              ))}
            </Group>
          </Stack>
        </>
      )}
    </Stack>
  );
}

// Tooltip content for each metric
export const TOOLTIP_CONTENT = {
  bank: {
    title: 'Bank',
    icon: '💰',
    description: 'Total cash available to spend',
    goodRange: '> $30,000 (6+ months runway)',
    badRange: '< $10,000 (< 2 months runway)',
    tip: 'Maintain 6+ months runway to avoid panic fundraising',
    relatedMetrics: ['Burn Rate', 'Runway', 'MRR'],
  },
  burn: {
    title: 'Burn Rate',
    icon: '🔥',
    description: 'Monthly cash spending rate',
    goodRange: '< 50% of bank reserves',
    badRange: '> 80% of bank reserves',
    tip: 'Lower burn extends runway; higher burn speeds up progress',
    relatedMetrics: ['Bank', 'Runway', 'Velocity'],
  },
  runway: {
    title: 'Runway',
    icon: '⏰',
    description: 'Months until you run out of money at current burn rate',
    goodRange: '> 6 months',
    badRange: '< 3 months',
    tip: 'Always know your runway. Most startups die from running out of cash.',
    relatedMetrics: ['Bank', 'Burn Rate', 'MRR'],
  },
  mrr: {
    title: 'Monthly Recurring Revenue',
    icon: '💵',
    description: 'Predictable monthly revenue from customers',
    goodRange: '> $10,000 (Series A ready)',
    badRange: '< $1,000 (pre-PMF)',
    tip: 'MRR > Burn = default alive. Focus on getting there.',
    relatedMetrics: ['Bank', 'WAU', 'NPS', 'Churn'],
  },
  wau: {
    title: 'Weekly Active Users',
    icon: '👥',
    description: 'Number of users actively using your product each week',
    goodRange: '> 1,000 with 10%+ growth',
    badRange: '< 100 or negative growth',
    tip: 'Growth rate matters more than absolute numbers early on',
    relatedMetrics: ['Growth Rate', 'Churn', 'NPS', 'MRR'],
  },
  nps: {
    title: 'Net Promoter Score',
    icon: '⭐',
    description: 'Customer satisfaction and likelihood to recommend',
    goodRange: '> 30 (good), > 50 (excellent)',
    badRange: '< 0 (more detractors than promoters)',
    tip: 'NPS predicts churn. Listen to users and iterate fast.',
    relatedMetrics: ['Churn Rate', 'WAU', 'Reputation'],
  },
  churn: {
    title: 'Churn Rate',
    icon: '🚪',
    description: 'Percentage of users leaving each week',
    goodRange: '< 3% weekly',
    badRange: '> 5% weekly',
    tip: 'High churn burns through users faster than you can acquire them',
    relatedMetrics: ['NPS', 'WAU', 'MRR', 'Tech Debt'],
  },
  morale: {
    title: 'Team Morale',
    icon: '💪',
    description: 'Founder and team energy, motivation, and burnout level',
    goodRange: '> 60%',
    badRange: '< 40% (quit risk)',
    tip: 'Burnout kills startups. Take breaks. Marathon, not sprint.',
    relatedMetrics: ['Velocity', 'Tech Debt', 'Reputation'],
  },
  reputation: {
    title: 'Reputation',
    icon: '🎖️',
    description: 'Your standing in the market and ability to attract talent',
    goodRange: '> 70%',
    badRange: '< 30%',
    tip: 'Reputation compounds. Build it by shipping quality and treating people well.',
    relatedMetrics: ['NPS', 'Morale', 'Velocity'],
  },
  tech_debt: {
    title: 'Technical Debt',
    icon: '⚠️',
    description: 'Accumulated shortcuts and hacks slowing future development',
    goodRange: '< 40',
    badRange: '> 70 (velocity penalty)',
    tip: 'Some debt is okay early. Pay it down before it compounds.',
    relatedMetrics: ['Velocity', 'Churn Rate', 'Morale'],
  },
  velocity: {
    title: 'Development Velocity',
    icon: '⚡',
    description: 'Speed multiplier for feature development',
    goodRange: '> 1.0x',
    badRange: '< 0.5x',
    tip: 'Velocity drops with tech debt and low morale. Invest in both.',
    relatedMetrics: ['Tech Debt', 'Morale', 'Features Shipped'],
  },
  equity: {
    title: 'Founder Equity',
    icon: '📊',
    description: 'Your ownership percentage in the company',
    goodRange: '> 50% (control)',
    badRange: '< 20% (diluted)',
    tip: 'Fundraising dilutes equity. Balance growth with ownership.',
    relatedMetrics: ['Fundraising', 'MRR', 'Valuation'],
  },
};
