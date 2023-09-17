import WebSocketDemo from '@/components/socketHandler';
import { edenFetch } from '@elysiajs/eden';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { TApp } from 'server/src';

export default async function Home() {
	if (!process.env.NEXT_PUBLIC_API_URL) {
		throw new Error('NEXT_PUBLIC_API_URL is not defined');
	}
	const nextCookies = cookies();
	const api = edenFetch<TApp>(
		process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
	);
	const { data, error } = await api(`/me`, {
		cache: 'no-store',
		credentials: 'include',
		headers: {
			Cookie: cookies().toString(),
		},
	});
	if (error) {
		return (
			<Link
				href="/backend/auth/github"
				className="rounded-full bg-yellow-600 p-4"
			>
				Login
			</Link>
		);
	} else {
		return (
			<>
				{JSON.stringify(data)}
				<WebSocketDemo />
			</>
		);
	}
}
