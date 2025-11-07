import '@fontsource/open-sans';
import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Mantine from './components/Mantine';
import { TauriProvider } from './tauri/TauriProvider';
import { GameConfigProvider } from './common/GameConfigContext';

export default function ({ children }: PropsWithChildren) {
	const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
	return (
		<TauriProvider>
			<GameConfigProvider>
				<Mantine>
					<BrowserRouter basename={basename}>
						{children}
					</BrowserRouter>
				</Mantine>
			</GameConfigProvider>
		</TauriProvider>
	);
}
