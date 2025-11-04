import React, { useState } from 'react';
import { Card, Text, Badge, Group, Stack, Collapse, Tooltip, Box, Transition } from '@mantine/core';
import { IconInfoCircle, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { MarketCondition } from '../../types/game-systems';

interface MarketConditionsPanelProps {
  conditions: MarketCondition[];
  compact?: boolean;
}

export function MarketConditionsPanel({ conditions, compact = false }: MarketConditionsPanelProps) {
  const [expanded, setExpanded] = useState(!compact);

  if (conditions.length === 0) return null;

  const getConditionIcon = (condition: MarketCondition): string => {
    switch (condition.id) {
      case 'bull_market':
        return '📈';
      case 'recession':
        return '📉';
      case 'competitor_launch':
        return '🏁';
      case 'tech_boom':
        return '🚀';
      case 'regulation_change':
        return '⚖️';
      case 'talent_war':
        return '👥';
      default:
        return '🌍';
    }
  };

  const getConditionGradient = (condition: MarketCondition): string => {
    const positive = condition.modifiers.filter(m => m.multiplier > 1).length;
    const negative = condition.modifiers.filter(m => m.multiplier < 1).length;
    if (positive > negative) return 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
    if (negative > positive) return 'linear-gradient(135deg, #ffebee, #ffcdd2)';
    return 'linear-gradient(135deg, #fff3e0, #ffcc02)';
  };

  const getModifierIcon = (stat: string): string => {
    switch (stat) {
      case 'fundraising':
      case 'burn':
        return '💰';
      case 'hiring':
        return '👥';
      case 'wau_growth':
      case 'growth':
        return '📈';
      case 'velocity':
        return '⚡';
      case 'morale':
        return '💪';
      case 'reputation':
        return '⭐';
      case 'churn':
        return '📉';
      default:
        return '📊';
    }
  };

  const getStrategicAdvice = (condition: MarketCondition): string => {
    switch (condition.id) {
      case 'bull_market':
        return 'During Bull Market, consider fundraising or aggressive hiring to capitalize on favorable conditions.';
      case 'recession':
        return 'During Recession, focus on cost control and operational efficiency while waiting for recovery.';
      case 'competitor_launch':
        return 'With Competitor Launch, differentiate through superior product or customer service.';
      case 'tech_boom':
        return 'Tech Boom offers high velocity but expensive talent—prioritize hiring key roles.';
      case 'regulation_change':
        return 'Regulation Change increases compliance needs; allocate focus to compliance work.';
      case 'talent_war':
        return 'Talent War makes hiring costly; consider coaching existing team or delaying hires.';
      default:
        return 'Adapt your strategy to current market conditions for optimal results.';
    }
  };

  return (
    <Transition transition="slide-down" duration={400} mounted>
      {(styles) => (
        <div style={styles}>
          <Card shadow="sm" p="md" withBorder radius="md">
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <Text size="lg" fw={600}>🌍 Market Conditions</Text>
                <Text size="sm" c="dimmed">External factors affecting your startup</Text>
              </Group>
              {conditions.length > 1 && !compact && (
                <Tooltip label={expanded ? 'Collapse' : 'Expand'}>
                  <IconChevronDown
                    size={20}
                    style={{
                      cursor: 'pointer',
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => setExpanded(!expanded)}
                  />
                </Tooltip>
              )}
            </Group>
            <Collapse in={expanded}>
              <Stack gap="md">
                {conditions.map((condition) => (
                  <Card
                    key={condition.id}
                    withBorder
                    radius="sm"
                    style={{
                      background: getConditionGradient(condition),
                      border: `2px solid ${condition.modifiers.some(m => m.multiplier > 1) ? '#4caf50' : condition.modifiers.some(m => m.multiplier < 1) ? '#f44336' : '#ff9800'}`,
                    }}
                  >
                    <Group wrap="nowrap" gap="sm">
                      <Text size="xl">{getConditionIcon(condition)}</Text>
                      <Box flex={1}>
                        <Text fw={600} size="md">{condition.name}</Text>
                        <Text size="sm" c="dimmed" mb="xs">{condition.description}</Text>
                        <Badge size="sm" color="blue" mb="xs">
                          {condition.duration_weeks} weeks remaining
                        </Badge>
                        <Group gap="xs" wrap>
                          {condition.modifiers.map((mod, idx) => (
                            <Badge
                              key={idx}
                              size="sm"
                              color={mod.multiplier > 1 ? 'green' : mod.multiplier < 1 ? 'red' : 'gray'}
                              variant="filled"
                            >
                              {getModifierIcon(mod.stat_affected)} {mod.stat_affected.replace('_', ' ')} {mod.multiplier > 1 ? '+' : ''}{((mod.multiplier - 1) * 100).toFixed(0)}%
                            </Badge>
                          ))}
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">
                          {getStrategicAdvice(condition)}
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Collapse>
            <Group mt="md" justify="center">
              <Tooltip
                label="Market conditions represent external economic and industry factors that can boost or hinder your startup's performance. They last for several weeks and require strategic adaptation."
                position="top"
                withArrow
              >
                <IconInfoCircle size={18} style={{ cursor: 'pointer' }} />
              </Tooltip>
            </Group>
          </Card>
        </div>
      )}
    </Transition>
  );
}