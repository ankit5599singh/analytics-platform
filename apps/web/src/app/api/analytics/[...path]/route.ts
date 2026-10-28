import { NextRequest, NextResponse } from 'next/server';

const allowedResources = new Set(['summary', 'trends', 'pages', 'events']);

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	const { path } = await context.params;
	if (path.length !== 1 || !allowedResources.has(path[0])) {
		return NextResponse.json({ message: 'Not found.' }, { status: 404 });
	}

	const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
	const readKey = process.env.ANALYTICS_READ_KEY;
	if (!apiBase || !readKey) {
		return NextResponse.json(
			{ message: 'Analytics proxy is not configured.' },
			{ status: 500 },
		);
	}

	const target = new URL(`${apiBase.replace(/\/+$/, '')}/analytics/${path[0]}`);
	target.search = request.nextUrl.search;

	try {
		const upstream = await fetch(target, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'X-Analytics-Read-Key': readKey,
			},
			cache: 'no-store',
			signal: AbortSignal.timeout(8000),
		});

		const body = await upstream.text();

		return new Response(body, {
			status: upstream.status,
			headers: {
				'Content-Type':
					upstream.headers.get('content-type') ?? 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return NextResponse.json(
			{ message: 'Analytics service is unavailable.' },
			{ status: 502 },
		);
	}
}
