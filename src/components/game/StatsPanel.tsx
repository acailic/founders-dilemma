import { Grid, Card, Text, Progress, Group, Stack, Badge, Tooltip } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import MiniChart from './MiniChart';
import { useGameConfig } from '../../common/GameConfigContext';
import { calculateTrend, getTrendArrow, getTrendColor, formatForecast } from './MetricTrends';
import EnhancedTooltip, { TOOLTIP_CONTENT } from './EnhancedTooltip';
import './MetricAnimations.css';
import type { GameState } from '../../types/game-systems';

interface StatsPanelProps {
  gameState: GameState;
  onMetricClick?: (metric: string) => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function getRunwayColor(months: number): string {
  if (months > 6) return 'green';
  if (months > 3) return 'yellow';
  return 'red';
}

function getMetricColor(value: number, threshold: number = 50): string {
  if (value >= threshold) return 'green';
  if (value >= threshold * 0.6) return 'yellow';
  return 'red';
}

function getGrowthIcon(rate: number): string {
  if (rate > 5) return '📈';
  if (rate > 0) return '↗️';
  if (rate === 0) return '➡️';
  return '📉';
}

export default function StatsPanel({ gameState, onMetricClick }: StatsPanelProps) {
  const { escape_velocity_progress } = gameState;
  const { config } = useGameConfig();

  // Track previous values for change animations
  const prevValues = useRef<Record<string, number>>({});
  const [animatingMetrics, setAnimatingMetrics] = useState<Record<string, 'positive' | 'negative' | null>>({});

  // Detect value changes and trigger animations
  useEffect(() => {
    const changes: Record<string, 'positive' | 'negative' | null> = {};

    const metrics = {
      bank: gameState.bank,
      mrr: gameState.mrr,
      wau: gameState.wau,
      morale: gameState.morale,
      reputation: gameState.reputation,
      nps: gameState.nps,
      tech_debt: gameState.tech_debt,
      velocity: gameState.velocity,
      founder_equity: gameState.founder_equity,
    };

    Object.entries(metrics).forEach(([key, value]) => {
      if (prevValues.current[key] !== undefined && prevValues.current[key] !== value) {
        // Determine if change is positive or negative (context-dependent)
        const isPositive = key === 'tech_debt' ? value < prevValues.current[key] : value > prevValues.current[key];
        changes[key] = isPositive ? 'positive' : 'negative';
      }
      prevValues.current[key] = value;
    });

    if (Object.keys(changes).length > 0) {
      setAnimatingMetrics(changes);
      // Clear animations after they complete
      setTimeout(() => setAnimatingMetrics({}), 800);
    }
  }, [gameState.week]); // Trigger on week change

  // Prepare chart data from history
  const chartData = {
    bank: gameState.history.map(h => ({ week: h.week, value: h.bank })),
    mrr: gameState.history.map(h => ({ week: h.week, value: h.mrr })),
    wau: gameState.history.map(h => ({ week: h.week, value: h.wau })),
    morale: gameState.history.map(h => ({ week: h.week, value: h.morale })),
  };

  // Calculate trends for metrics
  const trends = {
    bank: calculateTrend(chartData.bank, true),
    mrr: calculateTrend(chartData.mrr, true),
    wau: calculateTrend(chartData.wau, true),
    morale: calculateTrend(chartData.morale, true),
  };

  // Helper to get card class based on metric state
  const getCardClass = (metricKey: string, value: number, criticalThreshold: number, warningThreshold: number, isHigherBetter: boolean = true) => {
    let classes = 'sdv-stat-card';

    if (animatingMetrics[metricKey]) {
      classes += ` ${animatingMetrics[metricKey]}-change`;
    }

    if (isHigherBetter) {
      if (value < criticalThreshold) classes += ' critical-metric';
      else if (value < warningThreshold) classes += ' warning-metric';
    } else {
      if (value > criticalThreshold) classes += ' critical-metric';
      else if (value > warningThreshold) classes += ' warning-metric';
    }

    return classes;
  };

  return (
    <Stack gap="md">
      {/* Escape Velocity Progress */}
      <Card withBorder padding="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={700}>
              Escape Velocity Progress
            </Text>
            <Badge color={escape_velocity_progress.streak_weeks >= 12 ? 'green' : 'blue'}>
              {escape_velocity_progress.streak_weeks} / 12 weeks
            </Badge>
          </Group>
          <Group gap="xs">
            <Badge
              color={escape_velocity_progress.revenue_covers_burn ? 'green' : 'gray'}
              variant={escape_velocity_progress.revenue_covers_burn ? 'filled' : 'light'}
            >
              Revenue ≥ Burn
            </Badge>
            <Badge
              color={escape_velocity_progress.growth_sustained ? 'green' : 'gray'}
              variant={escape_velocity_progress.growth_sustained ? 'filled' : 'light'}
            >
              Growth ≥ 10%
            </Badge>
            <Badge
              color={escape_velocity_progress.customer_love ? 'green' : 'gray'}
              variant={escape_velocity_progress.customer_love ? 'filled' : 'light'}
            >
              NPS ≥ 30
            </Badge>
            <Badge
              color={escape_velocity_progress.founder_healthy ? 'green' : 'gray'}
              variant={escape_velocity_progress.founder_healthy ? 'filled' : 'light'}
            >
              Morale {'>'}  40
            </Badge>
          </Group>
        </Stack>
      </Card>

      {/* Main Metrics Grid */}
      <Grid>
        {/* Financial Metrics */}
        <Grid.Col span={3}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.bank}
                currentValue={formatCurrency(gameState.bank)}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('bank', gameState.bank, 10000, 30000, true)}
              onClick={() => onMetricClick?.('bank')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    <Text size="lg">💰</Text>
                    <Text size="xs" c="dimmed">Bank</Text>
                  </Group>
                  {trends.bank && (
                    <Text size="sm" className="trend-indicator">
                      {getTrendArrow(trends.bank.direction, true)}
                    </Text>
                  )}
                </Group>
                <Text size="lg" fw={700} className="sdv-currency metric-value">
                  {formatCurrency(gameState.bank)}
                </Text>
                {trends.bank && (
                  <Text size="xs" c={getTrendColor(trends.bank.direction, true)} className="forecast-text">
                    {formatForecast(trends.bank.forecast, formatCurrency, trends.bank.weeksForecast)}
                  </Text>
                )}
                {chartData.bank.length > 1 && (
                  <MiniChart data={chartData.bank} color="var(--fd-warning-strong)" width={80} height={30} />
                )}
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={3}>
          <Tooltip label="Click for detailed info" position="top" withArrow>
            <Card
              withBorder
              padding="md"
              className="sdv-stat-card"
              onClick={() => onMetricClick?.('burn')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">🔥</Text>
                  <Text size="xs" c="dimmed">Burn/mo</Text>
                </Group>
                <Text size="lg" fw={700}>
                  {formatCurrency(gameState.burn)}
                </Text>
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={3}>
          <Tooltip label="Time until you run out of money at current burn rate. Red < 3mo, Yellow < 6mo." position="top" withArrow>
            <Card withBorder padding="md" className="sdv-stat-card">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">⏰</Text>
                  <Text size="xs" c="dimmed">Runway</Text>
                </Group>
                <Text size="lg" fw={700} c={getRunwayColor(gameState.runway_months)}>
                  {gameState.runway_months.toFixed(1)} mo
                </Text>
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={3}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.mrr}
                currentValue={formatCurrency(gameState.mrr)}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('mrr', gameState.mrr, 1000, 10000, true)}
              onClick={() => onMetricClick?.('mrr')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    <Text size="lg">💵</Text>
                    <Text size="xs" c="dimmed">MRR</Text>
                  </Group>
                  {trends.mrr && (
                    <Text size="sm" className="trend-indicator">
                      {getTrendArrow(trends.mrr.direction, true)}
                    </Text>
                  )}
                </Group>
                <Text size="lg" fw={700} className="metric-value">
                  {formatCurrency(gameState.mrr)}
                </Text>
                {trends.mrr && (
                  <Text size="xs" c={getTrendColor(trends.mrr.direction, true)} className="forecast-text">
                    {formatForecast(trends.mrr.forecast, formatCurrency, trends.mrr.weeksForecast)}
                  </Text>
                )}
                {chartData.mrr.length > 1 && (
                  <MiniChart data={chartData.mrr} color="var(--fd-positive-border)" width={80} height={30} />
                )}
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        {/* Growth Metrics */}
        <Grid.Col span={4}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.wau}
                currentValue={gameState.wau.toLocaleString()}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('wau', gameState.wau, 100, 1000, true)}
              onClick={() => onMetricClick?.('wau')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    <Text size="lg">👥</Text>
                    <Text size="xs" c="dimmed">Weekly Active Users</Text>
                  </Group>
                  {trends.wau && (
                    <Text size="sm" className="trend-indicator">
                      {getTrendArrow(trends.wau.direction, true)}
                    </Text>
                  )}
                </Group>
                <Text size="lg" fw={700} className="metric-value">
                  {gameState.wau.toLocaleString()}
                </Text>
                <Group gap="xs">
                  <Text size="lg">{getGrowthIcon(gameState.wau_growth_rate)}</Text>
                  <Text size="xs" c={gameState.wau_growth_rate >= 0 ? 'green' : 'red'}>
                    {gameState.wau_growth_rate >= 0 ? '+' : ''}
                    {gameState.wau_growth_rate.toFixed(1)}%
                  </Text>
                </Group>
                {trends.wau && (
                  <Text size="xs" c={getTrendColor(trends.wau.direction, true)} className="forecast-text">
                    → {Math.round(trends.wau.forecast).toLocaleString()} in {trends.wau.weeksForecast}wk
                  </Text>
                )}
                {chartData.wau.length > 1 && (
                  <MiniChart data={chartData.wau} color="var(--fd-info-strong)" width={120} height={30} />
                )}
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={4}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.nps}
                currentValue={gameState.nps.toFixed(0)}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('nps', gameState.nps, 0, 30, true)}
              onClick={() => onMetricClick?.('nps')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">⭐</Text>
                  <Text size="xs" c="dimmed">NPS</Text>
                </Group>
                <Text size="lg" fw={700} c={getMetricColor(gameState.nps, 30)} className="metric-value">
                  {gameState.nps.toFixed(0)}
                </Text>
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={4}>
          <Tooltip label="Percentage of users leaving each week. Affected by NPS and incidents." position="top" withArrow>
            <Card withBorder padding="md" className="sdv-stat-card">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">🚪</Text>
                  <Text size="xs" c="dimmed">Churn Rate</Text>
                </Group>
                <Text size="lg" fw={700} c={gameState.churn_rate > 5 ? 'red' : gameState.churn_rate > 3 ? 'yellow' : 'green'}>
                  {gameState.churn_rate.toFixed(1)}%
                </Text>
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        {/* Health Metrics */}
        <Grid.Col span={6}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.morale}
                currentValue={`${gameState.morale.toFixed(0)}%`}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('morale', gameState.morale, 40, 60, true)}
              onClick={() => onMetricClick?.('morale')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="lg">💪</Text>
                    <Text size="xs" c="dimmed">Morale</Text>
                    {trends.morale && (
                      <Text size="sm" className="trend-indicator">
                        {getTrendArrow(trends.morale.direction, true)}
                      </Text>
                    )}
                  </Group>
                  <Badge color={getMetricColor(gameState.morale)} className="metric-value">
                    {gameState.morale.toFixed(0)}%
                  </Badge>
                </Group>
                <Progress
                  value={gameState.morale}
                  color={getMetricColor(gameState.morale)}
                  size="xl"
                  animated
                  className="progress-animated"
                />
                {trends.morale && (
                  <Text size="xs" c={getTrendColor(trends.morale.direction, true)} className="forecast-text">
                    → {Math.round(trends.morale.forecast)}% in {trends.morale.weeksForecast}wk
                  </Text>
                )}
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={6}>
          <Tooltip
            label={
              <EnhancedTooltip
                {...TOOLTIP_CONTENT.reputation}
                currentValue={`${gameState.reputation.toFixed(0)}%`}
              />
            }
            position="top"
            withArrow
          >
            <Card
              withBorder
              padding="md"
              className={getCardClass('reputation', gameState.reputation, 30, 70, true)}
              onClick={() => onMetricClick?.('reputation')}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="lg">🎖️</Text>
                    <Text size="xs" c="dimmed">Reputation</Text>
                  </Group>
                  <Badge color={getMetricColor(gameState.reputation)} className="metric-value">
                    {gameState.reputation.toFixed(0)}%
                  </Badge>
                </Group>
                <Progress
                  value={gameState.reputation}
                  color={getMetricColor(gameState.reputation)}
                  size="xl"
                  animated
                  className="progress-animated"
                />
              </Stack>
            </Card>
          </Tooltip>
        </Grid.Col>

        {/* Technical Metrics */}
        {config.showAdvancedMetrics && (
          <>
            <Grid.Col span={4}>
              <Tooltip
                label={
                  <EnhancedTooltip
                    {...TOOLTIP_CONTENT.tech_debt}
                    currentValue={gameState.tech_debt.toFixed(0)}
                  />
                }
                position="top"
                withArrow
              >
                <Card
                  withBorder
                  padding="md"
                  className={getCardClass('tech_debt', gameState.tech_debt, 70, 40, false)}
                  onClick={() => onMetricClick?.('tech_debt')}
                  style={{ cursor: 'pointer' }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="lg">⚠️</Text>
                        <Text size="xs" c="dimmed">Tech Debt</Text>
                      </Group>
                      <Badge color={gameState.tech_debt > 70 ? 'red' : gameState.tech_debt > 40 ? 'yellow' : 'green'} className="metric-value">
                        {gameState.tech_debt.toFixed(0)}
                      </Badge>
                    </Group>
                    <Progress
                      value={gameState.tech_debt}
                      color={gameState.tech_debt > 70 ? 'red' : gameState.tech_debt > 40 ? 'yellow' : 'green'}
                      size="xl"
                      className="progress-animated"
                    />
                  </Stack>
                </Card>
              </Tooltip>
            </Grid.Col>

            <Grid.Col span={4}>
              <Tooltip
                label={
                  <EnhancedTooltip
                    {...TOOLTIP_CONTENT.velocity}
                    currentValue={`${gameState.velocity.toFixed(2)}x`}
                  />
                }
                position="top"
                withArrow
              >
                <Card
                  withBorder
                  padding="md"
                  className={getCardClass('velocity', gameState.velocity, 0.5, 1.0, true)}
                  onClick={() => onMetricClick?.('velocity')}
                  style={{ cursor: 'pointer' }}
                >
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="lg">⚡</Text>
                      <Text size="xs" c="dimmed">Velocity</Text>
                    </Group>
                    <Text size="lg" fw={700} className="metric-value">
                      {gameState.velocity.toFixed(2)}x
                    </Text>
                  </Stack>
                </Card>
              </Tooltip>
            </Grid.Col>

            <Grid.Col span={4}>
              <Tooltip
                label={
                  <EnhancedTooltip
                    {...TOOLTIP_CONTENT.equity}
                    currentValue={`${gameState.founder_equity.toFixed(1)}%`}
                  />
                }
                position="top"
                withArrow
              >
                <Card
                  withBorder
                  padding="md"
                  className={getCardClass('founder_equity', gameState.founder_equity, 20, 50, true)}
                  onClick={() => onMetricClick?.('equity')}
                  style={{ cursor: 'pointer' }}
                >
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="lg">📊</Text>
                      <Text size="xs" c="dimmed">Equity</Text>
                    </Group>
                    <Text size="lg" fw={700} className="metric-value">
                      {gameState.founder_equity.toFixed(1)}%
                    </Text>
                  </Stack>
                </Card>
              </Tooltip>
            </Grid.Col>
          </>
        )}
      </Grid>
    </Stack>
  );
}
