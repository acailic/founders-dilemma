import { Grid, Stack, Button, Text, Card, Group, Badge, Divider, Modal, TextInput, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useState } from 'react';
import type {
  Action,
  Quality,
  RefactorDepth,
  ExperimentType,
  ContentType,
  DevRelEvent,
  AdChannel,
  CoachingFocus,
  FiringReason,
  MarketCondition,
  ActionSynergy,
} from '../../types/game-systems';

interface ActionSelectorProps {
  selectedActions: Action[];
  onSelectAction: (action: Action) => void;
  onRemoveAction: (index: number) => void;
  focusRemaining: number;
  unlockedActions: string[];
  marketConditions: MarketCondition[];
  synergies: ActionSynergy[];
  actionHistory: Array<{ week: number; actions: string[] }>;
}

interface ActionCardData {
  name: string;
  icon: string;
  focusCost: number;
  description: string;
  effects: string[];
  category: 'product' | 'sales' | 'team' | 'capital' | 'recovery' | 'operations';
  risk: 'low' | 'medium' | 'high';
  action: Action;
  unlockCondition?: string;
}

export default function ActionSelector({
  selectedActions,
  onSelectAction,
  onRemoveAction,
  focusRemaining,
  unlockedActions,
  marketConditions,
  synergies,
  actionHistory,
}: ActionSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActionForModal, setSelectedActionForModal] = useState<ActionCardData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getUnlockKeyForCard = (card: ActionCardData): string => {
    if (card.name.startsWith('Ship')) return 'ShipFeature';
    if (card.name.startsWith('Sales')) return 'FounderLedSales';
    if (card.name.startsWith('RefactorCode')) return 'RefactorCode';
    if (card.name.startsWith('ContentLaunch')) return 'ContentLaunch';
    if (card.name.startsWith('Raise')) return 'Fundraise';
    if (card.name === 'RunExperiment') return 'RunExperiment';
    if (card.name === 'DevRel') return 'DevRel';
    if (card.name === 'PaidAds') return 'PaidAds';
    if (card.name === 'Hire') return 'Hire';
    if (card.name === 'Coach') return 'Coach';
    if (card.name === 'Fire') return 'Fire';
    if (card.name === 'Take Break') return 'TakeBreak';
    if (card.name === 'ComplianceWork') return 'ComplianceWork';
    if (card.name === 'IncidentResponse') return 'IncidentResponse';
    if (card.name === 'ProcessImprovement') return 'ProcessImprovement';
    return card.name.replace(/\s+/g, '');
  };

  const actions: ActionCardData[] = [
    {
      name: 'Ship Quick',
      icon: '⚡',
      focusCost: 1,
      description: 'Move fast, break things',
      effects: ['+3-5% WAU', '+6-8 tech debt', '-1-2 morale'],
      category: 'product',
      risk: 'medium',
      action: { ShipFeature: { quality: 'Quick' as Quality } },
    },
    {
      name: 'Ship Balanced',
      icon: '⚖️',
      focusCost: 1,
      description: 'Balanced quality & speed',
      effects: ['+4-6% WAU', '+2-3 tech debt', '+1 morale'],
      category: 'product',
      risk: 'low',
      action: { ShipFeature: { quality: 'Balanced' as Quality } },
    },
    {
      name: 'Ship Polish',
      icon: '✨',
      focusCost: 1,
      description: 'High quality, slower',
      effects: ['+2-3% WAU', '-3-4 tech debt', '+3-4 morale', '+rep'],
      category: 'product',
      risk: 'low',
      action: { ShipFeature: { quality: 'Polish' as Quality } },
    },
    {
      name: 'RefactorCode (Surface)',
      icon: '🔧',
      focusCost: 1,
      description: 'Quick code cleanup',
      effects: ['-10-15 tech debt', '+0.05 velocity', '-5 morale'],
      category: 'product',
      risk: 'low',
      action: { RefactorCode: { depth: 'Surface' as RefactorDepth } },
      unlockCondition: 'Week 5+',
    },
    {
      name: 'RefactorCode (Deep)',
      icon: '🏗️',
      focusCost: 2,
      description: 'Major architectural rework',
      effects: ['-25-35 tech debt', '+0.15 velocity', '-10 morale', '-10% WAU growth'],
      category: 'product',
      risk: 'medium',
      action: { RefactorCode: { depth: 'Deep' as RefactorDepth } },
      unlockCondition: 'Week 8+',
    },
    {
      name: 'RunExperiment',
      icon: '🧪',
      focusCost: 1,
      description: 'Test a hypothesis',
      effects: ['Probabilistic insight', '+5-15% metric boost', 'Learn something new'],
      category: 'product',
      risk: 'medium',
      action: { RunExperiment: { category: 'Pricing' as ExperimentType } },
      unlockCondition: 'Week 9+',
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
      name: 'ContentLaunch (Blog)',
      icon: '📝',
      focusCost: 1,
      description: 'Publish helpful content',
      effects: ['+3-8% WAU', '+5 reputation', '+2 NPS'],
      category: 'sales',
      risk: 'low',
      action: { ContentLaunch: { content_type: 'BlogPost' as ContentType } },
      unlockCondition: 'Week 5+',
    },
    {
      name: 'ContentLaunch (Tutorial)',
      icon: '📚',
      focusCost: 1,
      description: 'Create in-depth tutorial',
      effects: ['+5-12% WAU', '+8 reputation', '+5 NPS', 'Higher conversion'],
      category: 'sales',
      risk: 'low',
      action: { ContentLaunch: { content_type: 'Tutorial' as ContentType } },
      unlockCondition: 'Week 5+',
    },
    {
      name: 'DevRel',
      icon: '🎤',
      focusCost: 2,
      description: 'Build developer community',
      effects: ['+15-25% WAU', '+15 reputation', '+10 morale', '-$5k'],
      category: 'sales',
      risk: 'medium',
      action: { DevRel: { event_type: 'Conference' as DevRelEvent } },
      unlockCondition: 'Week 13+',
    },
    {
      name: 'PaidAds',
      icon: '💸',
      focusCost: 1,
      description: 'Run advertising campaign',
      effects: ['+10-30% WAU', '-$10k-30k', 'Effectiveness varies'],
      category: 'sales',
      risk: 'high',
      action: { PaidAds: { budget: 20000, channel: 'Google' as AdChannel } },
      unlockCondition: 'Week 13+',
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
      name: 'Coach',
      icon: '🎓',
      focusCost: 1,
      description: 'Mentor and develop team',
      effects: ['+10 morale', '+0.1 velocity', '+5 reputation'],
      category: 'team',
      risk: 'low',
      action: { Coach: { focus: 'Skills' as CoachingFocus } },
      unlockCondition: 'Week 5+',
    },
    {
      name: 'Fire',
      icon: '👋',
      focusCost: 1,
      description: 'Remove underperforming team member',
      effects: ['-$10k burn', '-15 morale', '-0.1 velocity', 'Depends on reason'],
      category: 'team',
      risk: 'high',
      action: { Fire: { reason: 'Performance' as FiringReason } },
      unlockCondition: 'Week 21+',
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
    {
      name: 'ComplianceWork',
      icon: '📋',
      focusCost: 1,
      description: 'Address regulatory requirements',
      effects: ['-15-25 compliance risk', '-5 morale', 'Required for regulated'],
      category: 'operations',
      risk: 'low',
      action: { ComplianceWork: { hours: 8 } },
      unlockCondition: 'Week 9+',
    },
    {
      name: 'IncidentResponse',
      icon: '🚨',
      focusCost: 2,
      description: 'Handle outages or security issues',
      effects: ['- reputation damage', '+ morale (reactive)', 'High cost'],
      category: 'operations',
      risk: 'high',
      action: { IncidentResponse: null },
      unlockCondition: 'Week 21+',
    },
    {
      name: 'ProcessImprovement',
      icon: '⚙️',
      focusCost: 1,
      description: 'Optimize workflows',
      effects: ['+0.1 velocity', '- future incident risk', '+ efficiency'],
      category: 'operations',
      risk: 'low',
      action: { ProcessImprovement: null },
      unlockCondition: 'Week 13+',
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
      case 'operations': return 'orange';
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

  const getSynergyHighlight = (action: ActionCardData) => {
    // Simple check: if ShipFeature selected, highlight ContentLaunch
    const hasShipFeature = selectedActions.some(a => a.ShipFeature);
    if (hasShipFeature && action.name.includes('ContentLaunch')) return true;
    // Add more as needed
    return false;
  };

  const getMarketModifier = (action: ActionCardData) => {
    // Example: for Fundraise, check Bull Market
    if (action.name.includes('Raise') && marketConditions.some(c => c.name === 'Bull Market')) {
      return { text: '+50%', color: 'green' };
    }
    return null;
  };

  const filteredActions = actions.filter(action => {
    if (categoryFilter !== 'all' && action.category !== categoryFilter) return false;
    if (riskFilter !== 'all' && action.risk !== riskFilter) return false;
    if (searchTerm && !action.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionCardData[]>);

  const openModal = (action: ActionCardData) => {
    setSelectedActionForModal(action);
    setModalOpen(true);
  };

  const getHistoricalEffectiveness = (actionName: string) => {
    const count = actionHistory.flatMap(h => h.actions).filter(a => a === actionName).length;
    if (count === 0) return 'Not used yet';
    return `Used ${count} times. Average effectiveness: TBD`; // Placeholder
  };

  return (
    <Stack gap="lg">
      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          data={[
            { value: 'all', label: 'All Categories' },
            { value: 'product', label: 'Product' },
            { value: 'sales', label: 'Sales' },
            { value: 'team', label: 'Team' },
            { value: 'capital', label: 'Capital' },
            { value: 'recovery', label: 'Recovery' },
            { value: 'operations', label: 'Operations' },
          ]}
          value={categoryFilter}
          onChange={(value) => setCategoryFilter(value || 'all')}
          placeholder="Category"
        />
        <Select
          data={[
            { value: 'all', label: 'All Risks' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          value={riskFilter}
          onChange={(value) => setRiskFilter(value || 'all')}
          placeholder="Risk"
        />
      </Group>

      {/* Grouped Actions */}
      {Object.entries(groupedActions).map(([category, acts]) => (
        <Stack key={category} gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={700} tt="capitalize">{category} ({acts.length})</Text>
          </Group>
          <Grid>
            {acts.map((actionCard, index) => {
              const affordable = canAfford(actionCard.focusCost);
              const unlockKey = getUnlockKeyForCard(actionCard);
              const isLocked = !unlockedActions.includes(unlockKey);
              const synergyHighlight = getSynergyHighlight(actionCard);
              const marketMod = getMarketModifier(actionCard);
              return (
                <Grid.Col key={index} span={4}>
                  <Tooltip label={isLocked ? `Locked: ${actionCard.unlockCondition}` : ''}>
                    <Card
                      withBorder
                      padding="lg"
                      className="sdv-action-card"
                      data-disabled={!affordable || isLocked}
                      style={{
                        opacity: (affordable && !isLocked) ? 1 : 0.6,
                        cursor: (affordable && !isLocked) ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        filter: isLocked ? 'grayscale(100%)' : 'none',
                        border: synergyHighlight ? '2px solid gold' : undefined,
                      }}
                      onClick={() => {
                        if (affordable && !isLocked) {
                          onSelectAction(actionCard.action);
                        }
                      }}
                    >
                      <Stack gap="md">
                        {/* Header with Icon */}
                        <Group justify="space-between" align="flex-start">
                          <Group gap="xs">
                            <Text size="xl">{actionCard.icon}</Text>
                            {isLocked && <Text size="xl">🔒</Text>}
                            <Stack gap={0}>
                              <Text size="sm" fw={700} onClick={() => openModal(actionCard)} style={{ cursor: 'pointer' }}>
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

                        {/* Badges */}
                        <Group justify="space-between" mt="xs">
                          <Badge size="xs" variant="light" color={getRiskColor(actionCard.risk)}>
                            {actionCard.risk} risk
                          </Badge>
                          {marketMod && (
                            <Badge size="xs" color={marketMod.color}>
                              {marketMod.text}
                            </Badge>
                          )}
                          {!affordable && (
                            <Badge size="xs" color="red" variant="filled">
                              Need {actionCard.focusCost - focusRemaining} more
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                    </Card>
                  </Tooltip>
                </Grid.Col>
              );
            })}
          </Grid>
        </Stack>
      ))}

      {/* Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={selectedActionForModal?.name || ''}>
        {selectedActionForModal && (
          <Stack gap="md">
            <Text>{selectedActionForModal.description}</Text>
            <Text fw={700}>Effects:</Text>
            {selectedActionForModal.effects.map((effect, i) => (
              <Text key={i} size="sm">• {effect}</Text>
            ))}
            <Text fw={700}>Educational Tip:</Text>
            <Text size="sm">Use this when...</Text> {/* Placeholder */}
            <Text fw={700}>Historical Effectiveness:</Text>
            <Text size="sm">{getHistoricalEffectiveness(selectedActionForModal.name)}</Text>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
