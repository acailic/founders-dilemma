# GitHub Pages Health Checker

This feature adds a health checker for GitHub Pages deployments to the Founder's Dilemma application.

## Features

- **Real-time Status Monitoring**: Automatically checks if the GitHub Pages site is online
- **Auto-refresh**: Periodically checks the site status (default: every 2 minutes)
- **Visual Indicator**: Shows a badge in the app header with online/offline status
- **Detailed Tooltip**: Hover over the badge to see response time, status code, and last check time
- **Web-only**: Only appears in web deployments (not in Tauri desktop app)

## Components

### 1. GitHub Pages Health Checker Utility
**Location**: `src/lib/github-pages-checker.ts`

Provides core functionality:
- `checkGitHubPagesHealth()` - Performs a health check on a given URL
- `getGitHubPagesUrl()` - Gets the GitHub Pages URL from environment config
- `monitorGitHubPages()` - Continuously monitors site health

### 2. Status Indicator Component
**Location**: `src/components/GitHubPagesStatus.tsx`

React component that displays the health status:
- Shows a badge with "Online" or "Offline" status
- Green badge when site is accessible
- Red badge when site is unavailable
- Gray badge while checking
- Displays response time and detailed info in tooltip

### 3. Integration
**Location**: `src/App.tsx`

The status indicator is integrated into the app header, appearing only in web deployments (when not running as a Tauri desktop app).

## Configuration

Default settings:
- **URL**: `https://acailic.github.io/founders-dilemma/`
- **Auto-refresh**: Enabled
- **Refresh interval**: 120,000ms (2 minutes)
- **Display mode**: Compact

You can customize these settings by modifying the props in `App.tsx`:

```tsx
<GitHubPagesStatus
  url="https://acailic.github.io/founders-dilemma/"
  autoRefresh={true}
  refreshInterval={120000}
  compact={true}
/>
```

## Technical Details

### Health Check Method
- Uses `fetch()` with `HEAD` method for lightweight checks
- Implements retry logic (default: 2 retries)
- Timeout protection (default: 10 seconds)
- Uses `no-cors` mode to handle CORS restrictions

### Error Handling
- Gracefully handles network errors
- Reports timeout errors
- Displays error messages in tooltip

## Usage

1. Open the web version of Founder's Dilemma
2. Look for the status badge in the top-right header (next to the language switcher)
3. Hover over the badge to see detailed status information
4. The badge will automatically refresh every 2 minutes

## Future Enhancements

Potential improvements:
- Configurable URL through settings panel
- Manual refresh button
- Notification on status change
- Historical uptime tracking
- Custom check intervals per user preference
