import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Stack, Group, Card, Badge, Divider } from '@mantine/core';
import { invoke } from '@tauri-apps/api/core';
import GameDashboard from '../components/game/GameDashboard';
import GameOver from '../components/game/GameOver';
import StartupAnimation from '../components/game/StartupAnimation';
import { useGameConfig } from '../common/GameConfigContext';
import { THEME_PRESETS } from '../common/themePresets';
import { useLocalForage } from '../common/utils';

interface GameState {
  game_id: string;
  week: number;
  difficulty: string;
  started_at: number;
  bank: number;
  burn: number;
  runway_months: number;
  focus_slots: number;
  mrr: number;
  wau: number;
  wau_growth_rate: number;
  churn_rate: number;
  morale: number;
  reputation: number;
  nps: number;
  tech_debt: number;
  compliance_risk: number;
  velocity: number;
  founder_equity: number;
  option_pool: number;
  momentum: number;
  escape_velocity_progress: {
    revenue_covers_burn: boolean;
    growth_sustained: boolean;
    customer_love: boolean;
    founder_healthy: boolean;
    streak_weeks: number;
  };
  history: Array<{
    week: number;
    bank: number;
    mrr: number;
    burn: number;
    wau: number;
    morale: number;
    reputation: number;
    momentum: number;
  }>;
}

