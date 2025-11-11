import { useEffect, useState } from 'react';
import { Badge, Group, Text, Tooltip, Box } from '@mantine/core';
import {
  checkGitHubPagesHealth,
  type PageStatus,
  type CheckerConfig,
} from '../lib/github-pages-checker';

interface GitHubPagesStatusProps {
  url: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export function GitHubPagesStatus({
  url,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute default
  compact = false,
}: GitHubPagesStatusProps) {
  const [status, setStatus] = useState<PageStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const performCheck = async () => {
    setIsChecking(true);
    try {
      const config: CheckerConfig = {
        url,
        timeout: 10000,
        retries: 2,
      };
      const result = await checkGitHubPagesHealth(config);
      setStatus(result);
    } catch (error) {
      setStatus({
        isOnline: false,
        error: error instanceof Error ? error.message : 'Check failed',
        timestamp: new Date(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    performCheck();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const intervalId = setInterval(performCheck, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [url, autoRefresh, refreshInterval]);

  if (!status && !isChecking) {
    return null;
  }

  const getBadgeColor = () => {
    if (isChecking) return 'gray';
    return status?.isOnline ? 'green' : 'red';
  };

  const getBadgeText = () => {
    if (isChecking) return 'Checking...';
    return status?.isOnline ? 'Online' : 'Offline';
  };

  const getTooltipContent = () => {
    if (isChecking) return 'Checking GitHub Pages status...';
    if (!status) return 'No status available';

    const lines = [
      `Status: ${status.isOnline ? 'Online' : 'Offline'}`,
      status.statusCode ? `Status Code: ${status.statusCode}` : null,
      status.responseTime ? `Response Time: ${status.responseTime}ms` : null,
      status.error ? `Error: ${status.error}` : null,
      `Last Checked: ${status.timestamp.toLocaleTimeString()}`,
    ].filter(Boolean);

    return (
      <Box>
        {lines.map((line, i) => (
          <Text key={i} size="xs">
            {line}
          </Text>
        ))}
      </Box>
    );
  };

  if (compact) {
    return (
      <Tooltip label={getTooltipContent()} withArrow>
        <Badge
          color={getBadgeColor()}
          variant="dot"
          size="sm"
          style={{ cursor: 'pointer' }}
        >
          {getBadgeText()}
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        GitHub Pages:
      </Text>
      <Tooltip label={getTooltipContent()} withArrow>
        <Badge color={getBadgeColor()} variant="light" size="sm">
          {getBadgeText()}
        </Badge>
      </Tooltip>
      {status?.responseTime && !isChecking && (
        <Text size="xs" c="dimmed">
          ({status.responseTime}ms)
        </Text>
      )}
    </Group>
  );
}
