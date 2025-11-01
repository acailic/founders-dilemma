import '@fontsource/open-sans';
import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Mantine from './components/Mantine';
import { TauriProvider } from './tauri/TauriProvider';
import { GameConfigProvider } from './common/GameConfigContext';

export default function ({ children }: PropsWithChildren) {
	return (
		<TauriProvider>
			<GameConfigProvider>
				<Mantine>
					<BrowserRouter>
						{children}
					</BrowserRouter>
				</Mantine>
			</GameConfigProvider>
		</TauriProvider>
	);
}