export default function GameView() {
  const { config } = useGameConfig();
  const accentColor = THEME_PRESETS[config.themeAccent]?.primaryColor ?? 'teal';
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStatus, setGameStatus] = useState<string>('not_started');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(config.defaultDifficulty);
  const [loading, setLoading] = useState(false);
  const [showStartupAnimation, setShowStartupAnimation] = useState(true);
  const [savedGame, setSavedGame, savedLoading] = useLocalForage<GameState | null>('saved-game-state', null);

  const startNewGame = async (difficulty: string) => {
    setLoading(true);
    try {
      const state = await invoke<GameState>('new_game', { difficulty });
      setGameState(state);
      setGameStatus('playing');
      setSavedGame(state);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGameStatus = async () => {
    if (!gameState) return;

    try {
      const status = await invoke<string>('check_game_status', { state: gameState });
      setGameStatus(status);
    } catch (error) {
      console.error('Failed to check game status:', error);
    }
  };

  useEffect(() => {
    if (gameState) {
      checkGameStatus();
    }
  }, [gameState?.week]);

  useEffect(() => {
    if (gameStatus === 'not_started') {
      setSelectedDifficulty(config.defaultDifficulty);
    }
  }, [config.defaultDifficulty, gameStatus]);

  const resumeSavedGame = () => {
    if (!savedGame) return;
    setGameState(savedGame);
    setGameStatus('playing');
  };

  const resetProgress = () => {
    setSavedGame(null);
    setGameState(null);
    setGameStatus('not_started');
    setSelectedDifficulty(config.defaultDifficulty);
  };

  const handleStateUpdate = (state: GameState) => {
    setGameState(state);
    setSavedGame(state);
  };

  // Show startup animation on first load
  if (showStartupAnimation) {
    return <StartupAnimation onComplete={() => setShowStartupAnimation(false)} />;
  }

  if (gameStatus === 'not_started') {
    return (
      <Container size="lg" py="xl">
        <Stack gap="xl" align="center">
          <Stack gap="md" align="center">
            <Title order={1} size="h1">Founder's Dilemma</Title>
            <Text size="lg" ta="center" maw={600}>
              Navigate compounding constraints to reach sustainable product-market fit before running out of runway
            </Text>
          </Stack>

          <Stack gap="lg" w="100%" maw={800}>
            {!savedLoading && savedGame && (
              <Card withBorder padding="lg" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <Title order={3} size="h4">Resume Campaign</Title>
                      <Badge color={accentColor as any}>
                        {savedGame.difficulty.toUpperCase()}
                      </Badge>
                    </Group>
                    <Button variant="light" color="red" size="xs" onClick={resetProgress}>
                      Start New From Scratch
                    </Button>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Week {savedGame.week} • Bank ${Math.round(savedGame.bank).toLocaleString()} • Morale {Math.round(savedGame.morale)}%
                  </Text>
                  <Group gap="sm">
                    <Button color={accentColor as any} onClick={resumeSavedGame}>Continue Saved Game</Button>
                  </Group>
                </Stack>
              </Card>
            )}

            <Divider label="New Campaign" labelPosition="center" />

            <Title order={2} ta="center">Select Your Path</Title>

            <Group grow align="stretch">
              <Card
                withBorder
                padding="lg"
                onClick={() => setSelectedDifficulty('indie')}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDifficulty === 'indie' ? 'var(--fd-positive-surface)' : undefined,
                }}
              >
                <Stack gap="md">
                  <Text fw={700} size="lg">🏠 Indie Bootstrap</Text>
                  <Stack gap="xs">
                    <Text size="sm">Bank: $50k</Text>
                    <Text size="sm">Burn: $8k/mo</Text>
                    <Text size="sm">Runway: 6.25 months</Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    Low resources, slower growth. Every dollar counts.
                  </Text>
                </Stack>
              </Card>

              <Card
                withBorder
                padding="lg"
                onClick={() => setSelectedDifficulty('vc')}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDifficulty === 'vc' ? 'var(--fd-positive-surface)' : undefined,
                }}
              >
                <Stack gap="md">
                  <Text fw={700} size="lg">🚀 VC Track</Text>
                  <Stack gap="xs">
                    <Text size="sm">Bank: $1M</Text>
                    <Text size="sm">Burn: $80k/mo</Text>
                    <Text size="sm">Runway: 12.5 months</Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    High burn, aggressive growth targets. Move fast.
                  </Text>
                </Stack>
              </Card>
            </Group>

            <Group grow align="stretch">
              <Card
                withBorder
                padding="lg"
                onClick={() => setSelectedDifficulty('regulated')}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDifficulty === 'regulated' ? 'var(--fd-positive-surface)' : undefined,
                }}
              >
                <Stack gap="md">
                  <Text fw={700} size="lg">🏦 Regulated Fintech</Text>
                  <Stack gap="xs">
                    <Text size="sm">Bank: $500k</Text>
                    <Text size="sm">Burn: $40k/mo</Text>
                    <Text size="sm">Runway: 12.5 months</Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    High compliance burden. Navigate regulations.
                  </Text>
                </Stack>
              </Card>

              <Card
                withBorder
                padding="lg"
                onClick={() => setSelectedDifficulty('infra')}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDifficulty === 'infra' ? 'var(--fd-positive-surface)' : undefined,
                }}
              >
                <Stack gap="md">
                  <Text fw={700} size="lg">⚙️ Infrastructure/DevTool</Text>
                  <Stack gap="xs">
                    <Text size="sm">Bank: $300k</Text>
                    <Text size="sm">Burn: $25k/mo</Text>
                    <Text size="sm">Runway: 12 months</Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    Long sales cycles. Patience required.
                  </Text>
                </Stack>
              </Card>
            </Group>

            <Button
              size="xl"
              onClick={() => startNewGame(selectedDifficulty)}
              loading={loading}
              mt="md"
              fullWidth
            >
              Start Your Journey
            </Button>
          </Stack>
        </Stack>
      </Container>
    );
  }

  if (gameStatus.startsWith('defeat:') || gameStatus === 'victory') {
    return (
      <GameOver
        status={gameStatus}
        gameState={gameState!}
        onRestart={() => {
          resetProgress();
        }}
      />
    );
  }

  return (
    <GameDashboard
      gameState={gameState!}
      onStateUpdate={handleStateUpdate}
      onResetGame={resetProgress}
    />
  );
}
