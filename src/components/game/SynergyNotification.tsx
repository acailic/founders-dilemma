import React, { useState, useEffect } from 'react';
import { Card, Text, Badge, Button, Group, Stack, Box, Transition } from '@mantine/core';
import { ActionSynergy } from '../../types/game-systems';

interface SynergyNotificationProps {
  synergies: ActionSynergy[];
  onClose?: () => void;
}

export function SynergyNotification({ synergies, onClose }: SynergyNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [animatedBonuses, setAnimatedBonuses] = useState<Record<string, number>>({});

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 5000);

    // Animate bonus numbers
    synergies.forEach((synergy, synergyIndex) => {
      synergy.bonus_effects.forEach((effect, effectIndex) => {
        const key = `${synergyIndex}-${effectIndex}`;
        setTimeout(() => {
          setAnimatedBonuses(prev => ({ ...prev, [key]: effect.bonus_amount }));
        }, 500 + (effectIndex * 200));
      });
    });

    return () => clearTimeout(timer);
  }, [synergies, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (synergies.length === 0) return null;

  const isFirstTime = synergies.some(s => s.id.includes('first')); // Assuming id indicates first time
  const isStreak = synergies.length > 1;
  const isSpecialization = synergies.some(s => s.id.includes('specialization'));

  return (
    <Transition
      mounted={visible}
      transition="slide-right"
      duration={400}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 400,
            ...getVariantStyles(isFirstTime, isStreak, isSpecialization),
          }}
        >
          <Card shadow="lg" padding="lg" radius="md" withBorder>
            <Stack spacing="sm">
              <Group position="apart">
                <Group spacing="xs">
                  <Text size="xl">{getIcon(isFirstTime, isStreak, isSpecialization)}</Text>
                  <Text size="lg" weight={700} color="blue">
                    Synergy Activated!
                  </Text>
                </Group>
                <Button variant="subtle" size="xs" onClick={handleClose}>
                  ✕
                </Button>
              </Group>

              {synergies.map((synergy, index) => (
                <Box key={synergy.id}>
                  <Text size="md" weight={600}>
                    {synergy.name}
                  </Text>
                  <Text size="sm" color="dimmed" mb="xs">
                    {synergy.description}
                  </Text>
                  
                  <Stack spacing="xs">
                    {synergy.bonus_effects.map((effect, effectIndex) => {
                      const key = `${index}-${effectIndex}`;
                      const animatedValue = animatedBonuses[key] || 0;
                      return (
                        <Badge
                          key={effectIndex}
                          variant="light"
                          color="green"
                          size="lg"
                          leftSection="+"
                        >
                          {formatBonus(effect.stat_name, animatedValue)}
                        </Badge>
                      );
                    })}
                  </Stack>
                </Box>
              ))}

              <Text size="sm" color="dimmed" mt="sm">
                {getEducationalMessage(synergies[0])}
              </Text>

              {isStreak && (
                <Text size="sm" weight={600} color="orange">
                  🔥 Synergy streak! Keep combining actions for bigger bonuses.
                </Text>
              )}
            </Stack>
          </Card>
        </Box>
      )}
    </Transition>
  );
}

function getIcon(isFirstTime: boolean, isStreak: boolean, isSpecialization: boolean): string {
  if (isSpecialization) return '🏆';
  if (isStreak) return '🔥';
  if (isFirstTime) return '✨';
  return '⚡';
}

function getVariantStyles(isFirstTime: boolean, isStreak: boolean, isSpecialization: boolean) {
  if (isSpecialization) {
    return {
      background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    };
  }
  if (isStreak) {
    return {
      background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
      boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
    };
  }
  if (isFirstTime) {
    return {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
    };
  }
  return {
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    boxShadow: '0 0 20px rgba(240, 147, 251, 0.5)',
  };
}

function formatBonus(statName: string, amount: number): string {
  if (statName.toLowerCase().includes('growth') || statName.toLowerCase().includes('rate')) {
    return `${amount}% ${statName}`;
  }
  if (typeof amount === 'number' && amount < 1) {
    return `${(amount * 100).toFixed(1)}% ${statName}`;
  }
  return `${amount} ${statName}`;
}

function getEducationalMessage(synergy: ActionSynergy): string {
  // This could be more dynamic based on synergy type
  return `Combining complementary actions creates powerful synergies. Discover more combinations to boost your startup's performance!`;
}