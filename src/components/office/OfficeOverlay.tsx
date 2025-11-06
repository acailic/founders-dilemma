import { Card, Stack, Group, Text, Badge, ActionIcon } from '@mantine/core';
import CharacterSprite from './CharacterSprite';
import type { TeamMember } from '../../types/office';
import { ActionType, Mood } from '../../types/office';

interface OfficeOverlayProps {
  hoveredMember: TeamMember | null;
  selectedMember: TeamMember | null;
  pointerPosition: { x: number; y: number } | null;
  canvasSize: { width: number; height: number };
  onClearSelection: () => void;
}

export default function OfficeOverlay({
  hoveredMember,
  selectedMember,
  pointerPosition,
  canvasSize,
  onClearSelection
}: OfficeOverlayProps) {
  const tooltip = hoveredMember && pointerPosition
    ? renderTooltip(hoveredMember, pointerPosition, canvasSize)
    : null;

  const inspector = selectedMember
    ? renderInspector(selectedMember, onClearSelection)
    : null;

  return (
    <>
      {tooltip}
      {inspector}
    </>
  );
}

function renderTooltip(
  member: TeamMember,
  pointer: { x: number; y: number },
  canvasSize: { width: number; height: number }
) {
  const tooltipWidth = 200;
  const tooltipHeight = 72;
  const margin = 16;

  let left = pointer.x + margin;
  if (left + tooltipWidth > canvasSize.width - margin) {
    left = Math.max(margin, pointer.x - tooltipWidth - margin);
  }

  let top = pointer.y + margin;
  if (top + tooltipHeight > canvasSize.height - margin) {
    top = Math.max(margin, pointer.y - tooltipHeight - margin);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: tooltipWidth,
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
        pointerEvents: 'none'
      }}
    >
      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="sm" fw={600}>{member.name}</Text>
          <Badge size="xs" variant="light">
            {formatRole(member.role)}
          </Badge>
        </Group>
        <Group gap="xs">
          <Badge size="xs" color="blue" variant="light">
            {formatAction(member.currentAction)}
          </Badge>
          <Badge
            size="xs"
            color={badgeColorForMood(member.mood)}
            variant="light"
          >
            {formatMood(member.mood)}
          </Badge>
        </Group>
      </Stack>
    </div>
  );
}

function renderInspector(
  member: TeamMember,
  onClearSelection: () => void
) {
  return (
    <Card
      shadow="md"
      padding="md"
      withBorder
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 260,
        pointerEvents: 'auto'
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Group align="flex-start" gap="sm">
          <CharacterSprite member={member} size={40} />
          <Stack gap={2}>
            <Text fw={600}>{member.name}</Text>
            <Group gap="xs">
              <Badge size="xs" variant="light">
                {formatRole(member.role)}
              </Badge>
              <Badge
                size="xs"
                color={badgeColorForMood(member.mood)}
                variant="light"
              >
                {formatMood(member.mood)}
              </Badge>
            </Group>
          </Stack>
        </Group>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={onClearSelection}
          aria-label="Close inspector"
        >
          <Text size="sm">✕</Text>
        </ActionIcon>
      </Group>

      <Stack gap="sm" mt="sm">
        <Group gap="xs">
          <Badge size="sm" color="indigo" variant="outline">
            {formatAction(member.currentAction)}
          </Badge>
        </Group>
        <Group gap="lg">
          <Stat label="Joined" value={`Week ${member.joinedWeek}`} />
          <Stat label="Productivity" value={`${member.productivity}%`} />
          <Stat label="Satisfaction" value={`${member.satisfaction}%`} />
        </Group>
      </Stack>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={600}>{value}</Text>
    </div>
  );
}

function formatRole(role: TeamMember['role']): string {
  return role.replace(/_/g, ' ');
}

function formatAction(action: ActionType): string {
  switch (action) {
    case ActionType.Coding:
      return 'Coding';
    case ActionType.Meeting:
      return 'In Meeting';
    case ActionType.Calling:
      return 'Customer Calls';
    case ActionType.Designing:
      return 'Designing';
    case ActionType.Writing:
      return 'Writing';
    case ActionType.Celebrating:
      return 'Celebrating';
    case ActionType.Walking:
      return 'Walking';
    case ActionType.Break:
      return 'On Break';
    default:
      return 'Idle';
  }
}

function formatMood(mood: Mood): string {
  switch (mood) {
    case Mood.Thriving:
      return 'Thriving';
    case Mood.Happy:
      return 'Happy';
    case Mood.Neutral:
      return 'Neutral';
    case Mood.Stressed:
      return 'Stressed';
    case Mood.Exhausted:
      return 'Exhausted';
    default:
      return 'Mood';
  }
}

function badgeColorForMood(mood: Mood): string {
  switch (mood) {
    case Mood.Thriving:
      return 'green';
    case Mood.Happy:
      return 'blue';
    case Mood.Neutral:
      return 'gray';
    case Mood.Stressed:
      return 'orange';
    case Mood.Exhausted:
      return 'red';
    default:
      return 'gray';
  }
}
