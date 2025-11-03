import { Card, Stack, Title, Text, Group, Badge, Tooltip, Button, Modal, Grid } from '@mantine/core';
import { useId, useState, type KeyboardEventHandler } from 'react';
import type { GameState } from '../../types/game-systems';
import { estimateTeamSizeFromBurn } from '../../lib/office/stateMapper';

interface OfficeCamProps {
  gameState: GameState;
}

// Visual state mapping functions
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sanitizePercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return clamp(value, 0, 100);
};

function getMoraleEmoji(morale: number): string {
  const safeMorale = sanitizePercent(morale);
  if (safeMorale >= 80) return '😊';
  if (safeMorale >= 60) return '🙂';
  if (safeMorale >= 40) return '😐';
  if (safeMorale >= 20) return '😟';
  return '😰';
}

function getClutterLevel(techDebt: number): { emoji: string; description: string; color: string } {
  const safeDebt = sanitizePercent(techDebt);
  if (safeDebt < 20) return { emoji: '✨', description: 'Pristine', color: 'green' };
  if (safeDebt < 40) return { emoji: '📋', description: 'Organized', color: 'teal' };
  if (safeDebt < 60) return { emoji: '📦', description: 'Busy', color: 'yellow' };
  if (safeDebt < 80) return { emoji: '📚', description: 'Cluttered', color: 'orange' };
  return { emoji: '🗂️', description: 'Chaotic', color: 'red' };
}

function getOfficeVibe(momentum: number, morale: number): { emoji: string; description: string } {
  const safeMomentum = sanitizePercent(momentum);
  const safeMorale = sanitizePercent(morale);

  if (safeMomentum > 80 && safeMorale > 70) return { emoji: '🎉', description: 'Buzzing with energy!' };
  if (safeMomentum > 60 && safeMorale > 60) return { emoji: '💪', description: 'Productive momentum' };
  if (safeMomentum > 40) return { emoji: '⚙️', description: 'Steady work' };
  if (safeMorale < 30) return { emoji: '😴', description: 'Low energy' };
  return { emoji: '🤔', description: 'Thoughtful planning' };
}

function getActivityIndicator(week: number): string {
  const safeWeek = Number.isFinite(week) ? Math.max(0, Math.floor(week)) : 0;
  const activities = ['💻', '📞', '📊', '🗂️', '☕'];
  return activities[safeWeek % activities.length];
}

