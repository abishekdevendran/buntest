import authRouter from '@/controllers/auth';
import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { logger } from '@grotto/logysia';
import Elysia from 'elysia';

export const setup = new Elysia({ name: 'setup' })
	.use(swagger())
	// .use(cors())
	// .use(logger())

const app = new Elysia()
	.use(setup)
	.ws('/ws', {
		open(ws) {
			console.log('ws opened');
		},
		close(ws) {
			console.log('ws closed');
		},
		message(ws, message) {
			console.log('ws message:' + message);
			// reply mirror
			ws.send(message);
		},
	})
	.get('/', () => ({
		message: 'Hello from Elysia!🦊',
	}))
	.use(authRouter)
	.listen(process.env.PORT ?? 5000);

console.log(`server is running on port ${app.server?.port}`);

export type TApp = typeof app;
