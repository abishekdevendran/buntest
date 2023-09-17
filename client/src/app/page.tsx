import { TApp } from 'server';
import { edenFetch } from '@elysiajs/eden';

export default async function Home() {
	const api = edenFetch<TApp>('http://localhost:5000');
	const resp = await api('/', {});
	return <>{JSON.stringify(resp.data)}</>;
}
