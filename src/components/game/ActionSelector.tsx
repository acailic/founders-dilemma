import { Grid, Stack, Button, Text, Card, Group, Badge, Divider } from '@mantine/core';

interface Action {
  ShipFeature?: { quality: string };
  FounderLedSales?: { call_count: number };
  Hire?: null;
  Fundraise?: { target: number };
  TakeBreak?: null;
}

interface ActionSelectorProps {
  selectedActions: Action[];
  onSelectAction: (action: Action) => void;
  onRemoveAction: (index: number) => void;
  focusRemaining: number;
}

interface ActionCardData {
  name: string;
  icon: string;
  focusCost: number;
  description: string;
  effects: string[];
  category: 'product' | 'sales' | 'team' | 'capital' | 'recovery';
  risk: 'low' | 'medium' | 'high';
  action: Action;
}

export default function ActionSelector({
  selectedActions,
  onSelectAction,
  onRemoveAction,
  focusRemaining,
}: ActionSelectorProps) {
  const actions: ActionCardData[] = [
    {
      name: 'Ship Quick',
      icon: '⚡',
      focusCost: 1,
      description: 'Move fast, break things',
      effects: ['+3-5% WAU', '+6-8 tech debt', '-1-2 morale'],
      category: 'product',
      risk: 'medium',
      action: { ShipFeature: { quality: 'Quick' } },
    },
    {
      name: 'Ship Balanced',
      icon: '⚖️',
      focusCost: 1,
      description: 'Balanced quality & speed',
      effects: ['+4-6% WAU', '+2-3 tech debt', '+1 morale'],
      category: 'product',
      risk: 'low',
      action: { ShipFeature: { quality: 'Balanced' } },
    },
    {
      name: 'Ship Polish',
      icon: '✨',
      focusCost: 1,
      description: 'High quality, slower',
      effects: ['+2-3% WAU', '-3-4 tech debt', '+3-4 morale', '+rep'],
      category: 'product',
      risk: 'low',
      action: { ShipFeature: { quality: 'Polish' } },
    },
    {
      name: 'Sales (3 calls)',
      icon: '📞',
      focusCost: 1,
      description: 'Hustle for revenue',
      effects: ['Prob. MRR gain', '-1.5 morale', '+1 rep'],
      category: 'sales',
      risk: 'medium',
      action: { FounderLedSales: { call_count: 3 } },
    },
    {
      name: 'Sales (5 calls)',
      icon: '📱',
      focusCost: 1,
      description: 'Aggressive outreach',
      effects: ['Higher MRR chance', '-2.5 morale', '+1 rep'],
      category: 'sales',
      risk: 'high',
      action: { FounderLedSales: { call_count: 5 } },
    },
    {
      name: 'Hire',
      icon: '👥',
      focusCost: 2,
      description: 'Expand the team',
      effects: ['+$10k burn', '+0.1 velocity', '+5 morale'],
      category: 'team',
      risk: 'medium',
      action: { Hire: null },
    },
    {
      name: 'Raise $250k',
      icon: '💰',
      focusCost: 2,
      description: 'Fundraise round',
      effects: ['+$250k if win', '~5% dilution', '-10 morale if fail'],
      category: 'capital',
      risk: 'high',
      action: { Fundraise: { target: 250000 } },
    },
    {
      name: 'Raise $500k',
      icon: '💎',
      focusCost: 2,
      description: 'Larger round (harder)',
      effects: ['+$500k if win', '~10% dilution', '-10 morale if fail'],
      category: 'capital',
      risk: 'high',
      action: { Fundraise: { target: 500000 } },
    },
    {
      name: 'Take Break',
      icon: '🌴',
      focusCost: 1,
      description: 'Rest & recharge',
      effects: ['+15 morale', '-2% WAU growth'],
      category: 'recovery',
      risk: 'low',
      action: { TakeBreak: null },
    },
  ];

  const canAfford = (focusCost: number) => focusRemaining >= focusCost;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'product': return 'blue';
      case 'sales': return 'green';
      case 'team': return 'violet';
      case 'capital': return 'yellow';
      case 'recovery': return 'teal';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      {/* Available Actions Grid */}
      <Grid>
        {actions.map((actionCard, index) => {
          const affordable = canAfford(actionCard.focusCost);
          return (
            <Grid.Col key={index} span={4}>
              <Card
                withBorder
                padding="lg"
                className="sdv-action-card"
                data-disabled={!affordable}
                style={{
                  opacity: affordable ? 1 : 0.6,
                  cursor: affordable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  if (affordable) {
                    onSelectAction(actionCard.action);
                  }
                }}
              >
                <Stack gap="md">
                  {/* Header with Icon */}
                  <Group justify="space-between" align="flex-start">
                    <Group gap="xs">
                      <Text size="xl">{actionCard.icon}</Text>
                      <Stack gap={0}>
                        <Text size="sm" fw={700}>
                          {actionCard.name}
                        </Text>
                        <Badge size="xs" color={getCategoryColor(actionCard.category)}>
                          {actionCard.category}
                        </Badge>
                      </Stack>
                    </Group>
                    <Badge size="lg" variant="filled">
                      {actionCard.focusCost} 🎯
                    </Badge>
                  </Group>

                  <Divider />

                  {/* Description */}
                  <Text size="xs" c="dimmed" style={{ minHeight: '32px' }}>
                    {actionCard.description}
                  </Text>

                  {/* Effects */}
                  <Stack gap={4}>
                    {actionCard.effects.map((effect, i) => (
                      <Group key={i} gap="xs">
                        <Text size="xs" c="dimmed">▸</Text>
                        <Text size="xs">{effect}</Text>
                      </Group>
                    ))}
                  </Stack>

                  {/* Risk Badge */}
                  <Group justify="space-between" mt="xs">
                    <Badge size="xs" variant="light" color={getRiskColor(actionCard.risk)}>
                      {actionCard.risk} risk
                    </Badge>
                    {!affordable && (
                      <Badge size="xs" color="red" variant="filled">
                        Need {actionCard.focusCost - focusRemaining} more
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Stack>
  );
}
