import { useState, useEffect, useRef } from 'react';
import { Container, Grid, Stack, Title, Button, Text, Alert, Card, Group, Badge, ActionIcon, Tooltip, Tabs, Progress, Modal, Toast } from '@mantine/core';
import { invoke } from '@tauri-apps/api/core';
import { useHotkeys } from '@mantine/hooks';
import StatsPanel from './StatsPanel';
import ActionSelector from './ActionSelector';
import HelpModal from './HelpModal';
import AchievementsPanel from './AchievementsPanel';
import WeekSummary from './WeekSummary';
import MetricsSidebar from './MetricsSidebar';
import CriticalStatusBanner from './CriticalStatusBanner';
import HistoryView from './HistoryView';
import WeeklyInsights from './WeeklyInsights';
import FailureWarnings from './FailureWarnings';
import CompoundingBonuses from './CompoundingBonuses';
import EventModal from './EventModal';
import OfficeCam from './OfficeCam';
import OfficeCanvas from '../office/OfficeCanvas';
import MarketConditionsPanel from './MarketConditionsPanel';
import SynergyNotification from './SynergyNotification';
import UnlockNotification from './UnlockNotification';
import SpecializationPanel from './SpecializationPanel';
import { LuRotateCcw } from 'react-icons/lu';
import type {
  TurnResult,
  GameEvent,
  WeeklyInsight,
  FailureWarning,
  CompoundingBonus,
  GameState,
  ActionSynergy,
  MarketCondition,
  MilestoneEvent,
  SpecializationPath,
} from '../../types/game-systems';

interface Action {
  ShipFeature?: { quality: string };
  FounderLedSales?: { call_count: number };
  Hire?: null;
  Fundraise?: { target: number };
  TakeBreak?: null;
  RefactorCode?: { depth: string };
  RunExperiment?: { category: string };
  ContentLaunch?: { content_type: string };
  DevRel?: { event_type: string };
  PaidAds?: { budget: number; channel: string };
  Coach?: { focus: string };
  Fire?: { reason: string };
  ComplianceWork?: { hours: number };
  IncidentResponse?: null;
  ProcessImprovement?: null;
}

