/**
 * GitHub Pages Health Checker
 * Checks if a GitHub Pages site is accessible and online
 */

export interface PageStatus {
  isOnline: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export interface CheckerConfig {
  url: string;
  timeout?: number;
  retries?: number;
}

/**
 * Check if a GitHub Pages site is accessible
 * @param config Configuration for the health check
 * @returns PageStatus indicating whether the page is online
 */
export async function checkGitHubPagesHealth(
  config: CheckerConfig
): Promise<PageStatus> {
  const { url, timeout = 10000, retries = 2 } = config;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // GitHub Pages may not have CORS headers
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // With no-cors mode, we won't get the actual status code
      // but if the request completes without error, the site is accessible
      return {
        isOnline: true,
        statusCode: response.status || 200,
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      // If this was the last retry, return error
      if (attempt === retries) {
        const responseTime = Date.now() - startTime;
        return {
          isOnline: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime,
          timestamp: new Date(),
        };
      }
      // Otherwise, wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  // Fallback (should never reach here)
  return {
    isOnline: false,
    error: 'Max retries exceeded',
    timestamp: new Date(),
  };
}

/**
 * Get the GitHub Pages URL for the current repository
 * @returns The GitHub Pages URL or null if not applicable
 */
export function getGitHubPagesUrl(): string | null {
  // Check if we have a base path that indicates GitHub Pages
  const basePath = import.meta.env.VITE_BASE_PATH;

  if (basePath && basePath.includes('founders-dilemma')) {
    // Extract repository name and construct URL
    const repoName = 'founders-dilemma';
    // You would typically get the username from environment or config
    // For now, we'll construct a generic URL pattern
    return `https://acailic.github.io/${repoName}/`;
  }

  return null;
}

/**
 * Continuously monitor GitHub Pages health
 * @param config Configuration for the health check
 * @param interval Check interval in milliseconds
 * @param callback Callback function to receive status updates
 * @returns Function to stop monitoring
 */
export function monitorGitHubPages(
  config: CheckerConfig,
  interval: number,
  callback: (status: PageStatus) => void
): () => void {
  let isActive = true;

  const check = async () => {
    if (!isActive) return;

    const status = await checkGitHubPagesHealth(config);
    callback(status);

    if (isActive) {
      setTimeout(check, interval);
    }
  };

  // Start the first check
  check();

  // Return a function to stop monitoring
  return () => {
    isActive = false;
  };
}
