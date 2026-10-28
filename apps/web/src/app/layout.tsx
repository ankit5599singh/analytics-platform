import type { Metadata } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const fraunces = Fraunces({
	variable: '--font-fraunces',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		default: 'Demo Kitchen Analytics',
		template: '%s · Demo Kitchen',
	},
	description:
		'A restaurant ordering demo wired to a reusable analytics SDK and dashboard.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col font-sans">
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
				>
					Skip to content
				</a>

				<AnalyticsProvider>
					<SiteHeader />
					<div id="main" className="flex-1">
						{children}
					</div>
				</AnalyticsProvider>
			</body>
		</html>
	);
}
