import { useState, useEffect } from 'react';
import { Stack, Title, Text, Button, Card, Group, Badge } from '@mantine/core';
import './StartupAnimation.css';

interface StartupAnimationProps {
  onComplete: () => void;
}

export default function StartupAnimation({ onComplete }: StartupAnimationProps) {
  const [stage, setStage] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Allow skipping after 2 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 2000);

    // Auto-advance through stages
    const timers = [
      setTimeout(() => setStage(1), 1500),  // Show title
      setTimeout(() => setStage(2), 3500),  // Show concept
      setTimeout(() => setStage(3), 5500),  // Show challenge
      setTimeout(() => setStage(4), 7500),  // Show call to action
    ];

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  return (
    <div className="startup-animation-container" onClick={handleSkip}>
      <Stack gap="xl" align="center" justify="center" style={{ minHeight: '100vh', padding: '2rem' }}>

        {/* Stage 0-1: Title Sequence */}
        {stage >= 0 && (
          <div className={`animation-stage ${stage >= 0 ? 'fade-in' : ''}`}>
            <Stack gap="md" align="center">
              <Text size="60px" className="pulse-slow">🚀</Text>
              <Title order={1} size="48px" ta="center" className="slide-in-top">
                Founder's Dilemma
              </Title>
            </Stack>
          </div>
        )}

        {/* Stage 2: Concept */}
        {stage >= 2 && (
          <div className={`animation-stage ${stage >= 2 ? 'fade-in' : ''}`}>
            <Card withBorder padding="xl" className="glow-card" style={{ maxWidth: '600px' }}>
              <Stack gap="md" align="center">
                <Group gap="xs">
                  <Text size="lg">🎯</Text>
                  <Text size="xl" fw={700}>The Mission</Text>
                </Group>
                <Text size="md" ta="center">
                  Achieve <span style={{ color: 'var(--fd-positive-border)', fontWeight: 700 }}>Escape Velocity</span>
                  <br />
                  Build a sustainable startup that grows on its own
                </Text>
                <Group gap="xs">
                  <Badge size="lg" color="green">Revenue ≥ Burn</Badge>
                  <Badge size="lg" color="green">Growth ≥ 10%</Badge>
                  <Badge size="lg" color="green">NPS ≥ 30</Badge>
                  <Badge size="lg" color="green">Morale {'>'} 40</Badge>
                </Group>
              </Stack>
            </Card>
          </div>
        )}

        {/* Stage 3: Challenge */}
        {stage >= 3 && (
          <div className={`animation-stage ${stage >= 3 ? 'fade-in' : ''}`}>
            <Card withBorder padding="xl" className="glow-card" style={{ maxWidth: '600px' }}>
              <Stack gap="md" align="center">
                <Group gap="xs">
                  <Text size="lg">⚖️</Text>
                  <Text size="xl" fw={700}>The Challenge</Text>
                </Group>
                <Text size="md" ta="center">
                  Every week, balance competing priorities
                </Text>
                <Group gap="md" justify="center">
                  <Stack gap="xs" align="center">
                    <Text size="lg">⚡</Text>
                    <Text size="xs">Ship Fast</Text>
                    <Text size="xs" c="dimmed">+Growth</Text>
                    <Text size="xs" c="red">+Tech Debt</Text>
                  </Stack>
                  <Text size="xl" c="dimmed">vs</Text>
                  <Stack gap="xs" align="center">
                    <Text size="lg">✨</Text>
                    <Text size="xs">Ship Quality</Text>
                    <Text size="xs" c="dimmed">+Reputation</Text>
                    <Text size="xs" c="red">-Velocity</Text>
                  </Stack>
                  <Text size="xl" c="dimmed">vs</Text>
                  <Stack gap="xs" align="center">
                    <Text size="lg">🌴</Text>
                    <Text size="xs">Take Break</Text>
                    <Text size="xs" c="dimmed">+Morale</Text>
                    <Text size="xs" c="red">-Momentum</Text>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          </div>
        )}

        {/* Stage 4: Call to Action */}
        {stage >= 4 && (
          <div className={`animation-stage ${stage >= 4 ? 'fade-in scale-in' : ''}`}>
            <Stack gap="lg" align="center">
              <Text size="lg" ta="center" fw={700} className="pulse">
                Can you survive 12 weeks of Escape Velocity?
              </Text>
              <Button
                size="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="bounce"
                style={{
                  fontSize: '18px',
                  padding: '20px 40px',
                  background: 'var(--fd-positive-surface)',
                  border: '2px solid var(--fd-positive-border)'
                }}
              >
                🚀 Start Your Journey
              </Button>
            </Stack>
          </div>
        )}

        {/* Skip indicator */}
        {canSkip && stage < 4 && (
          <div className="skip-indicator fade-in">
            <Text size="xs" c="dimmed">Click anywhere to skip</Text>
          </div>
        )}
      </Stack>
    </div>
  );
}
