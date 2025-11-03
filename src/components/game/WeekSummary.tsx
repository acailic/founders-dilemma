import { Modal, Stack, Title, Text, Card, Group, Badge, Grid, Divider } from '@mantine/core';
import type { GameState } from '../../types/game-systems';

interface WeekSummaryProps {
  opened: boolean;
  onClose: () => void;
  previousState: GameState;
  currentState: GameState;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function getChangeColor(change: number): string {
  if (change > 0) return 'green';
  if (change < 0) return 'red';
  return 'gray';
}

function getChangeIcon(change: number): string {
  if (change > 0) return '↗️';
  if (change < 0) return '↘️';
  return '→';
}

export default function WeekSummary({ opened, onClose, previousState, currentState }: WeekSummaryProps) {
  // Calculate changes
  const changes = {
    bank: currentState.bank - previousState.bank,
    mrr: currentState.mrr - previousState.mrr,
    wau: currentState.wau - previousState.wau,
    morale: currentState.morale - previousState.morale,
    reputation: currentState.reputation - previousState.reputation,
    nps: currentState.nps - previousState.nps,
    tech_debt: currentState.tech_debt - previousState.tech_debt,
    velocity: currentState.velocity - previousState.velocity,
    churn_rate: currentState.churn_rate - previousState.churn_rate,
    momentum: currentState.momentum - previousState.momentum,
  };

  const evProgress = currentState.escape_velocity_progress;
  const prevEvProgress = previousState.escape_velocity_progress;
  const evStreakChange = evProgress.streak_weeks - prevEvProgress.streak_weeks;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="xs">
          <Text size="lg">📊</Text>
          <Title order={2}>Week {previousState.week} Summary</Title>
        </Group>
      }
      centered
    >
      <Stack gap="lg">
        {/* Escape Velocity Progress */}
        {evStreakChange !== 0 && (
          <Card withBorder padding="md" style={{ background: evStreakChange > 0 ? 'var(--fd-positive-surface)' : 'var(--fd-surface-2)' }}>
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="lg">🚀</Text>
                <Text size="sm" fw={700}>
                  {evStreakChange > 0 ? 'Escape Velocity Progress!' : 'Escape Velocity Lost!'}
                </Text>
              </Group>
              <Text size="xs">
                Streak: {prevEvProgress.streak_weeks} → {evProgress.streak_weeks} weeks
                {evProgress.streak_weeks >= 12 && ' 🎉 VICTORY ACHIEVED!'}
              </Text>
            </Stack>
          </Card>
        )}

        {/* Financial Changes */}
        <div>
          <Text size="sm" fw={700} c="dimmed" mb="xs">💰 Financial</Text>
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">Bank</Text>
                    <Text size="lg">{getChangeIcon(changes.bank)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{formatCurrency(currentState.bank)}</Text>
                    <Badge size="sm" color={getChangeColor(changes.bank)}>
                      {changes.bank >= 0 ? '+' : ''}{formatCurrency(changes.bank)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">MRR</Text>
                    <Text size="lg">{getChangeIcon(changes.mrr)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{formatCurrency(currentState.mrr)}</Text>
                    <Badge size="sm" color={getChangeColor(changes.mrr)}>
                      {changes.mrr >= 0 ? '+' : ''}{formatCurrency(changes.mrr)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Growth Changes */}
        <div>
          <Text size="sm" fw={700} c="dimmed" mb="xs">📈 Growth</Text>
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">WAU</Text>
                    <Text size="lg">{getChangeIcon(changes.wau)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.wau.toLocaleString()}</Text>
                    <Badge size="sm" color={getChangeColor(changes.wau)}>
                      {changes.wau >= 0 ? '+' : ''}{changes.wau.toLocaleString()}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">NPS</Text>
                    <Text size="lg">{getChangeIcon(changes.nps)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.nps.toFixed(0)}</Text>
                    <Badge size="sm" color={getChangeColor(changes.nps)}>
                      {changes.nps >= 0 ? '+' : ''}{changes.nps.toFixed(1)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Health Changes */}
        <div>
          <Text size="sm" fw={700} c="dimmed" mb="xs">💪 Health</Text>
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">Morale</Text>
                    <Text size="lg">{getChangeIcon(changes.morale)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.morale.toFixed(0)}%</Text>
                    <Badge size="sm" color={getChangeColor(changes.morale)}>
                      {changes.morale >= 0 ? '+' : ''}{changes.morale.toFixed(1)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">Reputation</Text>
                    <Text size="lg">{getChangeIcon(changes.reputation)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.reputation.toFixed(0)}%</Text>
                    <Badge size="sm" color={getChangeColor(changes.reputation)}>
                      {changes.reputation >= 0 ? '+' : ''}{changes.reputation.toFixed(1)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Technical Changes */}
        <div>
          <Text size="sm" fw={700} c="dimmed" mb="xs">⚙️ Technical</Text>
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">Tech Debt</Text>
                    <Text size="lg">{getChangeIcon(-changes.tech_debt)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.tech_debt.toFixed(0)}</Text>
                    <Badge size="sm" color={getChangeColor(-changes.tech_debt)}>
                      {changes.tech_debt >= 0 ? '+' : ''}{changes.tech_debt.toFixed(1)}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs">Velocity</Text>
                    <Text size="lg">{getChangeIcon(changes.velocity)}</Text>
                  </Group>
                  <Group justify="space-between" align="baseline">
                    <Text size="sm">{currentState.velocity.toFixed(2)}x</Text>
                    <Badge size="sm" color={getChangeColor(changes.velocity)}>
                      {changes.velocity >= 0 ? '+' : ''}{changes.velocity.toFixed(2)}x
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        {/* Notable Changes Alert */}
        {(Math.abs(changes.morale) > 10 || Math.abs(changes.reputation) > 5 || Math.abs(changes.tech_debt) > 15) && (
          <Card withBorder padding="md" style={{ background: 'var(--fd-surface-2)' }}>
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="lg">⚠️</Text>
                <Text size="sm" fw={700}>Notable Changes</Text>
              </Group>
              <Stack gap="4px">
                {Math.abs(changes.morale) > 10 && (
                  <Text size="xs">• Morale changed significantly ({changes.morale > 0 ? '+' : ''}{changes.morale.toFixed(1)})</Text>
                )}
                {Math.abs(changes.reputation) > 5 && (
                  <Text size="xs">• Reputation shifted ({changes.reputation > 0 ? '+' : ''}{changes.reputation.toFixed(1)})</Text>
                )}
                {Math.abs(changes.tech_debt) > 15 && (
                  <Text size="xs">• Tech debt changed substantially ({changes.tech_debt > 0 ? '+' : ''}{changes.tech_debt.toFixed(1)})</Text>
                )}
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </Modal>
  );
}
