import { Card, Group, Stack, Text, Badge, ActionIcon, Transition } from '@mantine/core';
import { useState } from 'react';
import './CriticalStatusBanner.css';
import type { GameState } from '../../types/game-systems';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'opportunity';
  icon: string;
  message: string;
  details?: string;
  priority: number; // Higher = more important
}

interface CriticalStatusBannerProps {
  gameState: GameState;
}

function detectAlerts(gameState: GameState): Alert[] {
  const alerts: Alert[] = [];
  const { history } = gameState;

  // CRITICAL ALERTS (priority 90-100)

  // Runway critical
  if (gameState.runway_months < 2) {
    alerts.push({
      id: 'runway-critical',
      severity: 'critical',
      icon: '🚨',
      message: `CRITICAL: Only ${gameState.runway_months.toFixed(1)} months runway left!`,
      details: 'Fundraise immediately or cut burn rate',
      priority: 100,
    });
  } else if (gameState.runway_months < 3) {
    alerts.push({
      id: 'runway-warning',
      severity: 'critical',
      icon: '⚠️',
      message: `WARNING: Runway at ${gameState.runway_months.toFixed(1)} months`,
      details: 'Consider fundraising or reducing burn',
      priority: 95,
    });
  }

  // Morale critical (team will quit)
  if (gameState.morale < 25) {
    alerts.push({
      id: 'morale-critical',
      severity: 'critical',
      icon: '💥',
      message: 'CRITICAL: Team morale dangerously low!',
      details: 'Take a break immediately to prevent team quit',
      priority: 98,
    });
  } else if (gameState.morale < 40) {
    alerts.push({
      id: 'morale-warning',
      severity: 'critical',
      icon: '😰',
      message: `Morale at ${gameState.morale.toFixed(0)}% - team stress high`,
      details: 'Consider taking a break soon',
      priority: 92,
    });
  }

  // Bank depleting dangerously fast
  if (history.length >= 2) {
    const lastWeek = history[history.length - 1];
    const twoWeeksAgo = history[history.length - 2];
    const bankDrop = twoWeeksAgo.bank - lastWeek.bank;
    const burnRate = bankDrop / gameState.bank;

    if (burnRate > 0.15 && gameState.bank < 50000) {
      alerts.push({
        id: 'bank-depleting',
        severity: 'critical',
        icon: '📉',
        message: 'Bank depleting rapidly!',
        details: `Lost $${(bankDrop / 1000).toFixed(1)}k last week`,
        priority: 94,
      });
    }
  }

  // WARNING ALERTS (priority 70-89)

  // High churn rate
  if (gameState.churn_rate > 8) {
    alerts.push({
      id: 'churn-critical',
      severity: 'warning',
      icon: '🚪',
      message: `High churn rate: ${gameState.churn_rate.toFixed(1)}%`,
      details: 'Users leaving faster than normal',
      priority: 85,
    });
  } else if (gameState.churn_rate > 5) {
    alerts.push({
      id: 'churn-warning',
      severity: 'warning',
      icon: '📊',
      message: `Churn rate elevated at ${gameState.churn_rate.toFixed(1)}%`,
      details: 'Monitor user satisfaction',
      priority: 75,
    });
  }

  // Morale dropping fast
  if (history.length >= 2) {
    const lastMorale = history[history.length - 1].morale;
    const previousMorale = history[history.length - 2].morale;
    const moraleDrop = previousMorale - lastMorale;

    if (moraleDrop > 15) {
      alerts.push({
        id: 'morale-dropping',
        severity: 'warning',
        icon: '📉',
        message: `Morale dropped ${moraleDrop.toFixed(0)}% last week`,
        details: 'Team stress increasing rapidly',
        priority: 88,
      });
    }
  }

  // Tech debt accumulating
  if (gameState.tech_debt > 80) {
    alerts.push({
      id: 'tech-debt-high',
      severity: 'warning',
      icon: '⚠️',
      message: `Tech debt at ${gameState.tech_debt.toFixed(0)} - velocity slowing`,
      details: 'Consider refactoring or accept slower progress',
      priority: 70,
    });
  }

  // Negative growth
  if (gameState.wau_growth_rate < -5) {
    alerts.push({
      id: 'negative-growth',
      severity: 'warning',
      icon: '📉',
      message: `User base shrinking: ${gameState.wau_growth_rate.toFixed(1)}% growth`,
      details: 'Focus on retention and new features',
      priority: 87,
    });
  }

  // Low reputation
  if (gameState.reputation < 30) {
    alerts.push({
      id: 'reputation-low',
      severity: 'warning',
      icon: '😞',
      message: `Reputation at ${gameState.reputation.toFixed(0)}% - hiring will be harder`,
      details: 'Build better product and team culture',
      priority: 72,
    });
  }

  // OPPORTUNITY ALERTS (priority 50-69)

  // Escape velocity progress
  if (gameState.escape_velocity_progress.streak_weeks >= 8 && gameState.escape_velocity_progress.streak_weeks < 12) {
    alerts.push({
      id: 'escape-velocity-close',
      severity: 'opportunity',
      icon: '🚀',
      message: `${gameState.escape_velocity_progress.streak_weeks}/12 weeks to escape velocity!`,
      details: 'Keep all conditions met for victory',
      priority: 65,
    });
  }

  // Ready to fundraise
  const readyToFundraise =
    gameState.mrr > 5000 &&
    gameState.wau > 1000 &&
    gameState.wau_growth_rate > 10 &&
    gameState.nps > 30 &&
    gameState.runway_months > 3;

  if (readyToFundraise) {
    alerts.push({
      id: 'fundraise-opportunity',
      severity: 'opportunity',
      icon: '💰',
      message: 'Strong metrics! Good time to fundraise',
      details: `MRR: $${(gameState.mrr / 1000).toFixed(1)}k, Growth: ${gameState.wau_growth_rate.toFixed(1)}%`,
      priority: 68,
    });
  }

  // Strong momentum
  if (history.length >= 3) {
    const recentGrowth = history.slice(-3).every((h, i, arr) =>
      i === 0 || h.wau > arr[i - 1].wau
    );

    if (recentGrowth && gameState.wau_growth_rate > 15) {
      alerts.push({
        id: 'strong-momentum',
        severity: 'opportunity',
        icon: '📈',
        message: 'Strong growth momentum!',
        details: `${gameState.wau_growth_rate.toFixed(1)}% weekly growth`,
        priority: 60,
      });
    }
  }

  // Healthy team
  if (gameState.morale > 75 && gameState.reputation > 70) {
    alerts.push({
      id: 'team-healthy',
      severity: 'opportunity',
      icon: '💪',
      message: 'Team is thriving!',
      details: 'Good time to push hard on features',
      priority: 55,
    });
  }

  // Sort by priority (highest first) and return top 3
  return alerts.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

function getSeverityColor(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'opportunity':
      return 'green';
  }
}

