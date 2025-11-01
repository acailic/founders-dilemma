import { useState } from 'react';
import {
  Badge,
  Card,
  Container,
  Divider,
  Group,
  Radio,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useGameConfig, DifficultyOption } from '../common/GameConfigContext';
import { THEME_PRESETS, ThemeAccentKey, ThemePreset } from '../common/themePresets';

const difficultyCopy: Record<DifficultyOption, { title: string; description: string; badge: string }> = {
  indie: {
    title: '🏠 Indie Bootstrap',
    description: 'Lean resources and slower growth. Every dollar matters.',
    badge: 'Default burn: $8k/mo, Bank: $50k',
  },
  vc: {
    title: '🚀 VC Track',
    description: 'Aggressive growth goals with a short leash on burn.',
    badge: 'Default burn: $80k/mo, Bank: $1M',
  },
  regulated: {
    title: '🏦 Regulated Fintech',
    description: 'Heavy compliance drag. Missteps trigger audits quickly.',
    badge: 'Default burn: $40k/mo, Bank: $500k',
  },
  infra: {
    title: '⚙️ Infrastructure/DevTool',
    description: 'Long sales cycles. Reputation with developers is everything.',
    badge: 'Default burn: $25k/mo, Bank: $300k',
  },
};

export default function ConfigView() {
  const { config, setConfig } = useGameConfig();
  const [activeTab, setActiveTab] = useState<string>('gameplay');

  const handleDifficultyChange = (value: string) => {
    setConfig({ defaultDifficulty: value as DifficultyOption });
  };

  const handleAccentChange = (value: ThemeAccentKey) => {
    setConfig({ themeAccent: value });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={1} size="h2">Configuration</Title>
          <Text c="dimmed" size="sm">
            Tune how the simulation starts and what information surfaces during play.
          </Text>
        </Stack>

        <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
          <Tabs.List>
            <Tabs.Tab value="gameplay">Gameplay</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="gameplay" pt="md">
            <Stack gap="lg">
              <Stack gap={4}>
                <Title order={3} size="h3">Default Difficulty</Title>
                <Text size="sm" c="dimmed">
                  New games start with this baseline unless you override it on the launch screen.
                </Text>
              </Stack>
              <Radio.Group value={config.defaultDifficulty} onChange={handleDifficultyChange}>
                <Stack gap="md">
                  {Object.entries(difficultyCopy).map(([key, value]) => (
                    <Card
                      key={key}
                      withBorder
                      padding="lg"
                      onClick={() => handleDifficultyChange(key)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" align="center">
                          <Text fw={600}>{value.title}</Text>
                          <Radio value={key} />
                        </Group>
                        <Text size="sm">{value.description}</Text>
                        <Badge variant="light" size="sm">
                          {value.badge}
                        </Badge>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Radio.Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="display" pt="md">
            <Stack gap="lg">
              <Stack gap={4}>
                <Title order={3} size="h3">Stats Presentation</Title>
                <Text size="sm" c="dimmed">
                  Control the amount of operational detail included each week.
                </Text>
              </Stack>
              <Card withBorder padding="lg">
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={600}>Advanced Metrics</Text>
                      <Text size="sm" c="dimmed">
                        Show tech debt, velocity, and equity cards in the dashboard.
                      </Text>
                    </div>
                    <Switch
                      checked={config.showAdvancedMetrics}
                      onChange={(event) => setConfig({ showAdvancedMetrics: event.currentTarget.checked })}
                    />
                  </Group>
                  {!config.showAdvancedMetrics && (
                    <>
                      <Divider my="sm" />
                      <Text size="xs" c="dimmed">
                        Advanced metrics stay tracked under the hood - they're just hidden from the HUD to simplify focus.
                      </Text>
                    </>
                  )}
                </Stack>
              </Card>

              <Stack gap="xs">
                <Title order={3} size="h3">Theme Accent</Title>
                <Text size="sm" c="dimmed">
                  Pick a color palette that fits your dashboard mood. Applies immediately across the app.
                </Text>
              </Stack>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {(Object.entries(THEME_PRESETS) as Array<[ThemeAccentKey, ThemePreset]>).map(([key, preset]) => {
                  const isActive = config.themeAccent === key;
                  return (
                    <Card
                      key={key}
                      withBorder
                      padding="md"
                      radius="md"
                      style={{
                        cursor: 'pointer',
                        borderColor: isActive ? preset.borderLight : undefined,
                        boxShadow: isActive ? `0 0 0 2px ${preset.surfaceTint}` : undefined,
                      }}
                      onClick={() => handleAccentChange(key)}
                    >
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Text fw={600} tt="capitalize">{key}</Text>
                          {isActive && <Badge color={preset.primaryColor as any}>Active</Badge>}
                        </Group>
                        <Card
                          padding={0}
                          radius="sm"
                          style={{
                            height: '80px',
                            background: `linear-gradient(135deg, ${preset.gradientStart}, ${preset.gradientEnd})`,
                          }}
                        />
                        <Text size="xs" c="dimmed">
                          Primary hue: {preset.primaryColor}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
