import { ActionIcon, AppShell, Burger, Button, Group, Paper, Space, Stack, Text, ThemeIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { isTauri } from '@tauri-apps/api/core';
import * as tauriEvent from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import * as tauriLogger from '@tauri-apps/plugin-log';
import { relaunch } from '@tauri-apps/plugin-process';
import * as tauriUpdater from '@tauri-apps/plugin-updater';
import { JSX, ReactNode, lazy, LazyExoticComponent, Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { BsMoonStarsFill } from 'react-icons/bs';
import { ImCross } from 'react-icons/im';
import { IoSunnySharp } from 'react-icons/io5';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import classes from './App.module.css';
import { useCookie, useLocalForage } from './common/utils';
import LanguageHeaders from './components/LanguageHeaders';
import { ScrollToTop } from './components/ScrollToTop';
import { useTauriContext } from './tauri/TauriProvider';
import { TitleBar } from './tauri/TitleBar';
import ExampleView from './views/ExampleView';
import GameView from './views/GameView';
import FallbackAppRender from './views/FallbackErrorBoundary';
import FallbackSuspense from './views/FallbackSuspense';
import ConfigView from './views/ConfigView';
import { LuRocket, LuSettings2, LuLightbulb, LuFlaskConical, LuFeather, LuInfo } from 'react-icons/lu';
import AppIconGraphic from './components/AppIcon';
import { useGameConfig } from './common/GameConfigContext';
import { THEME_PRESETS } from './common/themePresets';
import { GitHubPagesStatus } from './components/GitHubPagesStatus';
import { isTauri as checkIsTauri } from './lib/invoke-wrapper';
// if some views are large, you can use lazy loading to reduce the initial app load time
const LazyView = lazy(() => import('./views/LazyView'));

// imported views need to be added to the `views` list variable
interface View {
	component: (() => JSX.Element) | LazyExoticComponent<() => JSX.Element>,
	path: string,
	exact?: boolean,
	name: string,
	icon?: ReactNode
}

	export default function () {
		const { t } = useTranslation();
		// check if using custom titlebar to adjust other components
		const { usingCustomTitleBar } = useTauriContext();
		const { config } = useGameConfig();
		const accentPreset = THEME_PRESETS[config.themeAccent] ?? THEME_PRESETS.aurora;
		const accentMantineColor = accentPreset.primaryColor;

	// left sidebar
		const views: View[] = [
			{ component: GameView, path: '/game', name: "Founder's Dilemma", icon: <LuRocket size={18} /> },
			{ component: ConfigView, path: '/config', name: 'Configuration', icon: <LuSettings2 size={18} /> },
			{ component: ExampleView, path: '/example-view', name: t('ExampleView'), icon: <LuLightbulb size={18} /> },
			{ component: () => <Text>Woo, routing works</Text>, path: '/example-view-2', name: 'Test Routing', icon: <LuFlaskConical size={18} /> },
			{ component: LazyView, path: '/lazy-view', name: 'Lazy Load', icon: <LuFeather size={18} /> }
		// Other ways to add views to this array:
		//     { component: () => <Home prop1={'stuff'} />, path: '/home', name: t('Home') },
		//     { component: React.memo(About), path: '/about', name: t('About') },
	];

	const { toggleColorScheme } = useMantineColorScheme();
	const colorScheme = useComputedColorScheme();
	useHotkeys([['ctrl+J', toggleColorScheme]]);

	// opened is for mobile nav
	const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();

		const [desktopNavOpenedCookie, setDesktopNavOpenedCookie] = useCookie('desktop-nav-opened', 'true');
		const desktopNavOpened = desktopNavOpenedCookie === 'true';
		const toggleDesktopNav = () => setDesktopNavOpenedCookie(o => o === 'true' ? 'false' : 'true');
		const [tipsVisible, { toggle: toggleTips }] = useDisclosure(false);

	const [scroller, setScroller] = useState<HTMLElement | null>(null);
	// load preferences using localForage
	const [footersSeen, setFootersSeen, footersSeenLoading] = useLocalForage('footersSeen', {});

	const [navbarClearance, setNavbarClearance] = useState(0);
	const footerRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (footerRef.current) setNavbarClearance(footerRef.current.clientHeight);
	}, [footersSeen]);


	// Tauri event listeners (run on mount)
	const isTauriApp = isTauri();

	useEffect(() => {
		if (!isTauriApp) return;
		const promise = tauriEvent.listen('longRunningThread', ({ payload }: { payload: any }) => {
			tauriLogger.info(payload.message);
		});
		return () => { promise.then(unlisten => unlisten()) };
	}, [isTauriApp]);

	// system tray events
	useEffect(() => {
		if (!isTauriApp) return;
		const promise = tauriEvent.listen('systemTray', ({ payload, ...eventObj }: { payload: { message: string } }) => {
			tauriLogger.info(payload.message);
			// for debugging purposes only
			notifications.show({
				title: '[DEBUG] System Tray Event',
				message: payload.message
			});
		});
		return () => { promise.then(unlisten => unlisten()) };
	}, [isTauriApp]);

	// update checker
	useEffect(() => {
		if (!isTauriApp) return;
		(async () => {
			const update = await tauriUpdater.check();
			if (update) {
				const color = colorScheme === 'dark' ? 'teal' : 'teal.8';
				notifications.show({
					id: 'UPDATE_NOTIF',
					title: t('updateAvailable', { v: update.version }),
					color,
					message: <>
						<Text>{update.body}</Text>
						<Button color={color} style={{ width: '100%' }} onClick={() => update.downloadAndInstall(event => {
							switch (event.event) {
								case 'Started':
									notifications.show({ title: t('installingUpdate', { v: update.version }), message: t('relaunchMsg'), autoClose: false });
									// contentLength = event.data.contentLength;
									// tauriLogger.info(`started downloading ${event.data.contentLength} bytes`);
									break;
								case 'Progress':
									// downloaded += event.data.chunkLength;
									// tauriLogger.info(`downloaded ${downloaded} from ${contentLength}`);
									break;
								case 'Finished':
									// tauriLogger.info('download finished');
									break;
							}
						}).then(relaunch)}>{t('installAndRelaunch')}</Button>
					</>,
					autoClose: false
				});
			}
		})()
	}, [isTauriApp, colorScheme, t]);

	// Handle additional app launches (url, etc.)
	useEffect(() => {
		if (!isTauriApp) return;
		const promise = tauriEvent.listen('newInstance', async ({ payload, ...eventObj }: { payload: { args: string[], cwd: string } }) => {
			const appWindow = getCurrentWebviewWindow();
			if (!(await appWindow.isVisible())) await appWindow.show();

			if (await appWindow.isMinimized()) {
				await appWindow.unminimize();
				await appWindow.setFocus();
			}

			let args = payload?.args;
			let cwd = payload?.cwd;
			if (args?.length > 1) {

			}
		});
		return () => { promise.then(unlisten => unlisten()) };
	}, [isTauriApp]);

	function NavLinks() {
		return views.map((view, index) => (
			<NavLink
				to={view.path}
				key={index}
				end={view.exact}
				onClick={() => toggleMobileNav()}
				className={({ isActive }) =>
					`${classes.navLink} ${isActive ? classes.navLinkActive : classes.navLinkInactive}`
				}
			>
				{({ isActive }) => (
					<Group gap="sm" className={classes.navLinkContent}>
						{view.icon && (
							<ThemeIcon
								size={34}
								radius="md"
								variant={isActive ? 'filled' : 'light'}
								color={isActive ? accentMantineColor : 'gray'}
								className={classes.navIcon}
							>
								{view.icon}
							</ThemeIcon>
						)}
						<Text className={classes.navLinkLabel}>{view.name}</Text>
					</Group>
				)}
			</NavLink>
		));
	}

	const FOOTER_KEY = 'footer[0]';
	const showFooter = FOOTER_KEY && !footersSeenLoading && !(FOOTER_KEY in footersSeen);
	// assume key is always available
	const footerText = t(FOOTER_KEY);

	// hack for global styling the vertical simplebar based on state
	useEffect(() => {
		const el = document.getElementsByClassName('simplebar-vertical')[0];
		if (el instanceof HTMLElement) {
			el.style.marginTop = usingCustomTitleBar ? '100px' : '70px';
			el.style.marginBottom = showFooter ? '50px' : '0px';
		}
	}, [usingCustomTitleBar, showFooter]);

	return <>
		{usingCustomTitleBar && <TitleBar />}
		<AppShell padding='md'
			header={{ height: 60 }}
			footer={showFooter ? { height: 60 } : undefined}
			navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !mobileNavOpened, desktop: !desktopNavOpened } }}
			aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: !tipsVisible, mobile: true } }}
			className={classes.appShell}>
			<AppShell.Main>
				{usingCustomTitleBar && <Space h='xl' />}
				<SimpleBar scrollableNodeProps={{ ref: setScroller }} autoHide={false} className={classes.simpleBar}>
					<ErrorBoundary FallbackComponent={FallbackAppRender} /*onReset={_details => resetState()} */ onError={(e: Error) => tauriLogger.error(e.message)}>
						<Routes>
							{views[0] !== undefined && <Route path='/' element={<Navigate to={views[0].path} />} />}
							{views.map((view, index) => <Route key={index} path={view.path} element={<Suspense fallback={<FallbackSuspense />}><view.component /></Suspense>} />)}
						</Routes>
					</ErrorBoundary>
					{/* prevent the footer from covering bottom text of a route view */}
					<Space h={showFooter ? 70 : 50} />
					<ScrollToTop scroller={scroller} bottom={showFooter ? 70 : 20} />
				</SimpleBar>
			</AppShell.Main>
			<AppShell.Header data-tauri-drag-region p='sm' className={classes.header}>
				<Group justify='space-between' align='center' h='100%' className={classes.headerContent}>
					<Group gap='sm' align='center'>
						<Burger hiddenFrom='sm' opened={mobileNavOpened} onClick={toggleMobileNav} size='sm' />
						<Burger visibleFrom='sm' opened={desktopNavOpened} onClick={toggleDesktopNav} size='sm' />
						<Group gap='sm' align='center' className={classes.brand}>
							<AppIconGraphic size={34} />
							<div>
								<Text className={classes.brandTitle}>Founder's Dilemma</Text>
								<Text size='xs' className={classes.brandTagline}>Compound your founder instincts</Text>
							</div>
						</Group>
					</Group>
					<Group gap='md' align='center'>
						<Group gap={4} align='center' className={classes.languageSwitcher}>
							<LanguageHeaders />
						</Group>
						{!checkIsTauri() && (
							<GitHubPagesStatus
								url="https://acailic.github.io/founders-dilemma/"
								autoRefresh={true}
								refreshInterval={120000}
								compact={true}
							/>
						)}
						<Tooltip label={tipsVisible ? 'Hide quick tips' : 'Show quick tips'} position='bottom' withArrow>
						<ActionIcon
							variant='filled'
							color={accentMantineColor}
							onClick={toggleTips}
							size={34}
							className={classes.headerAction}
						>
								<LuInfo size='1.2em' />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Toggle theme (Ctrl + J)' position='bottom' withArrow>
							<ActionIcon
								id='toggle-theme'
								variant='filled'
								color={colorScheme === 'dark' ? 'yellow' : 'blue'}
								onClick={toggleColorScheme}
								size={34}
							>
								{colorScheme === 'dark' ? <IoSunnySharp size='1.4em' /> : <BsMoonStarsFill size='1.2em' />}
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar className={`${classes.titleBarAdjustedHeight} ${classes.navbar}`} h='100%' w={{ sm: 200 }} p='xs' hidden={!mobileNavOpened}>
				<AppShell.Section grow><NavLinks /></AppShell.Section>
				<AppShell.Section>
					{/* Bottom of Navbar Example: https://github.com/mantinedev/mantine/blob/master/src/mantine-demos/src/demos/core/AppShell/_user.tsx */}
					<Space h={navbarClearance} /> {/* Account for footer */}
				</AppShell.Section>
			</AppShell.Navbar >

			<AppShell.Aside className={classes.titleBarAdjustedHeight} p='md' hidden={!tipsVisible}>
				{tipsVisible && (
					<Paper withBorder radius='md' p='md' className={classes.quickTips}>
						<Stack gap='xs'>
							<Text fw={600} size='sm' className={classes.quickTipsTitle}>Quick Tips</Text>
							<Stack gap={6} className={classes.quickTipsList}>
								<Text size='xs' c='dimmed'>Press H to open the in-game help modal while planning your week.</Text>
								<Text size='xs' c='dimmed'>Use the Configuration panel to set your preferred difficulty and dashboard layout.</Text>
								<Text size='xs' c='dimmed'>Toggle the theme here or hit Ctrl + J to switch between light and dark modes.</Text>
							</Stack>
						</Stack>
					</Paper>
				)}
			</AppShell.Aside >

			{showFooter &&
				<AppShell.Footer ref={footerRef} p='md' className={classes.footer}>
					{footerText}
					<Button variant='subtle' size='xs' onClick={() => setFootersSeen(prev => ({ ...prev, [FOOTER_KEY]: '' }))}>
						<ImCross />
					</Button>
				</AppShell.Footer>}
		</AppShell>

	</>;
}
