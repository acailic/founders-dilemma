import { Stack, Card, Text, Group, Badge, Grid, ScrollArea, Timeline, RingProgress } from '@mantine/core';
import { useState } from 'react';
import MiniChart from './MiniChart';
import type { GameState } from '../../types/game-systems';

interface HistoryViewProps {
  gameState: GameState;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default function HistoryView({ gameState }: HistoryViewProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { history } = gameState;
  const displayWeek = selectedWeek !== null
    ? history.find(h => h.week === selectedWeek)
    : history[history.length - 1];

  if (history.length === 0) {
    return (
      <Card withBorder padding="xl">
        <Stack align="center" gap="md">
          <Text size="xl">📊</Text>
          <Text size="lg" fw={600}>No History Yet</Text>
          <Text size="sm" c="dimmed">
            Complete your first week to start tracking progress
          </Text>
        </Stack>
      </Card>
    );
  }

  // Calculate overall stats
  const totalWeeks = history.length;
  const startBank = history[0].bank;
  const currentBank = history[history.length - 1].bank;
  const totalBankChange = currentBank - startBank;
  const startMRR = history[0].mrr;
  const currentMRR = history[history.length - 1].mrr;
  const mrrGrowth = startMRR > 0 ? ((currentMRR - startMRR) / startMRR) * 100 : 0;
  const peakMorale = Math.max(...history.map(h => h.morale));
  const avgMorale = history.reduce((sum, h) => sum + h.morale, 0) / history.length;

  return (
    <Stack gap="lg">
      {/* Overview Stats */}
      <Grid>
        <Grid.Col span={3}>
          <Card withBorder padding="md">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">Total Weeks</Text>
              <Group gap="xs" align="baseline">
                <Text size="xl" fw={700}>{totalWeeks}</Text>
                <Text size="sm" c="dimmed">weeks</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card withBorder padding="md">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">Bank Change</Text>
              <Group gap="xs" align="baseline">
                <Text size="xl" fw={700} c={totalBankChange >= 0 ? 'green' : 'red'}>
                  {totalBankChange >= 0 ? '+' : ''}{formatCurrency(totalBankChange)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {formatCurrency(startBank)} → {formatCurrency(currentBank)}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card withBorder padding="md">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">MRR Growth</Text>
              <Group gap="xs" align="baseline">
                <Text size="xl" fw={700} c={mrrGrowth >= 0 ? 'green' : 'red'}>
                  {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(0)}%
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {formatCurrency(startMRR)} → {formatCurrency(currentMRR)}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card withBorder padding="md">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">Team Morale</Text>
              <Group gap="xs" align="baseline">
                <Text size="xl" fw={700}>{avgMorale.toFixed(0)}%</Text>
                <Text size="sm" c="dimmed">avg</Text>
              </Group>
              <Text size="xs" c="dimmed">Peak: {peakMorale.toFixed(0)}%</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Charts */}
      <Grid>
        <Grid.Col span={6}>
          <Card withBorder padding="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={700}>💰 Bank Over Time</Text>
                <Badge size="sm" variant="light">
                  {history.length} weeks
                </Badge>
              </Group>
              <MiniChart
                data={history.map(h => ({ week: h.week, value: h.bank }))}
                color="var(--fd-warning-strong)"
                width={400}
                height={120}
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder padding="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={700}>💵 MRR Over Time</Text>
                <Badge size="sm" variant="light" color="green">
                  {history.length} weeks
                </Badge>
              </Group>
              <MiniChart
                data={history.map(h => ({ week: h.week, value: h.mrr }))}
                color="var(--fd-positive-border)"
                width={400}
                height={120}
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder padding="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={700}>👥 Users Over Time</Text>
                <Badge size="sm" variant="light" color="blue">
                  {history.length} weeks
                </Badge>
              </Group>
              <MiniChart
                data={history.map(h => ({ week: h.week, value: h.wau }))}
                color="var(--fd-info-strong)"
                width={400}
                height={120}
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder padding="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={700}>💪 Morale Over Time</Text>
                <Badge size="sm" variant="light" color="pink">
                  {history.length} weeks
                </Badge>
              </Group>
              <MiniChart
                data={history.map(h => ({ week: h.week, value: h.morale }))}
                color="var(--mantine-color-pink-6)"
                width={400}
                height={120}
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Week Timeline */}
      <Card withBorder padding="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={700}>📅 Week-by-Week Progress</Text>
            {selectedWeek !== null && (
              <Badge
                size="sm"
                variant="filled"
                color="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedWeek(null)}
              >
                Clear Selection
              </Badge>
            )}
          </Group>

          <ScrollArea h={400}>
            <Timeline active={history.length - 1} bulletSize={24} lineWidth={2}>
              {history.map((week, index) => {
                const isSelected = selectedWeek === week.week;
                const bankChange = index > 0 ? week.bank - history[index - 1].bank : 0;
                const mrrChange = index > 0 ? week.mrr - history[index - 1].mrr : 0;
                const moraleChange = index > 0 ? week.morale - history[index - 1].morale : 0;

                return (
                  <Timeline.Item
                    key={week.week}
                    bullet={<Text size="xs" fw={700}>{week.week}</Text>}
                    title={
                      <Group gap="xs">
                        <Text size="sm" fw={600}>Week {week.week}</Text>
                        {isSelected && <Badge size="xs" color="blue">Selected</Badge>}
                      </Group>
                    }
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                    }}
                    onClick={() => setSelectedWeek(isSelected ? null : week.week)}
                  >
                    <Stack gap="xs" mt="xs">
                      <Group gap="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Bank:</Text>
                          <Text size="xs" fw={600}>{formatCurrency(week.bank)}</Text>
                          {bankChange !== 0 && (
                            <Text size="xs" c={bankChange > 0 ? 'green' : 'red'}>
                              ({bankChange > 0 ? '+' : ''}{formatCurrency(bankChange)})
                            </Text>
                          )}
                        </Group>

                        <Group gap="xs">
                          <Text size="xs" c="dimmed">MRR:</Text>
                          <Text size="xs" fw={600}>{formatCurrency(week.mrr)}</Text>
                          {mrrChange !== 0 && (
                            <Text size="xs" c={mrrChange > 0 ? 'green' : 'red'}>
                              ({mrrChange > 0 ? '+' : ''}{formatCurrency(mrrChange)})
                            </Text>
                          )}
                        </Group>
                      </Group>

                      <Group gap="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">WAU:</Text>
                          <Text size="xs" fw={600}>{week.wau.toLocaleString()}</Text>
                        </Group>

                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Morale:</Text>
                          <Text size="xs" fw={600}>{week.morale.toFixed(0)}%</Text>
                          {moraleChange !== 0 && (
                            <Text size="xs" c={moraleChange > 0 ? 'green' : 'red'}>
                              ({moraleChange > 0 ? '+' : ''}{moraleChange.toFixed(0)}%)
                            </Text>
                          )}
                        </Group>
                      </Group>
                    </Stack>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </ScrollArea>
        </Stack>
      </Card>
    </Stack>
  );
}
