// core styles are required for all packages
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// other css files are required only if
// you are using components from the corresponding package
// import '@mantine/dates/styles.css';
// import '@mantine/dropzone/styles.css';
// import '@mantine/code-highlight/styles.css';

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { PropsWithChildren, useMemo } from 'react';
import classes from './Mantine.module.css';
import { useGameConfig } from '../common/GameConfigContext';
import { THEME_PRESETS } from '../common/themePresets';

export default function Mantine({ children }: PropsWithChildren) {
	// override theme for Mantine (default props and styles)
	// https://mantine.dev/theming/mantine-provider/

	const { config } = useGameConfig();
	const preset = THEME_PRESETS[config.themeAccent] ?? THEME_PRESETS.aurora;

	const theme = useMemo(() => createTheme({
		primaryColor: preset.primaryColor as any,
		primaryShade: { light: 6, dark: 4 },
		// Added Segoe UI Variable Text (Win11) to https://mantine.dev/theming/typography/#system-fonts
		fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI Variable Text, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
		// added source-code-pro and SFMono-Regular
		fontFamilyMonospace: 'source-code-pro, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
		defaultRadius: 'md',
		fontSizes: {
			xs: '0.75rem',
			sm: '0.875rem',
			md: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
		},
		components: {
			Checkbox: { styles: { input: { cursor: 'pointer' }, label: { cursor: 'pointer' } } },
			TextInput: { styles: { label: { marginTop: '0.5rem', color: 'var(--fd-text-secondary)' } } },
			Select: { styles: { label: { marginTop: '0.5rem', color: 'var(--fd-text-secondary)' } } },
			Loader: { defaultProps: { size: 'xl', variant: 'oval' } },
			Space: { defaultProps: { h: 'sm' } },
			Anchor: { defaultProps: { target: '_blank' } },
			Burger: { styles: { burger: { color: '--mantine-color-grey-6' } } },
			CopyButton: { defaultProps: { timeout: 1100 } },
			SegmentedControl: { classNames: { root: classes.segmentedControlRoot } },
			Card: {
				styles: {
					root: {
						backgroundColor: 'var(--fd-surface-1)',
						borderColor: 'var(--fd-border-subtle)',
						color: 'var(--fd-text-primary)',
						boxShadow: 'var(--fd-card-shadow)',
					},
				},
			},
		},
		// Mantine v7 has ugly dark colors. Therefore, use colors from v6 (https://v6.mantine.dev/theming/colors/#default-colors)
		colors: {
			dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5c5f66', '#373A40', '#2C2E33', '#25262b', '#1A1B1E', '#141517', '#101113']
		}
	}), [preset]);

	const cssVariablesResolver = () => ({
		variables: {
			'--fd-accent-gradient-start': preset.gradientStart,
			'--fd-accent-gradient-end': preset.gradientEnd,
			'--fd-accent-border': preset.borderLight,
			'--fd-accent-surface': preset.surfaceTint,
			'--fd-header-shadow': preset.headerShadow,
			'--fd-surface-0': preset.surfaceBase,
			'--fd-surface-1': preset.surfaceRaised,
			'--fd-surface-2': preset.surfaceSubtle,
			'--fd-border-subtle': preset.borderSubtle,
			'--fd-border-strong': preset.borderStrong,
			'--fd-text-primary': preset.textPrimary,
			'--fd-text-secondary': preset.textSecondary,
			'--fd-text-inverse': preset.textOnAccent,
			'--fd-accent-soft': preset.accentSoft,
			'--fd-accent-soft-border': preset.accentSoftBorder,
			'--fd-positive-surface': preset.positiveSurface,
			'--fd-positive-border': preset.positiveBorder,
			'--fd-positive-strong': preset.positiveStrong,
			'--fd-info-surface': preset.infoSurface,
			'--fd-info-border': preset.infoBorder,
			'--fd-info-strong': preset.infoStrong,
			'--fd-warning-surface': preset.warningSurface,
			'--fd-warning-border': preset.warningBorder,
			'--fd-warning-strong': preset.warningStrong,
			'--fd-danger-surface': preset.dangerSurface,
			'--fd-danger-border': preset.dangerBorder,
			'--fd-danger-strong': preset.dangerStrong,
			'--fd-card-shadow': '0 12px 32px rgba(15, 23, 42, 0.08)',
			'--fd-font-family': '-apple-system, BlinkMacSystemFont, Segoe UI Variable Text, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
		},
		light: {
			'--mantine-color-body': 'var(--fd-surface-0)',
		},
		dark: {
			'--mantine-color-body': '#101828',
		}
	});

	return <>
		<ColorSchemeScript defaultColorScheme='auto' />
		<MantineProvider defaultColorScheme='auto' theme={theme} cssVariablesResolver={cssVariablesResolver}>
			<ModalsProvider>
				<Notifications />
				{children}
			</ModalsProvider>
		</MantineProvider>
	</>
}