export default function CriticalStatusBanner({ gameState }: CriticalStatusBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const allAlerts = detectAlerts(gameState);
  const visibleAlerts = allAlerts.filter(alert => !dismissed.has(alert.id));

  const handleDismissAlert = (alertId: string) => {
    setDismissed(new Set([...dismissed, alertId]));
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Transition mounted={!collapsed} transition="slide-down" duration={300}>
      {(styles) => (
        <Card
          withBorder
          padding="md"
          style={{
            ...styles,
            marginBottom: '1rem',
            borderWidth: '2px',
          }}
          className="critical-status-banner"
        >
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Text size="sm" fw={700} c="dimmed">
                  🎯 Status Alerts
                </Text>
                <Badge size="sm" variant="filled" color="blue">
                  {visibleAlerts.length}
                </Badge>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse alerts"
              >
                ✕
              </ActionIcon>
            </Group>

            {visibleAlerts.map((alert) => (
              <Card
                key={alert.id}
                padding="sm"
                withBorder
                className={`alert-card alert-${alert.severity}`}
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: `var(--mantine-color-${getSeverityColor(alert.severity)}-6)`,
                }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
                    <Text size="xl" style={{ lineHeight: 1 }}>
                      {alert.icon}
                    </Text>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text size="sm" fw={600}>
                        {alert.message}
                      </Text>
                      {alert.details && (
                        <Text size="xs" c="dimmed">
                          {alert.details}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    <Badge size="xs" color={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      onClick={() => handleDismissAlert(alert.id)}
                      aria-label="Dismiss alert"
                    >
                      ✕
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Card>
      )}
    </Transition>
  );
}
