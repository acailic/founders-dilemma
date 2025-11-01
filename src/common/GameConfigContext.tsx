import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useLocalForage } from './utils';
import { ThemeAccentKey } from './themePresets';

export type DifficultyOption = 'indie' | 'vc' | 'regulated' | 'infra';

export interface GameConfig {
  defaultDifficulty: DifficultyOption;
  showAdvancedMetrics: boolean;
  themeAccent: ThemeAccentKey;
}

interface GameConfigContextValue {
  config: GameConfig;
  setConfig: (updates: Partial<GameConfig>) => void;
  loading: boolean;
}

const DEFAULT_CONFIG: GameConfig = {
  defaultDifficulty: 'indie',
  showAdvancedMetrics: true,
  themeAccent: 'aurora',
};

const GameConfigContext = createContext<GameConfigContextValue | null>(null);

export function GameConfigProvider({ children }: PropsWithChildren) {
  const [storedConfig, setConfigState, loading] = useLocalForage<GameConfig>('game-config', DEFAULT_CONFIG);

  const mergedConfig = useMemo<GameConfig>(
    () => ({ ...DEFAULT_CONFIG, ...storedConfig }),
    [storedConfig],
  );

  const setConfig = (updates: Partial<GameConfig>) => {
    setConfigState(prev => ({ ...DEFAULT_CONFIG, ...prev, ...updates }));
  };

  const value = useMemo<GameConfigContextValue>(
    () => ({ config: mergedConfig, setConfig, loading }),
    [mergedConfig, loading],
  );

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
}

export function useGameConfig(): GameConfigContextValue {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
}
