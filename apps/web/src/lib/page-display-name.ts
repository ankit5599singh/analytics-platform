const PAGE_NAMES: Record<string, string> = {
	'/': 'Demo Home Page',
	'/dashboard': 'Analytics Dashboard',
	'/restaurant': 'Restaurant Menu',
};

const FALLBACK_TITLE = 'Untitled page';

interface PageInfo {
	url: string;
	title: string | null;
}

export function getPageDisplayName(page: PageInfo): string {
	try {
		const pathname = new URL(page.url, 'http://localhost').pathname;
		const normalizedPath = pathname.replace(/\/+$/, '') || '/';
		const knownPageName = PAGE_NAMES[normalizedPath];
		if (knownPageName) {
			return knownPageName;
		}

		const routeName = normalizedPath
			.split('/')
			.filter(Boolean)
			.pop()
			?.replace(/[-_]/g, ' ')
			.replace(/\b\w/g, (character) => character.toUpperCase());

		return routeName || page.title || FALLBACK_TITLE;
	} catch {
		return page.title || FALLBACK_TITLE;
	}
}
