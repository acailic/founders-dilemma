import { Group, Text } from '@mantine/core';

interface DataPoint {
  week: number;
  value: number;
}

interface MiniChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  width?: number;
}

export default function MiniChart({ data, color = 'var(--fd-positive-border)', height = 40, width = 100 }: MiniChartProps) {
  if (data.length < 2) {
    return <Text size="xs" c="dimmed">Not enough data</Text>;
  }

  // Get min and max for scaling
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero

  // Create SVG path
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  // Determine trend
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'flat';
  const trendColor = trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <Group gap="xs" align="center">
      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* Grid lines */}
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--fd-border-subtle)" strokeWidth="1" opacity="0.35" />

        {/* Area fill */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={color}
          opacity="0.2"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((point.value - min) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
      <Text size="xs" c={trendColor}>{trendIcon}</Text>
    </Group>
  );
}