interface GameDashboardProps {
  gameState: GameState;
  onStateUpdate: (state: GameState) => void;
  onResetGame?: () => void;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  if (err && typeof err === 'object') {
    const message = 'message' in err && typeof (err as { message: unknown }).message === 'string'
      ? (err as { message: string }).message
      : undefined;

    if (message) {
      return message;
    }

    try {
      return JSON.stringify(err);
    } catch (serializationError) {
      console.error('Failed to serialize error object', serializationError);
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default function GameDashboard({ gameState, onStateUpdate, onResetGame }: GameDashboardProps) {
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpOpened, setHelpOpened] = useState(false);
  const [weekSummaryOpened, setWeekSummaryOpened] = useState(false);
  const [previousState, setPreviousState] = useState<GameState | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // New game system states
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [warnings, setWarnings] = useState<FailureWarning[]>([]);
  const [compoundingBonuses, setCompoundingBonuses] = useState<CompoundingBonus[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventModalOpened, setEventModalOpened] = useState(false);
  const officeContainerRef = useRef<HTMLDivElement | null>(null);
  const [officeDimensions, setOfficeDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 700
  });

  // Additional new state variables
  const [synergies, setSynergies] = useState<ActionSynergy[]>([]);
  const [marketConditions, setMarketConditions] = useState<MarketCondition[]>([]);
  const [unlockedActions, setUnlockedActions] = useState<string[]>([]);
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent | null>(null);
  const [specializationPath, setSpecializationPath] = useState<SpecializationPath | null>(null);

  // Notification states
  const [unlockNotificationOpened, setUnlockNotificationOpened] = useState(false);
  const [unlockActionName, setUnlockActionName] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [unlockDescription, setUnlockDescription] = useState('');
  const [specializationNotificationOpened, setSpecializationNotificationOpened] = useState(false);
  const [milestoneModalOpened, setMilestoneModalOpened] = useState(false);
  const [marketConditionsVisible, setMarketConditionsVisible] = useState(true);

  const handleResetGame = () => {
    setSelectedActions([]);
    setPreviousState(null);
    onResetGame?.();
  };

  const handleTakeTurn = async () => {
    if (selectedActions.length === 0) {
      setError('Select at least one action!');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Save current state before taking turn
      setPreviousState(gameState);

      // Call enhanced take_turn that returns TurnResult
      const result = await invoke<TurnResult>('take_turn', {
        state: gameState,
        actions: selectedActions,
      });

      // Update game state
      onStateUpdate(result.state);
      setSelectedActions([]);

      // Store new game systems data
      setInsights(result.insights);
      setWarnings(result.warnings);
      setCompoundingBonuses(result.compounding_bonuses);

      // Extract new fields
      setSynergies(result.synergies);
      setMarketConditions(result.market_conditions);
      setUnlockedActions(result.unlocked_actions);
      setMilestoneEvent(result.milestone_event);
      setSpecializationPath(result.specialization_bonus);

      // Show notifications
      if (result.milestone_event) {
        setMilestoneModalOpened(true);
      }
      if (result.unlocked_actions.length > 0) {
        // Assuming one unlock for simplicity
        setUnlockActionName(result.unlocked_actions[0]);
        setUnlockReason('Reached milestone'); // Placeholder
        setUnlockDescription('New action unlocked!'); // Placeholder
        setUnlockNotificationOpened(true);
      }
      if (result.specialization_bonus) {
        setSpecializationNotificationOpened(true);
      }

      // Check for events
      if (result.events.length > 0) {
        setCurrentEvent(result.events[0]);
        setEventModalOpened(true);
      } else {
        // No events, show week summary
        setWeekSummaryOpened(true);
      }
    } catch (err) {
      console.error('Failed to process turn', err);
      setError(extractErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleEventChoice = async (choiceIndex: number) => {
    if (!currentEvent) return;

    try {
      const newState = await invoke<GameState>('apply_event_choice', {
        state: gameState,
        eventId: currentEvent.id,
        choiceIndex,
        event: currentEvent,
      });

      onStateUpdate(newState);
      setEventModalOpened(false);
      setCurrentEvent(null);

      // After handling event, show week summary
      setWeekSummaryOpened(true);
    } catch (err) {
      console.error('Failed to apply event choice', err);
      setError(extractErrorMessage(err));
    }
  };

  const handleEventClose = () => {
    setEventModalOpened(false);
    setCurrentEvent(null);
    // Show week summary after closing event
    setWeekSummaryOpened(true);
  };

  const focusUsed = selectedActions.reduce((total, action) => {
    // Calculate focus cost (simplified - should match Rust logic)
    if ('ShipFeature' in action) return total + 1;
    if ('FounderLedSales' in action) return total + 1;
    if ('Hire' in action) return total + 2;
    if ('Fundraise' in action) return total + 2;
    if ('TakeBreak' in action) return total + 1;
    if ('RefactorCode' in action) return total + (action.RefactorCode?.depth === 'Deep' ? 2 : 1);
    if ('RunExperiment' in action) return total + 1;
    if ('ContentLaunch' in action) return total + 1;
    if ('DevRel' in action) return total + 2;
    if ('PaidAds' in action) return total + 1;
    if ('Coach' in action) return total + 1;
    if ('Fire' in action) return total + 1;
    if ('ComplianceWork' in action) return total + 1;
    if ('IncidentResponse' in action) return total + 2;
    if ('ProcessImprovement' in action) return total + 1;
    return total;
  }, 0);

  const focusRemaining = gameState.focus_slots - focusUsed;

  useEffect(() => {
    const container = officeContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        if (!containerWidth || Number.isNaN(containerWidth)) {
          continue;
        }

        const targetWidth = Math.max(100, Math.floor(containerWidth));
        const targetHeight = Math.round(targetWidth * 0.7);

        setOfficeDimensions((current) => {
          if (current.width === targetWidth && current.height === targetHeight) {
            return current;
          }
          return { width: targetWidth, height: targetHeight };
        });
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Keyboard shortcuts
  useHotkeys([
    ['Enter', () => {
      if (selectedActions.length > 0 && focusRemaining >= 0 && !processing && activeTab === 'plan') {
        handleTakeTurn();
      }
    }],
    ['Escape', () => setSelectedActions([])],
    ['h', () => setHelpOpened(true)],
    ['?', () => setHelpOpened(true)],
    ['1', () => setActiveTab('dashboard')],
    ['2', () => setActiveTab('office')],
    ['3', () => setActiveTab('plan')],
    ['4', () => setActiveTab('history')],
    ['5', () => setActiveTab('achievements')],
    ['6', () => setActiveTab('strategy')],
    ['m', () => setMarketConditionsVisible(!marketConditionsVisible)],
    ['u', () => setUnlockNotificationOpened(true)],
  ]);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header Card */}
        <Card withBorder padding="lg">
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1} size="h2">Founder's Dilemma</Title>
              <Group gap="md">
                <Badge size="lg" variant="filled">Week {gameState.week}</Badge>
                <Badge size="lg" variant="light">{gameState.difficulty.toUpperCase()}</Badge>
              </Group>
            </Stack>
            <Group gap="lg">
              <Stack gap="xs" align="flex-end">
                <Text size="sm" c="dimmed">Focus Slots</Text>
                <Badge
                  size="xl"
                  color={focusRemaining >= 2 ? 'green' : focusRemaining >= 1 ? 'yellow' : 'red'}
                >
                  {focusRemaining} / {gameState.focus_slots}
                </Badge>
              </Stack>
              {onResetGame && (
                <Tooltip label="Reset progress and return to difficulty selection">
                  <ActionIcon
                    size="xl"
                    variant="light"
                    color="red"
                    onClick={handleResetGame}
                  >
                    <LuRotateCcw size="1.4em" />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Help (H or ?)">
                <ActionIcon
                  size="xl"
                  variant="filled"
                  color="blue"
                  onClick={() => setHelpOpened(true)}
                >
                  <Text size="xl">❓</Text>
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Card>

        {/* Horizontal Tab Navigation */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'dashboard')}>
          <Tabs.List>
            <Tabs.Tab value="dashboard" leftSection="📊">
              Dashboard
              <Badge size="xs" ml="xs" variant="light">1</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="office" leftSection="🏢">
              Office
              <Badge size="xs" ml="xs" variant="light">2</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="plan" leftSection="🎯">
              Plan Week
              <Badge size="xs" ml="xs" variant="light">3</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection="📈">
              History
              <Badge size="xs" ml="xs" variant="light">4</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="achievements" leftSection="🏆">
              Achievements
              <Badge size="xs" ml="xs" variant="light">5</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="strategy" leftSection="🎯">
              Strategy
              <Badge size="xs" ml="xs" variant="light">6</Badge>
            </Tabs.Tab>
          </Tabs.List>

          {/* Office Tab - Full Visualization */}
          <Tabs.Panel value="office" pt="md">
            <div ref={officeContainerRef} style={{ width: '100%' }}>
              <OfficeCanvas
                gameState={gameState}
                width={officeDimensions.width}
                height={officeDimensions.height}
              />
            </div>
          </Tabs.Panel>

          {/* Dashboard Tab - Stats Only */}
          <Tabs.Panel value="dashboard" pt="md">
            <Grid gutter="lg">
              <Grid.Col span={9}>
                <Stack gap="lg">
                  {/* Critical Status Banner */}
                  <CriticalStatusBanner gameState={gameState} />

                  {/* Market Conditions Banner */}
                  {marketConditionsVisible && marketConditions.length > 0 && (
                    <MarketConditionsPanel conditions={marketConditions} />
                  )}

                  {/* Office Cam Widget */}
                  <OfficeCam gameState={gameState} />

                  {/* Synergy Notifications */}
                  {synergies.length > 0 && (
                    <SynergyNotification synergies={synergies} onClose={() => setSynergies([])} />
                  )}

                  {/* Compounding Bonuses - Show when active */}
                  {compoundingBonuses.length > 0 && (
                    <CompoundingBonuses bonuses={compoundingBonuses} />
                  )}

                  {/* Failure Warnings - Show when present */}
                  {warnings.length > 0 && (
                    <FailureWarnings warnings={warnings} />
                  )}

                  {/* Weekly Insights - Educational feedback */}
                  {insights.length > 0 && (
                    <WeeklyInsights insights={insights} />
                  )}

                  {/* Stats Panel */}
                  <StatsPanel gameState={gameState} onMetricClick={setSelectedMetric} />

                  {/* Call to Action */}
                  <Card withBorder padding="lg" style={{ background: 'var(--mantine-color-blue-0)' }}>
                    <Group justify="space-between" align="center">
                      <Stack gap="xs">
                        <Text size="lg" fw={700}>Ready to plan your next week?</Text>
                        <Text size="sm" c="dimmed">
                          Review your metrics, then head to the Plan Week tab to choose actions
                        </Text>
                      </Stack>
                      <Button
                        size="lg"
                        onClick={() => setActiveTab('plan')}
                        rightSection="→"
                      >
                        Go to Planning
                      </Button>
                    </Group>
                  </Card>
                </Stack>
              </Grid.Col>

              {/* Right Sidebar */}
              <Grid.Col span={3}>
                <MetricsSidebar gameState={gameState} selectedMetric={selectedMetric} />
                {/* Specialization Progress */}
                <SpecializationPanel gameState={gameState} currentPath={specializationPath} actionHistory={[]} />
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Plan Week Tab - Actions Only */}
          <Tabs.Panel value="plan" pt="md">
            <Stack gap="lg">
              {/* Error Alert */}
              {error && (
                <Alert color="red" onClose={() => setError(null)} withCloseButton>
                  {error}
                </Alert>
              )}

              {/* Quick Stats Summary */}
              <Card withBorder padding="md">
                <Group justify="space-between">
                  <Group gap="xl">
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Bank</Text>
                      <Text size="lg" fw={700}>{formatCurrency(gameState.bank)}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Burn/mo</Text>
                      <Text size="lg" fw={700}>{formatCurrency(gameState.burn)}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Runway</Text>
                      <Text size="lg" fw={700} c={gameState.runway_months > 6 ? 'green' : gameState.runway_months > 3 ? 'yellow' : 'red'}>
                        {gameState.runway_months.toFixed(1)} mo
                      </Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Morale</Text>
                      <Text size="lg" fw={700}>{gameState.morale.toFixed(0)}%</Text>
                    </Stack>
                  </Group>
                  <Button
                    variant="subtle"
                    onClick={() => setActiveTab('dashboard')}
                    leftSection="←"
                  >
                    View Dashboard
                  </Button>
                </Group>
              </Card>

              {/* Recommended Actions */}
              <Card withBorder padding="md">
                <Text size="sm" fw={700}>Recommended Actions:</Text>
                <Text size="sm">Based on current state, consider...</Text>
                {/* Placeholder for recommendations */}
              </Card>

              {/* Action Selector */}
              <Card withBorder padding="lg">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Title order={2}>Plan Your Week {gameState.week + 1}</Title>
                    {selectedActions.length > 0 && (
                      <Badge size="lg" color="blue">
                        {selectedActions.length} action{selectedActions.length !== 1 ? 's' : ''} selected
                      </Badge>
                    )}
                  </Group>
                  <ActionSelector
                    selectedActions={selectedActions}
                    onSelectAction={(action) => setSelectedActions([...selectedActions, action])}
                    onRemoveAction={(index) =>
                      setSelectedActions(selectedActions.filter((_, i) => i !== index))
                    }
                    focusRemaining={focusRemaining}
                    unlockedActions={unlockedActions}
                    marketConditions={marketConditions}
                    synergies={synergies}
                    actionHistory={[]} // Placeholder
                  />
                </Stack>
              </Card>

              {/* Selected Actions Summary */}
              {selectedActions.length > 0 && (
                <Card withBorder padding="md">
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>
                      📋 Your Plan:
                    </Text>
                    {selectedActions.map((action, index) => (
                      <Text key={index} size="sm">
                        {index + 1}.{' '}
                        {Object.keys(action)[0].replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                    ))}
                  </Stack>
                </Card>
              )}

              {/* Turn Button */}
              <Button
                size="xl"
                onClick={handleTakeTurn}
                disabled={selectedActions.length === 0 || focusRemaining < 0}
                loading={processing}
                fullWidth
              >
                {processing ? 'Processing Week...' : `Execute Week ${gameState.week + 1} (Enter)`}
              </Button>
            </Stack>
          </Tabs.Panel>

          {/* History Tab */}
          <Tabs.Panel value="history" pt="md">
            <HistoryView gameState={gameState} />
          </Tabs.Panel>

          {/* Achievements Tab */}
          <Tabs.Panel value="achievements" pt="md">
            <AchievementsPanel gameState={gameState} />
          </Tabs.Panel>

          {/* Strategy Tab */}
          <Tabs.Panel value="strategy" pt="md">
            <Stack gap="lg">
              <Title order={2}>Strategic Overview</Title>
              <SpecializationPanel gameState={gameState} currentPath={specializationPath} actionHistory={[]} />
              <Card withBorder padding="md">
                <Text size="sm" fw={700}>Action Usage Statistics:</Text>
                {/* Placeholder */}
              </Card>
              <Card withBorder padding="md">
                <Text size="sm" fw={700}>Synergy Discovery Progress:</Text>
                {/* Placeholder */}
              </Card>
              <Card withBorder padding="md">
                <Text size="sm" fw={700}>Strategic Recommendations:</Text>
                {/* Placeholder */}
              </Card>
              <Card withBorder padding="md">
                <Text size="sm" fw={700}>Market Condition Forecast:</Text>
                {/* Placeholder */}
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Help Modal */}
        <HelpModal opened={helpOpened} onClose={() => setHelpOpened(false)} />

        {/* Event Modal - Strategic dilemmas */}
        <EventModal
          opened={eventModalOpened}
          event={currentEvent}
          onClose={handleEventClose}
          onChoiceSelected={handleEventChoice}
        />

        {/* Week Summary Modal */}
        {previousState && (
          <WeekSummary
            opened={weekSummaryOpened}
            onClose={() => setWeekSummaryOpened(false)}
            previousState={previousState}
            currentState={gameState}
          />
        )}

        {/* Unlock Notification */}
        <UnlockNotification
          opened={unlockNotificationOpened}
          actionName={unlockActionName}
          unlockReason={unlockReason}
          description={unlockDescription}
          onClose={() => setUnlockNotificationOpened(false)}
        />

        {/* Specialization Notification */}
        <Modal opened={specializationNotificationOpened} onClose={() => setSpecializationNotificationOpened(false)} title="Specialization Achieved!">
          <Text>Congratulations! You have achieved the {specializationPath} specialization.</Text>
        </Modal>

        {/* Milestone Modal */}
        <Modal opened={milestoneModalOpened} onClose={() => setMilestoneModalOpened(false)} title={milestoneEvent?.title || ''}>
          <Text>{milestoneEvent?.description}</Text>
          <Text>Rewards: {milestoneEvent?.rewards.join(', ')}</Text>
        </Modal>
      </Stack>
    </Container>
  );
}