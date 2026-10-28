'use client';

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@analytics-platform/browser-sdk';

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const pathname = usePathname();
	const previousPage = useRef<string | null>(null);

	useEffect(() => {
		let active = true;
		let client: Analytics | null = null;

		const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
		const writeKey = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;

		if (!apiUrl || !writeKey) {
			console.error(
				'Analytics environment variables are missing. Page-view tracking is disabled.',
			);
			return;
		}

		void Promise.resolve().then(() => {
			if (!active) return;

			try {
				client = new Analytics({
					apiUrl,
					writeKey,
					autoTrackPageViews: false,
				});

				if (active) {
					setAnalytics(client);
				}
			} catch (error) {
				console.error('Failed to initialize analytics SDK:', error);
			}
		});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!analytics || !pathname) return;
		if (previousPage.current === pathname) return;

		previousPage.current = pathname;
		analytics.trackPageView();
	}, [analytics, pathname]);

	return (
		<AnalyticsContext.Provider value={analytics}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalytics(): Analytics | null {
	return useContext(AnalyticsContext);
}
