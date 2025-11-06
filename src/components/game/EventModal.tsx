import { Modal, Stack, Text, Card, Button, Group, Badge, Alert } from '@mantine/core';
import { GameEvent, EventChoice } from '../../types/game-systems';
import { useState } from 'react';

interface EventModalProps {
  opened: boolean;
  event: GameEvent | null;
  onClose: () => void;
  onChoiceSelected: (choiceIndex: number) => void;
}

export default function EventModal({ opened, event, onClose, onChoiceSelected }: EventModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  if (!event) return null;

  const isDilemma = 'Dilemma' in event.event_type;
  const isAutomatic = 'Automatic' in event.event_type;

  const handleConfirmChoice = () => {
    if (selectedChoice !== null) {
      onChoiceSelected(selectedChoice);
      setSelectedChoice(null);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="sm">
          <Text size="xl">{isDilemma ? '⚖️' : '📰'}</Text>
          <Text size="xl" fw={700}>
            {event.title}
          </Text>
        </Group>
      }
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="lg">
        {/* Event Description */}
        <Card withBorder padding="md" style={{ background: 'var(--mantine-color-blue-0)' }}>
          <Stack gap="xs">
            <Group gap="xs">
              <Badge size="sm" variant="light">
                Week {event.week}
              </Badge>
              <Badge size="sm" color={isDilemma ? 'orange' : 'blue'}>
                {isDilemma ? 'Choice Required' : 'Automatic Event'}
              </Badge>
            </Group>
            <Text size="md">{event.description}</Text>
          </Stack>
        </Card>

        {/* Automatic Event */}
        {isAutomatic && event.event_type.Automatic && (
          <Card withBorder padding="md">
            <Stack gap="sm">
              <Text size="sm" fw={700}>
                Effects:
              </Text>
              {event.event_type.Automatic.effects.map((effect, index) => (
                <Group key={index} gap="xs">
                  <Badge size="sm" variant="light">
                    {effect.stat_name}
                  </Badge>
                  <Text
                    size="sm"
                    c={effect.change > 0 ? 'green' : 'red'}
                    fw={600}
                  >
                    {effect.change > 0 ? '+' : ''}
                    {effect.change}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {effect.description}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {/* Dilemma Choices */}
        {isDilemma && event.event_type.Dilemma && (
          <Stack gap="md">
            <Alert color="orange" icon={<Text size="xl">⚖️</Text>}>
              <Text size="sm" fw={600}>
                Choose wisely. Your decision will shape your company's future.
              </Text>
            </Alert>

            {event.event_type.Dilemma.choices.map((choice: EventChoice, index: number) => (
              <Card
                key={index}
                withBorder
                padding="lg"
                style={{
                  cursor: 'pointer',
                  border:
                    selectedChoice === index
                      ? '3px solid var(--fd-warning-strong)'
                      : '2px solid var(--fd-border-strong)',
                  background:
                    selectedChoice === index
                      ? 'var(--mantine-color-yellow-0)'
                      : 'var(--fd-surface-1)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedChoice(index)}
              >
                <Stack gap="md">
                  {/* Choice Label */}
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>
                      {choice.text}
                    </Text>
                    {selectedChoice === index && (
                      <Badge size="lg" color="yellow">
                        Selected
                      </Badge>
                    )}
                  </Group>

                  {/* Description */}
                  <Text size="sm">{choice.description}</Text>

                  {/* Short-term vs Long-term */}
                  <Group grow align="flex-start">
                    <Card withBorder padding="sm" style={{ background: 'var(--mantine-color-blue-0)' }}>
                      <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          📅 Short-term
                        </Text>
                        <Text size="xs">{choice.short_term}</Text>
                      </Stack>
                    </Card>

                    <Card withBorder padding="sm" style={{ background: 'var(--mantine-color-orange-0)' }}>
                      <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          📈 Long-term
                        </Text>
                        <Text size="xs">{choice.long_term}</Text>
                      </Stack>
                    </Card>
                  </Group>

                  {/* Wisdom */}
                  <Alert color="blue" icon={<Text>💡</Text>}>
                    <Text size="xs" fs="italic">
                      "{choice.wisdom}"
                    </Text>
                  </Alert>

                  {/* Effects Preview */}
                  <Card withBorder padding="xs" style={{ background: 'var(--mantine-color-gray-0)' }}>
                    <Stack gap={4}>
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                        Effects:
                      </Text>
                      {choice.effects.map((effect, effectIndex) => (
                        <Group key={effectIndex} gap="xs">
                          <Badge size="xs" variant="outline">
                            {effect.stat_name}
                          </Badge>
                          <Text
                            size="xs"
                            c={effect.delta > 0 ? 'green' : 'red'}
                            fw={600}
                          >
                            {effect.delta > 0 ? '+' : ''}
                            {effect.delta}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {effect.description}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" gap="md">
          {isDilemma ? (
            <>
              <Button variant="subtle" onClick={onClose} disabled={selectedChoice !== null}>
                Think More
              </Button>
              <Button
                size="lg"
                onClick={handleConfirmChoice}
                disabled={selectedChoice === null}
                style={{
                  background: 'var(--gradient-primary)',
                }}
              >
                Confirm Decision
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={onClose}>
              Continue
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
