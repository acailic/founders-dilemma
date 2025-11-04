import React from 'react';
import { Card, Text, Progress, Badge, Group, Stack, Title, Divider, Tooltip, Button, Box } from '@mantine/core';
import { SpecializationPath, GameState } from '../../types/game-systems';

interface SpecializationPanelProps {
  gameState: GameState;
  currentPath: SpecializationPath | null;
  actionHistory: Array<{ week: number; actions: string[] }>;
}

const pathData: Record<SpecializationPath, {
  icon: string;
  name: string;
  description: string;
  bonus: string;
  examples: string[];
  companies: string;
  color: string;
}> = {
  ProductExcellence: {
    icon: '🎨',
    name: 'Product Excellence',
    description: 'Focus on building a superior product through shipping features, refactoring, and experimentation.',
    bonus: '+0.3 velocity',
    examples: ['ShipFeature', 'RefactorCode', 'RunExperiment'],
    companies: 'Apple, Google, Stripe',
    color: 'blue'
  },
  GrowthHacking: {
    icon: '📈',
    name: 'Growth Hacking',
    description: 'Prioritize user acquisition and growth through sales, content, and marketing.',
    bonus: '+5% WAU growth',
    examples: ['FounderLedSales', 'ContentLaunch', 'DevRel', 'PaidAds'],
    companies: 'Airbnb, Uber, Slack',
    color: 'green'
  },
  OperationalEfficiency: {
    icon: '⚙️',
    name: 'Operational Efficiency',
    description: 'Optimize operations to reduce costs and improve processes.',
    bonus: '-20% burn',
    examples: ['ComplianceWork', 'IncidentResponse', 'ProcessImprovement'],
    companies: 'Amazon, Toyota, McKinsey',
    color: 'orange'
  },
  CustomerObsessed: {
    icon: '❤️',
    name: 'Customer Obsessed',
    description: 'Focus on customer satisfaction and retention through dedicated support and feedback.',
    bonus: '+15 NPS',
    examples: ['FounderLedSales', 'ContentLaunch', 'DevRel'],
    companies: 'Zappos, Netflix, Amazon',
    color: 'red'
  }
};

