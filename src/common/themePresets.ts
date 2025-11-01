export type ThemeAccentKey = 'aurora' | 'sunset' | 'midnight' | 'citrus';

export interface ThemePreset {
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  borderLight: string;
  surfaceTint: string;
  headerShadow: string;
  surfaceBase: string;
  surfaceRaised: string;
  surfaceSubtle: string;
  borderSubtle: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textOnAccent: string;
  accentSoft: string;
  accentSoftBorder: string;
  positiveSurface: string;
  positiveBorder: string;
  positiveStrong: string;
  infoSurface: string;
  infoBorder: string;
  infoStrong: string;
  warningSurface: string;
  warningBorder: string;
  warningStrong: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerStrong: string;
}

export const THEME_PRESETS: Record<ThemeAccentKey, ThemePreset> = {
  aurora: {
    primaryColor: 'teal',
    gradientStart: '#1e9f9b',
    gradientEnd: '#0b5c93',
    borderLight: '#1f7f9d',
    surfaceTint: 'rgba(18, 111, 129, 0.08)',
    headerShadow: 'rgba(8, 68, 92, 0.28)',
    surfaceBase: '#f6f8fb',
    surfaceRaised: '#ffffff',
    surfaceSubtle: '#e6f0f2',
    borderSubtle: '#d0d9df',
    borderStrong: '#0f3b46',
    textPrimary: '#132a33',
    textSecondary: '#405a65',
    textOnAccent: '#ffffff',
    accentSoft: '#d3f5f0',
    accentSoftBorder: '#5bc0b0',
    positiveSurface: '#e3f7f0',
    positiveBorder: '#2f907d',
    positiveStrong: '#036956',
    infoSurface: '#e5efff',
    infoBorder: '#3f72d6',
    infoStrong: '#1b4fbf',
    warningSurface: '#fff4e5',
    warningBorder: '#f79009',
    warningStrong: '#b54708',
    dangerSurface: '#ffeaea',
    dangerBorder: '#f04438',
    dangerStrong: '#b42318',
  },
  sunset: {
    primaryColor: 'orange',
    gradientStart: '#ff7e5f',
    gradientEnd: '#f64f59',
    borderLight: '#f55c4f',
    surfaceTint: 'rgba(230, 93, 76, 0.1)',
    headerShadow: 'rgba(180, 55, 49, 0.28)',
    surfaceBase: '#fef6f3',
    surfaceRaised: '#ffffff',
    surfaceSubtle: '#fdeae2',
    borderSubtle: '#f3d1c3',
    borderStrong: '#882f24',
    textPrimary: '#3a201c',
    textSecondary: '#70443d',
    textOnAccent: '#ffffff',
    accentSoft: '#ffe4d8',
    accentSoftBorder: '#f88e6f',
    positiveSurface: '#f0fbf5',
    positiveBorder: '#2f907d',
    positiveStrong: '#036956',
    infoSurface: '#eef5ff',
    infoBorder: '#3f72d6',
    infoStrong: '#1b4fbf',
    warningSurface: '#fff0da',
    warningBorder: '#f79009',
    warningStrong: '#b54708',
    dangerSurface: '#ffe9e7',
    dangerBorder: '#f04438',
    dangerStrong: '#b42318',
  },
  midnight: {
    primaryColor: 'indigo',
    gradientStart: '#2c3e50',
    gradientEnd: '#4b6cb7',
    borderLight: '#344b78',
    surfaceTint: 'rgba(54, 81, 126, 0.1)',
    headerShadow: 'rgba(21, 37, 66, 0.3)',
    surfaceBase: '#f5f6fb',
    surfaceRaised: '#ffffff',
    surfaceSubtle: '#e7e9f4',
    borderSubtle: '#cdd1e5',
    borderStrong: '#1f2a52',
    textPrimary: '#17203b',
    textSecondary: '#424b68',
    textOnAccent: '#ffffff',
    accentSoft: '#e0e5ff',
    accentSoftBorder: '#6273d9',
    positiveSurface: '#edf7f1',
    positiveBorder: '#2f907d',
    positiveStrong: '#036956',
    infoSurface: '#e4ecff',
    infoBorder: '#3f72d6',
    infoStrong: '#1b4fbf',
    warningSurface: '#fff3dd',
    warningBorder: '#f79009',
    warningStrong: '#b54708',
    dangerSurface: '#ffe9ef',
    dangerBorder: '#f04438',
    dangerStrong: '#b42318',
  },
  citrus: {
    primaryColor: 'lime',
    gradientStart: '#c7d63c',
    gradientEnd: '#5cb270',
    borderLight: '#7fb660',
    surfaceTint: 'rgba(125, 174, 80, 0.12)',
    headerShadow: 'rgba(82, 110, 55, 0.26)',
    surfaceBase: '#f7fbf4',
    surfaceRaised: '#ffffff',
    surfaceSubtle: '#edf5e7',
    borderSubtle: '#d4e1ce',
    borderStrong: '#3c5231',
    textPrimary: '#24321f',
    textSecondary: '#52604a',
    textOnAccent: '#1d2b11',
    accentSoft: '#e7f7d7',
    accentSoftBorder: '#7ab66c',
    positiveSurface: '#e3f7ed',
    positiveBorder: '#2f907d',
    positiveStrong: '#036956',
    infoSurface: '#e6f0ff',
    infoBorder: '#3f72d6',
    infoStrong: '#1b4fbf',
    warningSurface: '#fff4dd',
    warningBorder: '#f79009',
    warningStrong: '#b54708',
    dangerSurface: '#ffeae6',
    dangerBorder: '#f04438',
    dangerStrong: '#b42318',
  },
};
