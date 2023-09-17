import db from '@/database/drizzle';
import { setup } from '@/index';
import { auth, githubAuth, googleAuth } from '@/lib/lucia';
import { OAuthRequestError } from '@lucia-auth/oauth';
import Elysia, { t } from 'elysia';

const authRouter = new Elysia({ prefix: '/auth' })
	.use(setup)
	.get('/github', async ({ setCookie, set }) => {
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
		'/github/callback',
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
						error: err.message,
					};
				}
				ctx.set.status = 500;
				return {
					error: 'Internal server error',
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
	.get('/google', async ({ setCookie, set }) => {
		const [url, state] = await googleAuth.getAuthorizationUrl();
		setCookie('google_oauth_state', state, {
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
		'/google/callback',
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
				const { getExistingUser, googleUser, createUser, createKey } =
					await googleAuth.validateCallback(code);
				const getUser = async () => {
					const existingUser = await getExistingUser();
					if (existingUser) return existingUser;
					if (googleUser.email_verified && googleUser.email) {
						// check if user already exists with email
						const existingDatabaseUserWithEmail = await db.query.user.findFirst(
							{
								where: (user, { eq }) => eq(user.email, googleUser.email!),
							},
						);
						if (existingDatabaseUserWithEmail) {
							// transform `UserSchema` to `User`
							const user = auth.transformDatabaseUser(
								existingDatabaseUserWithEmail,
							);
							await createKey(user.userId);
							return user;
						}
					}
					const user = await createUser({
						attributes: {
							email: googleUser.email ?? null,
							username: null,
							github_username: null,
							name: googleUser.name,
							avatar: googleUser.picture ?? null,
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
						error: err.message,
					};
				}
				ctx.set.status = 500;
				return {
					error: 'Internal server error',
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
	);

export default authRouter;
