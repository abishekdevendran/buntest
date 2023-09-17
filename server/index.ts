import { Elysia, t } from 'elysia';

const app = new Elysia()
	.get('/', () => 'Hi Elysia')
	.get('/id/:id', ({ params: { id } }) => id)
	.post('/mirror', ({ body }) => body, {
		body: t.Object({
			id: t.Number(),
			name: t.String()
		})
	})
	.listen(5000);

console.log(`server is running on port ${app.server?.port}`)

export type TApp = typeof app;
