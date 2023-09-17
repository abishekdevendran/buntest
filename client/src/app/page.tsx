import { edenFetch } from '@elysiajs/eden';
import type { TApp } from 'server/src';

export default async function Home() {
	if (!process.env.NEXT_PUBLIC_API_URL) {
		throw new Error('NEXT_PUBLIC_API_URL is not defined');
	}
	const api = edenFetch<TApp>(process.env.NEXT_PUBLIC_API_URL);
	const resp = await api('/', {});
	return <>{JSON.stringify(resp.data)}</>;
}
