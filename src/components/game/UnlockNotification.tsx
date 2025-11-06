import { useMemo } from 'react';
import { Modal, Stack, Text, Button, Group, Card, Badge, Divider } from '@mantine/core';

interface UnlockNotificationProps {
  opened: boolean;
  actionName: string;
  unlockReason: string;
  description: string;
  onTryAction?: () => void;
  onClose: () => void;
}

export default function UnlockNotification({
  opened,
  actionName,
  unlockReason,
  description,
  onTryAction,
  onClose,
}: UnlockNotificationProps) {
  // Get action icon based on name (simplified - could be expanded)
  const getActionIcon = (name: string) => {
    if (name.includes('Refactor')) return '🔧';
    if (name.includes('Experiment')) return '🧪';
    if (name.includes('Content')) return '📝';
    if (name.includes('DevRel')) return '🎤';
    if (name.includes('Paid')) return '💸';
    if (name.includes('Coach')) return '🎓';
    if (name.includes('Fire')) return '👋';
    if (name.includes('Compliance')) return '📋';
    if (name.includes('Incident')) return '🚨';
    if (name.includes('Process')) return '⚙️';
    return '✨';
  };

  const actionIcon = useMemo(() => getActionIcon(actionName), [actionName]);

  if (!opened) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      withCloseButton={false}
      styles={{
        content: {
          background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffffff)',
          border: '3px solid #ff6b35',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          animation: 'unlockPulse 2s ease-in-out infinite',
        },
        body: {
          padding: '2rem',
        },
      }}
    >
      <Stack gap="xl" align="center">
        {/* Celebration Header */}
        <Stack gap="md" align="center">
          <Text size="4rem" style={{ animation: 'bounce 1s ease-in-out' }}>
            🔓
          </Text>
          <Text size="2rem" fw={900} c="orange" ta="center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            New Action Unlocked!
          </Text>
          <Text size="1.2rem" c="dark" ta="center" fw={600}>
            🎉 Congratulations! 🎉
          </Text>
        </Stack>

        <Divider size="md" color="orange" />

        {/* Action Details */}
        <Card
          withBorder
          padding="lg"
          radius="md"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #ff6b35',
            width: '100%',
          }}
        >
          <Stack gap="md" align="center">
            {/* Action Icon and Name */}
            <Group gap="md" align="center">
              <Text size="3rem">{actionIcon}</Text>
              <Stack gap={4}>
                <Text size="1.5rem" fw={800} c="blue">
                  {actionName}
                </Text>
                <Badge size="lg" color="green" variant="filled">
                  Unlocked: {unlockReason}
                </Badge>
              </Stack>
            </Group>

            <Divider />

            {/* Description */}
            <Text size="md" ta="center" c="dimmed">
              {description}
            </Text>

            {/* Educational Tips */}
            <Stack gap="xs" align="center">
              <Text size="sm" fw={600} c="dark">
                💡 Strategic Tip:
              </Text>
              <Text size="sm" ta="center" c="dimmed">
                Picture your squad gathered around the product wall—pair this move with Ship Feature to spark a launch rush, or invite Coach into the room to polish the craft.
              </Text>
              <Text size="sm" ta="center" c="dimmed">
                Every choice nudges the narrative forward. Where do you take the story next?
              </Text>
            </Stack>
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group gap="md">
          <Button
            size="lg"
            variant="light"
            color="blue"
            onClick={() => {
              onTryAction?.();
              onClose();
            }}
            leftSection="🎯"
          >
            Step Into Planning
          </Button>
          <Button
            size="lg"
            variant="outline"
            color="orange"
            onClick={onClose}
          >
            Got It!
          </Button>
        </Group>
      </Stack>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes unlockPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </Modal>
  );
}
