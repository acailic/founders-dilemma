import { Modal, Stack, Title, Text, Card, Group, Badge, Divider, Tabs } from '@mantine/core';

interface HelpModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function HelpModal({ opened, onClose }: HelpModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={<Title order={2}>📚 How to Play</Title>}
    >
      <Tabs defaultValue="objective">
        <Tabs.List>
          <Tabs.Tab value="objective">🎯 Objective</Tabs.Tab>
          <Tabs.Tab value="mechanics">⚙️ Mechanics</Tabs.Tab>
          <Tabs.Tab value="actions">🎮 Actions</Tabs.Tab>
          <Tabs.Tab value="shortcuts">⌨️ Shortcuts</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="objective" pt="lg">
          <Stack gap="lg">
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Title order={3}>🏆 Win Condition: Escape Velocity</Title>
                <Text size="sm">
                  Achieve sustainable growth by maintaining ALL 4 conditions for 12 consecutive weeks:
                </Text>
                <Stack gap="xs">
                  <Group gap="xs">
                    <Badge color="green">1</Badge>
                    <Text size="sm">Revenue ≥ Burn (profitability)</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color="green">2</Badge>
                    <Text size="sm">WAU Growth ≥ 10% (sustained growth)</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color="green">3</Badge>
                    <Text size="sm">NPS ≥ 30 (customer love)</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color="green">4</Badge>
                    <Text size="sm">Morale {'>'} 40 (founder health)</Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>

            <Card withBorder padding="lg">
              <Stack gap="md">
                <Title order={3}>💀 Defeat Conditions</Title>
                <Stack gap="xs">
                  <Group gap="xs">
                    <Badge color="red">1</Badge>
                    <Text size="sm">Bank ≤ $0 (out of money)</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color="red">2</Badge>
                    <Text size="sm">Morale ≤ 0 (founder burnout)</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color="red">3</Badge>
                    <Text size="sm">Reputation ≤ 10 (brand destroyed)</Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mechanics" pt="lg">
          <Stack gap="md">
            <Card withBorder padding="md">
              <Stack gap="xs">
                <Title order={4}>🎯 Focus Slots</Title>
                <Text size="sm">
                  Each week you have 3 focus slots. Different actions cost different amounts:
                </Text>
                <Group gap="xs">
                  <Badge>1 slot</Badge>
                  <Text size="xs">Product, Sales, Recovery</Text>
                </Group>
                <Group gap="xs">
                  <Badge>2 slots</Badge>
                  <Text size="xs">Hiring, Fundraising</Text>
                </Group>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Title order={4}>📊 Key Metrics</Title>
                <Text size="sm">
                  <strong>Financial:</strong> Bank, Burn, Runway, MRR
                </Text>
                <Text size="sm">
                  <strong>Growth:</strong> WAU, NPS, Churn Rate
                </Text>
                <Text size="sm">
                  <strong>Health:</strong> Morale, Reputation
                </Text>
                <Text size="sm">
                  <strong>Technical:</strong> Tech Debt, Velocity, Equity
                </Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Title order={4}>⚖️ Trade-offs</Title>
                <Text size="sm">Every action has consequences:</Text>
                <Text size="xs">• Ship Quick = Fast growth + High tech debt</Text>
                <Text size="xs">• Ship Polish = Quality + Slower growth</Text>
                <Text size="xs">• Sales Calls = Revenue + Morale cost</Text>
                <Text size="xs">• Hiring = Velocity + Increased burn</Text>
                <Text size="xs">• Taking Break = Morale + Lost momentum</Text>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="actions" pt="lg">
          <Stack gap="md">
            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">⚡</Text>
                  <Title order={4}>Ship Quick</Title>
                  <Badge size="sm">1 focus</Badge>
                </Group>
                <Text size="xs">Move fast, break things. High WAU growth, adds tech debt.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">⚖️</Text>
                  <Title order={4}>Ship Balanced</Title>
                  <Badge size="sm">1 focus</Badge>
                </Group>
                <Text size="xs">Balanced approach. Moderate growth, moderate tech debt.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">✨</Text>
                  <Title order={4}>Ship Polish</Title>
                  <Badge size="sm">1 focus</Badge>
                </Group>
                <Text size="xs">High quality. Slower growth, reduces tech debt, boosts reputation.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">📞</Text>
                  <Title order={4}>Sales Calls</Title>
                  <Badge size="sm">1 focus</Badge>
                </Group>
                <Text size="xs">Founder-led sales. Probabilistic MRR gain, morale cost.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">👥</Text>
                  <Title order={4}>Hire</Title>
                  <Badge size="sm">2 focus</Badge>
                </Group>
                <Text size="xs">Expand team. Increases burn $10k/mo, boosts velocity and morale.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">💰</Text>
                  <Title order={4}>Fundraise</Title>
                  <Badge size="sm">2 focus</Badge>
                </Group>
                <Text size="xs">Raise capital. Probabilistic, causes dilution, morale hit if failed.</Text>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="lg">🌴</Text>
                  <Title order={4}>Take Break</Title>
                  <Badge size="sm">1 focus</Badge>
                </Group>
                <Text size="xs">Recharge. Restores morale, slight growth loss.</Text>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="shortcuts" pt="lg">
          <Stack gap="md">
            <Card withBorder padding="md">
              <Stack gap="xs">
                <Title order={4}>⌨️ Keyboard Shortcuts</Title>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm">Execute Week</Text>
                  <Badge variant="light">Enter</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Open Help</Text>
                  <Badge variant="light">H or ?</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Clear Selections</Text>
                  <Badge variant="light">Esc</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Quick Actions</Text>
                  <Badge variant="light">1-5</Badge>
                </Group>
              </Stack>
            </Card>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Title order={4}>💡 Pro Tips</Title>
                <Text size="xs">• Balance growth with stability</Text>
                <Text size="xs">• Watch your runway closely</Text>
                <Text size="xs">• Tech debt slows velocity over time</Text>
                <Text size="xs">• High morale improves productivity</Text>
                <Text size="xs">• Don't ignore NPS - churn kills growth</Text>
                <Text size="xs">• Fundraising gets harder with low reputation</Text>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