export default function OfficeCam({ gameState }: OfficeCamProps) {
  const [expanded, setExpanded] = useState(false);
  const widgetId = useId();
  const modalTitleId = `${widgetId}-office-cam-title`;
  const modalDescriptionId = `${widgetId}-office-cam-description`;

  const teamSize = estimateTeamSizeFromBurn(gameState.burn);
  const moraleEmoji = getMoraleEmoji(gameState.morale);
  const clutterState = getClutterLevel(gameState.tech_debt);
  const officeVibe = getOfficeVibe(gameState.momentum, gameState.morale);
  const activityIcon = getActivityIndicator(gameState.week);

  // Generate team members with morale-based expressions
  const teamMembers = Array(teamSize)
    .fill(0)
    .map((_, i) => {
      // Vary expressions slightly
      const variance = (i % 3) * 10 - 10;
      const memberMorale = sanitizePercent(gameState.morale + variance);
      return getMoraleEmoji(memberMorale);
    });

  const handleOpen = () => setExpanded(true);
  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <>
      {/* Compact Widget */}
      <Card
        withBorder
        padding="md"
        style={{
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        className="fd-game-dashboard__office-cam-widget"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label="Open office cam details"
        aria-controls={`${widgetId}-office-cam-modal`}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text id={`${widgetId}-office-cam-label`} size="xl">📹</Text>
              <Title order={4}>Office Cam</Title>
            </Group>
            <Badge variant="light" size="sm">Live</Badge>
          </Group>

          {/* Mini Office Visualization */}
          <div
            className="fd-game-dashboard__office-cam-mini"
            style={{
              borderRadius: '8px',
              padding: '16px',
              minHeight: '120px',
              position: 'relative',
              border: '2px solid var(--fd-border-subtle)'
            }}
          >
            {/* Team Members */}
            <div style={{ marginBottom: '12px' }}>
              <Text size="xs" c="dimmed" mb={4}>Team ({teamSize})</Text>
              <Group gap="xs">
                {teamMembers.map((emoji, i) => (
                  <Tooltip key={i} label={`Team member ${i + 1}`}>
                    <Text size="xl" style={{ fontSize: '24px' }}>{emoji}</Text>
                  </Tooltip>
                ))}
              </Group>
            </div>

            {/* Office State Indicators */}
            <Group justify="space-between" align="center">
              <Tooltip label={`Office condition: ${clutterState.description}`}>
                <Badge color={clutterState.color} variant="light">
                  {clutterState.emoji} {clutterState.description}
                </Badge>
              </Tooltip>

              <Tooltip label="Current activity">
                <Text size="xl" style={{ fontSize: '24px' }}>{activityIcon}</Text>
              </Tooltip>
            </Group>

            {/* Vibe Indicator */}
            <Text
              size="xs"
              c="dimmed"
              mt="sm"
              style={{
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              {officeVibe.emoji} {officeVibe.description}
            </Text>
          </div>

          {/* Click to expand hint */}
          <Text size="xs" c="dimmed" ta="center">
            Press Enter or Space to view detailed office state
          </Text>
        </Stack>
      </Card>

      {/* Expanded Modal */}
      <Modal
        opened={expanded}
        onClose={() => setExpanded(false)}
        title={<Title id={modalTitleId} order={2} size="h3">Office Overview</Title>}
        size="lg"
        aria-labelledby={modalTitleId}
        aria-describedby={modalDescriptionId}
        id={`${widgetId}-office-cam-modal`}
      >
        <Stack gap="md">
          {/* Header Info */}
          <Card withBorder padding="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Week {gameState.week}</Text>
                <Text size="xl" fw={700}>{officeVibe.emoji} {officeVibe.description}</Text>
              </div>
              <Badge size="lg" color="blue">📹 Live View</Badge>
            </Group>
          </Card>

          {/* Detailed Team View */}
          <Card withBorder padding="md">
            <Stack gap="sm">
              <Title order={4}>👥 Team ({teamSize} people)</Title>
              <Text size="sm" c="dimmed">
                Estimated from burn rate: ${(gameState.burn / 1000).toFixed(0)}k/mo
              </Text>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '12px',
                marginTop: '8px'
              }}>
                {teamMembers.map((emoji, i) => (
                  <Tooltip
                    key={i}
                    label={`Person ${i + 1}: ${getMoraleDescription(gameState.morale)}`}
                  >
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <Text size="xl" style={{ fontSize: '32px' }}>{emoji}</Text>
                      <Text size="xs" c="dimmed">Desk {i + 1}</Text>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </Stack>
          </Card>

          {/* Office Conditions */}
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder padding="md" style={{ height: '100%' }}>
                <Stack gap="sm">
                  <Text fw={700}>🏢 Office Condition</Text>
                  <Group>
                    <Text size="xl" style={{ fontSize: '40px' }}>{clutterState.emoji}</Text>
                    <div>
                      <Text size="lg" fw={600}>{clutterState.description}</Text>
                      <Text size="xs" c="dimmed">Tech Debt: {gameState.tech_debt.toFixed(0)}%</Text>
                    </div>
                  </Group>
                  <Text size="sm">
                    {getClutterDescription(gameState.tech_debt)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={6}>
              <Card withBorder padding="md" style={{ height: '100%' }}>
                <Stack gap="sm">
                  <Text fw={700}>⚡ Team Energy</Text>
                  <Group>
                    <Text size="xl" style={{ fontSize: '40px' }}>{moraleEmoji}</Text>
                    <div>
                      <Text size="lg" fw={600}>{getMoraleDescription(gameState.morale)}</Text>
                      <Text size="xs" c="dimmed">Morale: {gameState.morale.toFixed(0)}%</Text>
                    </div>
                  </Group>
                  <Text size="sm">
                    {getMoraleAdvice(gameState.morale)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Activity & Momentum */}
          <Card withBorder padding="md">
            <Stack gap="sm">
              <Text fw={700}>📊 Current Activity</Text>
              <Group justify="space-between">
                <Group>
                  <Text size="xl" style={{ fontSize: '40px' }}>{activityIcon}</Text>
                  <div>
                    <Text size="lg">Working on this week's goals</Text>
                    <Text size="xs" c="dimmed">Velocity: {gameState.velocity.toFixed(2)}x</Text>
                  </div>
                </Group>
                <Badge size="lg" color={gameState.momentum > 60 ? 'green' : 'yellow'}>
                  Momentum: {gameState.momentum.toFixed(0)}
                </Badge>
              </Group>
            </Stack>
          </Card>

          {/* Office Stats Summary */}
          <Card withBorder padding="md" style={{ background: 'var(--mantine-color-blue-0)' }}>
            <Text id={modalDescriptionId} size="sm" fw={600} mb="sm">📈 Office Insights</Text>
            <Stack gap="xs">
              <Text size="sm">
                • Your team of {teamSize} is {gameState.velocity > 1 ? 'shipping quickly' : gameState.velocity > 0.7 ? 'working steadily' : 'slowed by tech debt'}
              </Text>
              <Text size="sm">
                • Office is {clutterState.description.toLowerCase()} ({gameState.tech_debt.toFixed(0)}% tech debt)
              </Text>
              <Text size="sm">
                • Team morale is {getMoraleDescription(gameState.morale).toLowerCase()} ({gameState.morale.toFixed(0)}%)
              </Text>
              <Text size="sm">
                • Reputation in the market: {gameState.reputation.toFixed(0)}/100
              </Text>
            </Stack>
          </Card>

          <Button onClick={() => setExpanded(false)} fullWidth>
            Close Office View
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

// Helper description functions
function getMoraleDescription(morale: number): string {
  const safeMorale = sanitizePercent(morale);
  if (safeMorale >= 80) return 'Thriving';
  if (safeMorale >= 60) return 'Motivated';
  if (safeMorale >= 40) return 'Steady';
  if (safeMorale >= 20) return 'Struggling';
  return 'Burnt Out';
}

function getMoraleAdvice(morale: number): string {
  const safeMorale = sanitizePercent(morale);
  if (safeMorale >= 80) return 'Team is energized and productive! Keep celebrating wins.';
  if (safeMorale >= 60) return 'Team is doing well. Regular check-ins help maintain momentum.';
  if (safeMorale >= 40) return 'Team morale is moderate. Consider taking breaks or celebrating small wins.';
  if (safeMorale >= 20) return 'Team is struggling. Urgent: Take a break or reduce workload.';
  return 'Critical: Team is burnt out. Must take recovery actions immediately.';
}

function getClutterDescription(techDebt: number): string {
  const safeDebt = sanitizePercent(techDebt);
  if (safeDebt < 20) return 'Clean codebase. Everything is well-organized and documented.';
  if (safeDebt < 40) return 'Some shortcuts taken, but manageable. Good balance.';
  if (safeDebt < 60) return 'Technical debt building up. Consider refactoring soon.';
  if (safeDebt < 80) return 'Significant tech debt. Slowing down development velocity.';
  return 'Critical tech debt! Code is fragile. High incident risk.';
}
