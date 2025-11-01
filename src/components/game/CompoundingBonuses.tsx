import { Stack, Card, Text, Group, Badge, Alert } from '@mantine/core';
import { CompoundingBonus } from '../../types/game-systems';

interface CompoundingBonusesProps {
  bonuses: CompoundingBonus[];
}

export default function CompoundingBonuses({ bonuses }: CompoundingBonusesProps) {
  if (bonuses.length === 0) {
    return null;
  }

  return (
    <Card withBorder padding="lg" style={{ background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>✨ Compounding Effects Active!</Text>
          <Badge size="lg" color="green" variant="filled">
            {bonuses.length} bonus{bonuses.length !== 1 ? 'es' : ''}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Your sustained good practices are paying dividends
        </Text>

        <Stack gap="sm">
          {bonuses.map((bonus, index) => (
            <Alert
              key={index}
              color="green"
              title={`🎉 ${bonus.name}`}
              styles={{
                root: {
                  boxShadow: '0 4px 8px rgba(46, 204, 113, 0.2)',
                },
              }}
            >
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  {bonus.message}
                </Text>

                {/* Show individual bonuses */}
                <Stack gap={4}>
                  {bonus.bonuses.map((stat, statIndex) => (
                    <Group key={statIndex} gap="xs">
                      <Badge size="sm" color="green" variant="light">
                        {stat.stat_name}
                      </Badge>
                      <Text size="xs" c="green" fw={600}>
                        {stat.is_multiplier
                          ? `${(stat.bonus_amount * 100).toFixed(0)}% boost`
                          : `${stat.bonus_amount > 0 ? '+' : ''}${stat.bonus_amount.toFixed(1)}`}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Alert>
          ))}
        </Stack>

        <Alert color="blue" icon={<Text>💡</Text>}>
          <Text size="xs">
            <strong>Keep it up!</strong> These bonuses grow stronger the longer you maintain good practices.
            Consistency compounds.
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
}
