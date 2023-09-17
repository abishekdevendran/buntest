import { auth, githubAuth, googleAuth } from '@/lib/lucia';
import cookie from '@elysiajs/cookie';
import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { logger } from '@grotto/logysia';
import { OAuthRequestError } from '@lucia-auth/oauth';
import { Elysia, t } from 'elysia';
import { helmet } from 'elysia-helmet';


// import { rateLimit } from 'elysia-rate-limit';

const app = new Elysia()
	// .use(rateLimit())
	.use(logger())
	.use(cors())
	.use(cookie())
	.use(helmet())
	.use(swagger())
	.get('/', () => ({
		message: 'Hello from Elysia!🦊',
	}))
	.get('/id/:id', ({ params: { id } }) => id)
	// a get request implementing github oauth with Lucia
	.get('/auth/github', async ({ setCookie, set }) => {
		const [url, state] = await githubAuth.getAuthorizationUrl();
		setCookie('github_oauth_state', state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60, // 1 hour
		});
		set.status = 302;
		set.redirect = url.toString();
		return;
	})
	.get(
		'/auth/github/callback',
		async (ctx) => {
			const { code, state } = ctx.query;
			const { github_oauth_state } = ctx.cookie;
			if (!github_oauth_state || !state || state !== github_oauth_state) {
				ctx.set.status = 400;
				return {
					message: 'Invalid state',
				};
			}
			try {
				const { getExistingUser, githubUser, createUser } =
					await githubAuth.validateCallback(code);
				const getUser = async () => {
					const existingUser = await getExistingUser();
					if (existingUser) return existingUser;
					const user = await createUser({
						attributes: {
							github_username: githubUser.login,
							email: githubUser.email,
							username: githubUser.login,
							name: githubUser.name,
							avatar: githubUser.avatar_url ?? null,
						},
					});
					return user;
				};

				const user = await getUser();

				// create session
				const session = await auth.createSession({
					userId: user.userId,
					attributes: {},
				});
				const authRequest = auth.handleRequest(ctx);
				authRequest.setSession(session);
				ctx.set.status = 302;
				ctx.set.redirect = process.env.CLIENT_URL ?? 'http://localhost:3000';
				return;
			} catch (err) {
				if (err instanceof OAuthRequestError) {
					ctx.set.status = 400;
					return {
						message: err.message,
					};
				}
				ctx.set.status = 500;
				return {
					message: 'Internal server error',
				};
			}
		},
		{
			cookie: t.Object({
				github_oauth_state: t.String(),
			}),
			query: t.Object({
				code: t.String(),
				state: t.String(),
			}),
		},
	)
	.post('/mirror', ({ body }) => body, {
		body: t.Object({
			id: t.Number(),
			name: t.String(),
		}),
	})
	.listen(5000);

console.log(`server is running on port ${app.server?.port}`);

export type TApp = typeof app;