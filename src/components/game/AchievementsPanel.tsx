import { Card, Stack, Group, Badge, Text, Progress, Tooltip } from '@mantine/core';

interface GameState {
  week: number;
  bank: number;
  mrr: number;
  wau: number;
  morale: number;
  reputation: number;
  founder_equity: number;
  tech_debt: number;
  velocity: number;
  escape_velocity_progress: {
    streak_weeks: number;
  };
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  check: (state: GameState) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsPanelProps {
  gameState: GameState;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_week',
    icon: '🎯',
    name: 'First Steps',
    description: 'Survive your first week',
    check: (state) => state.week >= 1,
    rarity: 'common',
  },
  {
    id: 'month_survivor',
    icon: '📅',
    name: 'Month Survivor',
    description: 'Survive 4 weeks',
    check: (state) => state.week >= 4,
    rarity: 'common',
  },
  {
    id: 'quarter_master',
    icon: '🗓️',
    name: 'Quarter Master',
    description: 'Survive 12 weeks',
    check: (state) => state.week >= 12,
    rarity: 'rare',
  },
  {
    id: 'half_year_hero',
    icon: '⏳',
    name: 'Half-Year Hero',
    description: 'Survive 26 weeks',
    check: (state) => state.week >= 26,
    rarity: 'epic',
  },
  {
    id: 'cash_king',
    icon: '💰',
    name: 'Cash King',
    description: 'Reach $1M in bank',
    check: (state) => state.bank >= 1000000,
    rarity: 'rare',
  },
  {
    id: 'revenue_rocket',
    icon: '💵',
    name: 'Revenue Rocket',
    description: 'Reach $100k MRR',
    check: (state) => state.mrr >= 100000,
    rarity: 'epic',
  },
  {
    id: 'user_magnet',
    icon: '👥',
    name: 'User Magnet',
    description: 'Reach 10,000 WAU',
    check: (state) => state.wau >= 10000,
    rarity: 'rare',
  },
  {
    id: 'happiness_guru',
    icon: '😊',
    name: 'Happiness Guru',
    description: 'Maintain 80+ morale for 4 weeks',
    check: (state) => state.morale >= 80 && state.week >= 4,
    rarity: 'rare',
  },
  {
    id: 'reputation_legend',
    icon: '⭐',
    name: 'Reputation Legend',
    description: 'Reach 90+ reputation',
    check: (state) => state.reputation >= 90,
    rarity: 'epic',
  },
  {
    id: 'clean_coder',
    icon: '✨',
    name: 'Clean Coder',
    description: 'Keep tech debt under 20',
    check: (state) => state.tech_debt <= 20 && state.week >= 4,
    rarity: 'rare',
  },
  {
    id: 'speed_demon',
    icon: '⚡',
    name: 'Speed Demon',
    description: 'Reach 2.0x velocity',
    check: (state) => state.velocity >= 2.0,
    rarity: 'epic',
  },
  {
    id: 'bootstrapper',
    icon: '🏠',
    name: 'Bootstrapper',
    description: 'Reach profitability with 90%+ equity',
    check: (state) => state.mrr >= state.bank && state.founder_equity >= 90,
    rarity: 'legendary',
  },
  {
    id: 'escape_velocity_streak',
    icon: '🚀',
    name: 'Escape Velocity',
    description: 'Hit all 4 escape velocity conditions',
    check: (state) => state.escape_velocity_progress.streak_weeks >= 1,
    rarity: 'epic',
  },
  {
    id: 'sustained_growth',
    icon: '📈',
    name: 'Sustained Growth',
    description: 'Maintain escape velocity for 8 weeks',
    check: (state) => state.escape_velocity_progress.streak_weeks >= 8,
    rarity: 'legendary',
  },
];

export default function AchievementsPanel({ gameState }: AchievementsPanelProps) {
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(gameState));
  const totalAchievements = ACHIEVEMENTS.length;
  const progressPercent = (unlockedAchievements.length / totalAchievements) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'gray';
      case 'rare': return 'blue';
      case 'epic': return 'violet';
      case 'legendary': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text size="lg">🏆</Text>
            <Text size="sm" fw={700}>Achievements</Text>
          </Group>
          <Badge size="lg" color="blue">
            {unlockedAchievements.length} / {totalAchievements}
          </Badge>
        </Group>

        <Progress
          value={progressPercent}
          color="blue"
          size="lg"
          animated
        />

        <Stack gap="xs">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = achievement.check(gameState);
            return (
              <Tooltip
                key={achievement.id}
                label={achievement.description}
                position="top"
                withArrow
              >
                <Card
                  withBorder
                  padding="sm"
                  style={{
                    opacity: unlocked ? 1 : 0.4,
                    background: unlocked ? 'var(--fd-positive-surface)' : undefined,
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <Text size="lg">{achievement.icon}</Text>
                      <Stack gap={0}>
                        <Text size="xs" fw={700}>{achievement.name}</Text>
                        <Badge size="xs" color={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </Stack>
                    </Group>
                    {unlocked && <Badge color="green" size="sm">✓</Badge>}
                  </Group>
                </Card>
              </Tooltip>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