const SpecializationPanel: React.FC<SpecializationPanelProps> = ({ gameState, currentPath, actionHistory }) => {
  // Calculate progress for each path based on last 8 weeks
  const recentHistory = actionHistory.slice(-8);
  const allActions = recentHistory.flatMap(h => h.actions);
  const totalActions = allActions.length;

  const progresses: Record<SpecializationPath, number> = {
    ProductExcellence: 0,
    GrowthHacking: 0,
    OperationalEfficiency: 0,
    CustomerObsessed: 0
  };

  (Object.keys(pathData) as SpecializationPath[]).forEach(path => {
    const count = allActions.filter(a => pathData[path].examples.includes(a)).length;
    progresses[path] = totalActions > 0 ? (count / totalActions) * 100 : 0;
  });

  const getActionsNeeded = (path: SpecializationPath): string => {
    const percentage = progresses[path];
    if (percentage >= 60) return 'Specialized!';
    if (totalActions === 0) return 'Take actions to start tracking';
    const needed = Math.ceil((0.6 * totalActions - progresses[path] / 100 * totalActions) / 0.4);
    return `Need ~${needed} more ${pathData[path].name.toLowerCase()} actions`;
  };

  const getRecommendation = (): string => {
    if (currentPath) {
      const percentage = progresses[currentPath];
      if (percentage >= 60) return `Keep focusing on ${pathData[currentPath].name} to maintain bonuses.`;
      return `Your ${pathData[currentPath].name} focus is slipping. Take more ${pathData[currentPath].name.toLowerCase()} actions to retain specialization.`;
    }
    const maxPath = (Object.keys(progresses) as SpecializationPath[]).reduce((a, b) => progresses[a] > progresses[b] ? a : b);
    if (progresses[maxPath] >= 40) return `You're leaning toward ${pathData[maxPath].name}. Focus more to achieve specialization.`;
    return 'Try focusing on one strategic path for 60%+ of actions over 8 weeks to gain powerful bonuses.';
  };

  return (
    <Stack spacing="lg">
      {/* Overview Section */}
      <Card withBorder>
        <Group position="apart" mb="sm">
          <div>
            <Title order={3}>Strategic Focus</Title>
            <Text size="sm" color="dimmed">Your startup's specialization path</Text>
          </div>
          {currentPath && (
            <Badge size="lg" variant="filled" color={pathData[currentPath].color} leftSection={pathData[currentPath].icon}>
              {pathData[currentPath].name}
            </Badge>
          )}
        </Group>
        <Text>
          Specialize in one area for 60%+ of your actions over the last 8 weeks to gain powerful bonuses.
          Specialization helps you excel in your chosen strategy but may limit flexibility.
        </Text>
      </Card>

      {/* Progress Bars */}
      <Card withBorder>
        <Title order={4} mb="md">Progress Toward Specialization</Title>
        <Stack spacing="md">
          {(Object.keys(pathData) as SpecializationPath[]).map(path => {
            const percentage = progresses[path];
            const isClose = percentage >= 50 && percentage < 60;
            const isAchieved = percentage >= 60;
            return (
              <Box key={path}>
                <Group position="apart" mb="xs">
                  <Group spacing="xs">
                    <Text>{pathData[path].icon}</Text>
                    <Text weight={isClose || isAchieved ? 600 : 400}>{pathData[path].name}</Text>
                  </Group>
                  <Text size="sm" color="dimmed">{percentage.toFixed(1)}% - {getActionsNeeded(path)}</Text>
                </Group>
                <Tooltip label={`${percentage.toFixed(1)}% progress. Need 60% for specialization.`}>
                  <Progress
                    value={percentage}
                    color={pathData[path].color}
                    size={isClose ? 'lg' : 'md'}
                    striped={isClose}
                    animate
                  />
                </Tooltip>
              </Box>
            );
          })}
        </Stack>
      </Card>

      {/* Path Details */}
      <Card withBorder>
        <Title order={4} mb="md">Specialization Paths</Title>
        <Stack spacing="md">
          {(Object.keys(pathData) as SpecializationPath[]).map(path => (
            <Card key={path} withBorder p="sm">
              <Group position="apart" mb="xs">
                <Group spacing="xs">
                  <Text size="lg">{pathData[path].icon}</Text>
                  <Text weight={600}>{pathData[path].name}</Text>
                </Group>
                <Badge color={pathData[path].color}>{pathData[path].bonus}</Badge>
              </Group>
              <Text size="sm" mb="xs">{pathData[path].description}</Text>
              <Text size="sm" color="dimmed">
                <strong>Key Actions:</strong> {pathData[path].examples.join(', ')}
              </Text>
              <Text size="sm" color="dimmed">
                <strong>Examples:</strong> {pathData[path].companies}
              </Text>
            </Card>
          ))}
        </Stack>
      </Card>

      {/* Active Specialization */}
      {currentPath && (
        <Card withBorder>
          <Title order={4} mb="md">Active Specialization</Title>
          <Group position="center" mb="md">
            <Badge size="xl" variant="filled" color={pathData[currentPath].color} leftSection={pathData[currentPath].icon}>
              {pathData[currentPath].name} Active
            </Badge>
          </Group>
          <Text align="center" mb="sm">
            <strong>Current Bonus:</strong> {pathData[currentPath].bonus}
          </Text>
          <Text align="center" size="sm" color="dimmed">
            Active as long as you maintain 60%+ focus in this area.
          </Text>
          {progresses[currentPath] < 60 && (
            <Text align="center" color="red" mt="sm">
              ⚠️ Warning: Your focus is slipping. Take more {pathData[currentPath].name.toLowerCase()} actions to retain this specialization.
            </Text>
          )}
        </Card>
      )}

      {/* Strategic Recommendations */}
      <Card withBorder>
        <Title order={4} mb="md">Strategic Recommendations</Title>
        <Text>{getRecommendation()}</Text>
        <Divider my="sm" />
        <Text size="sm" color="dimmed">
          <strong>Trade-offs:</strong> Specializing gives powerful bonuses but limits your strategic flexibility.
          Consider diversifying if market conditions change or you need to pivot.
        </Text>
      </Card>
    </Stack>
  );
};

export default SpecializationPanel;