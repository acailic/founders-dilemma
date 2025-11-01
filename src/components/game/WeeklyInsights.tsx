import { Stack, Card, Text, Group, Badge, Alert, Accordion } from '@mantine/core';
import { WeeklyInsight, getSeverityColor, getSeverityIcon, getCategoryIcon } from '../../types/game-systems';

interface WeeklyInsightsProps {
  insights: WeeklyInsight[];
}

export default function WeeklyInsights({ insights }: WeeklyInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card withBorder padding="lg" style={{ background: 'var(--mantine-color-blue-0)' }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>💡 Weekly Insights</Text>
          <Badge size="sm" variant="light">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Learn from your decisions and game state
        </Text>

        <Accordion variant="separated">
          {insights.map((insight, index) => (
            <Accordion.Item key={index} value={`insight-${index}`}>
              <Accordion.Control>
                <Group gap="sm">
                  <Text size="lg">{getCategoryIcon(insight.category)}</Text>
                  <Text size="lg">{getSeverityIcon(insight.severity)}</Text>
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>{insight.title}</Text>
                    <Text size="xs" c="dimmed">{insight.observation}</Text>
                  </Stack>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Stack gap="md">
                  {/* The Insight - Educational content */}
                  <Alert
                    color={getSeverityColor(insight.severity)}
                    title="💭 Why This Matters"
                    icon={<Text size="xl">💡</Text>}
                  >
                    <Text size="sm">{insight.insight}</Text>
                  </Alert>

                  {/* Action Suggestion */}
                  <Alert
                    color="blue"
                    title="🎯 What To Do"
                    icon={<Text size="xl">➡️</Text>}
                  >
                    <Text size="sm">{insight.action_suggestion}</Text>
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
