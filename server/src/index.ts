import router from '@/controllers';
import cookie from '@elysiajs/cookie';
import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { logger } from '@grotto/logysia';
import Elysia from 'elysia';
import { helmet } from 'elysia-helmet';

// import { rateLimit } from 'elysia-rate-limit';

export const setup = new Elysia()
	// .use(rateLimit())
	.use(logger())
	.use(cors())
	// .use(helmet())
	.use(swagger())
	.use(cookie())
	.onError(({ code, error }) => {
		return {
			code,
			error,
		};
	});

const app = new Elysia()
	.use(setup)
	.use(router)
	.listen(process.env.PORT ?? 5000);

console.log(`server is running on port ${app.server?.port}`);

export type TApp = typeof app;
