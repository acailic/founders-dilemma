import { Modal, Stack, Title, Text, Button, Card, Group, Badge, Divider } from '@mantine/core';

interface GameState {
  week: number;
  bank: number;
  mrr: number;
  wau: number;
  morale: number;
  reputation: number;
  founder_equity: number;
  momentum: number;
  escape_velocity_progress: {
    streak_weeks: number;
  };
}

interface GameOverProps {
  status: string;
  gameState: GameState;
  onRestart: () => void;
}

export default function GameOver({ status, gameState, onRestart }: GameOverProps) {
  const isVictory = status === 'victory';
  const defeatReason = status.startsWith('defeat:') ? status.split(':')[1] : '';

  const getDefeatMessage = (reason: string) => {
    switch (reason) {
      case 'out_of_money':
        return {
          title: 'Out of Cash',
          message: 'Your startup ran out of money. The dream is over... for now.',
        };
      case 'burnout':
        return {
          title: 'Founder Burnout',
          message: "You pushed too hard. Sometimes the best decision is knowing when to step back.",
        };
      case 'reputation':
        return {
          title: 'Reputation Destroyed',
          message: 'Trust is hard to build and easy to lose. Your brand never recovered.',
        };
      default:
        return { title: 'Game Over', message: 'The startup journey ends here.' };
    }
  };

  const defeat = getDefeatMessage(defeatReason);

  // Calculate founder score (simplified)
  const founderScore = Math.round(
    (gameState.momentum * gameState.reputation * (gameState.founder_equity / 100)) / 10
  );

  return (
    <Modal
      opened={true}
      onClose={onRestart}
      centered
      size="xl"
      withCloseButton={false}
    >
      <Stack gap="xl">
        {/* Victory/Defeat Header */}
        <Stack gap="md" align="center">
          <Text size="80px" style={{ lineHeight: 1 }}>
            {isVictory ? '🎉' : '💀'}
          </Text>
          <Title order={1} ta="center" size="h2">
            {isVictory ? 'Escape Velocity Achieved!' : defeat.title}
          </Title>
          <Text size="lg" ta="center" maw={500}>
            {isVictory
              ? `You achieved sustainable growth after ${gameState.escape_velocity_progress.streak_weeks} weeks of hitting all targets!`
              : defeat.message}
          </Text>
        </Stack>

        <Divider />

        {/* Stats Grid */}
        <Stack gap="md">
          <Title order={3} ta="center">Journey Summary</Title>
          <Group grow>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">⏱️</Text>
                <Text size="xs" c="dimmed">Weeks</Text>
                <Text size="lg" fw={700}>{gameState.week}</Text>
              </Stack>
            </Card>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">💰</Text>
                <Text size="xs" c="dimmed">Final Bank</Text>
                <Text size="lg" fw={700}>${(gameState.bank / 1000).toFixed(0)}k</Text>
              </Stack>
            </Card>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">💵</Text>
                <Text size="xs" c="dimmed">MRR</Text>
                <Text size="lg" fw={700}>${(gameState.mrr / 1000).toFixed(0)}k</Text>
              </Stack>
            </Card>
          </Group>

          <Group grow>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">👥</Text>
                <Text size="xs" c="dimmed">WAU</Text>
                <Text size="lg" fw={700}>{gameState.wau.toLocaleString()}</Text>
              </Stack>
            </Card>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">💪</Text>
                <Text size="xs" c="dimmed">Morale</Text>
                <Badge size="lg" color={gameState.morale > 50 ? 'green' : 'red'}>
                  {gameState.morale.toFixed(0)}
                </Badge>
              </Stack>
            </Card>
            <Card withBorder padding="md">
              <Stack gap="xs" align="center">
                <Text size="xl">🎖️</Text>
                <Text size="xs" c="dimmed">Reputation</Text>
                <Badge size="lg" color={gameState.reputation > 50 ? 'green' : 'red'}>
                  {gameState.reputation.toFixed(0)}
                </Badge>
              </Stack>
            </Card>
          </Group>
        </Stack>

        <Divider />

        {/* Founder Score */}
        <Card withBorder padding="xl" style={{ background: isVictory ? 'var(--fd-positive-surface)' : 'var(--fd-surface-2)' }}>
          <Stack gap="md" align="center">
            <Title order={2}>Founder Score</Title>
            <Text size="60px" fw={700} c={isVictory ? 'green' : 'red'} style={{ lineHeight: 1 }}>
              {founderScore}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Momentum × Reputation × Equity Retained
            </Text>
            <Badge size="xl" variant="filled">
              {gameState.founder_equity.toFixed(1)}% equity retained
            </Badge>
          </Stack>
        </Card>

        {/* Actions */}
        <Group grow>
          <Button size="xl" variant="filled" onClick={onRestart}>
            {isVictory ? '🚀 Play Again' : '💪 Try Again'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
