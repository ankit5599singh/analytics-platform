export interface AnalyticsConfig {
	apiUrl: string;
	writeKey: string;
	autoTrackPageViews?: boolean;
}

export interface TrackOptions {
	userId?: string;
	pageTitle?: string;
	properties?: Record<string, unknown>;
}

interface AnalyticsEvent {
	event_id: string;
	event_name: string;
	source: 'browser';
	anonymous_id: string;
	session_id: string;
	user_id?: string;
	occurred_at: string;
	page: { url: string; title: string; referrer: string | null };
	properties: Record<string, unknown>;
}

const ANONYMOUS_ID_KEY = 'analytics_anonymous_id';
const SESSION_ID_KEY = 'analytics_session_id';

function createId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(character) => {
			const random = (Math.random() * 16) | 0;
			const value = character === 'x' ? random : (random & 0x3) | 0x8;
			return value.toString(16);
		},
	);
}

function getStoredId(key: string, storage: Storage): string {
	let id = storage.getItem(key);
	if (!id) {
		id = createId();
		storage.setItem(key, id);
	}

	return id;
}

export class Analytics {
	private readonly apiUrl: string;
	private readonly writeKey: string;
	private readonly anonymousId: string;
	private readonly sessionId: string;
	private userId?: string;

	constructor(config: AnalyticsConfig) {
		if (typeof window === 'undefined') {
			throw new Error('Analytics SDK can only run in a browser.');
		}

		if (!config.apiUrl || !config.writeKey) {
			throw new Error('apiUrl and writeKey are required.');
		}

		this.apiUrl = config.apiUrl.replace(/\/+$/, '');
		this.writeKey = config.writeKey;
		this.anonymousId = getStoredId(ANONYMOUS_ID_KEY, window.localStorage);
		this.sessionId = getStoredId(SESSION_ID_KEY, window.sessionStorage);
		if (config.autoTrackPageViews !== false) {
			this.trackPageView();
		}
	}

	identify(userId: string): void {
		this.userId = userId;
	}

	trackPageView(pageTitle?: string): void {
		this.track('page_view', { pageTitle, properties: {} });
	}

	track(eventName: string, options: TrackOptions = {}): void {
		if (!/^[a-zA-Z][a-zA-Z0-9_.-]{0,99}$/.test(eventName)) {
			throw new Error('Invalid analytics event name.');
		}

		const event: AnalyticsEvent = {
			event_id: createId(),
			event_name: eventName,
			source: 'browser',
			anonymous_id: this.anonymousId,
			session_id: this.sessionId,
			occurred_at: new Date().toISOString(),
			page: {
				url: window.location.href,
				title: options.pageTitle ?? document.title,
				referrer: document.referrer || null,
			},
			properties: options.properties ?? {},
		};

		const userId = options.userId ?? this.userId;
		if (userId) {
			event.user_id = userId;
		}

		void fetch(`${this.apiUrl}/events`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Analytics-Write-Key': this.writeKey,
			},
			body: JSON.stringify(event),
			keepalive: true,
		}).catch((error: unknown) => {
			console.warn('Analytics event delivery failed.', error);
		});
	}
}
