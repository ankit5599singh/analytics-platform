'use client';

import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@analytics-platform/browser-sdk';
import { getPageDisplayName } from '@/lib/page-display-name';

type AnalyticsContextValue = Pick<Analytics, 'track' | 'trackPageView'>;

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

function getCurrentPageTitle(): string {
	if (typeof window === 'undefined') {
		return 'Untitled page';
	}

	return getPageDisplayName({
		url: window.location.href,
		title: document.title || null,
	});
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
	const clientRef = useRef<Analytics | null>(null);
	const previousPage = useRef<string | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
		const writeKey = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;
		if (!apiUrl || !writeKey) {
			console.error(
				'Analytics environment variables are missing. Tracking is disabled.',
			);
			return;
		}

		try {
			if (!clientRef.current) {
				clientRef.current = new Analytics({
					apiUrl,
					writeKey,
					autoTrackPageViews: false,
				});
			}
		} catch (error) {
			console.error('Failed to initialize analytics SDK:', error);
		}
	}, []);

	useEffect(() => {
		const client = clientRef.current;
		if (!client || !pathname) return;
		if (previousPage.current === pathname) return;
		previousPage.current = pathname;
		client.trackPageView(getCurrentPageTitle());
	}, [pathname]);

	const analytics = useMemo<AnalyticsContextValue | null>(() => {
		return {
			track: (eventName, options) => {
				clientRef.current?.track(eventName, {
					...options,
					pageTitle: options?.pageTitle ?? getCurrentPageTitle(),
				});
			},

			trackPageView: (pageTitle) => {
				clientRef.current?.trackPageView(pageTitle ?? getCurrentPageTitle());
			},
		};
	}, []);

	return (
		<AnalyticsContext.Provider value={analytics}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalytics(): AnalyticsContextValue {
	const analytics = useContext(AnalyticsContext);
	if (!analytics) {
		throw new Error('useAnalytics must be used within an AnalyticsProvider.');
	}

	return analytics;
}
