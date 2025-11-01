import { Stack, Card, Text, Group, Badge, Alert, Accordion, Progress } from '@mantine/core';
import { FailureWarning, getSeverityColor, getSeverityIcon } from '../../types/game-systems';

interface FailureWarningsProps {
  warnings: FailureWarning[];
}

export default function FailureWarnings({ warnings }: FailureWarningsProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card withBorder padding="lg" style={{ background: 'var(--mantine-color-red-0)' }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>🚨 Failure Warnings</Text>
          <Badge size="lg" color="red">
            {warnings.length} risk{warnings.length !== 1 ? 's' : ''}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Address these patterns before they become crises
        </Text>

        <Accordion variant="separated">
          {warnings.map((warning, index) => (
            <Accordion.Item key={index} value={`warning-${index}`}>
              <Accordion.Control
                style={{
                  background:
                    warning.severity === 'Critical'
                      ? 'var(--mantine-color-red-1)'
                      : warning.severity === 'Danger'
                      ? 'var(--mantine-color-orange-1)'
                      : 'var(--mantine-color-yellow-1)',
                }}
              >
                <Group gap="sm">
                  <Text size="xl">{getSeverityIcon(warning.severity)}</Text>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text size="sm" fw={700}>
                        {warning.title}
                      </Text>
                      <Badge size="sm" color={getSeverityColor(warning.severity)}>
                        {warning.severity}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {warning.current_status}
                    </Text>
                  </Stack>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Stack gap="md">
                  {/* Timeline if available */}
                  {warning.weeks_until_critical && warning.weeks_until_critical < 99 && (
                    <Alert color="red" title="⏰ Timeline">
                      <Group gap="xs" align="center">
                        <Text size="sm" fw={700}>
                          {warning.weeks_until_critical} week{warning.weeks_until_critical !== 1 ? 's' : ''} until critical
                        </Text>
                      </Group>
                      <Progress
                        value={100 - (warning.weeks_until_critical / 20) * 100}
                        color="red"
                        size="lg"
                        mt="xs"
                        striped
                        animated
                      />
                    </Alert>
                  )}

                  {/* Warning Signs */}
                  {warning.warning_signs.length > 0 && (
                    <Card withBorder padding="sm" style={{ background: 'var(--mantine-color-gray-0)' }}>
                      <Stack gap="xs">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Warning Signs
                        </Text>
                        {warning.warning_signs.map((sign, signIndex) => (
                          <Group key={signIndex} gap="xs" align="flex-start">
                            <Badge size="xs" variant="outline">
                              Week {sign.week}
                            </Badge>
                            <Text size="xs" style={{ flex: 1 }}>
                              {sign.observation}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Card>
                  )}

                  {/* Projected Outcome */}
                  <Alert color="orange" title="📉 If This Continues">
                    <Text size="sm">{warning.projected_outcome}</Text>
                  </Alert>

                  {/* The Lesson */}
                  <Alert color="blue" title="💡 The Lesson">
                    <Text size="sm">{warning.lesson}</Text>
                  </Alert>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </Card>
  );
}
