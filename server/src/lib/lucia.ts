import { queryClient } from '@/database/drizzle';
import redisClient from '@/database/redis';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { redis as redisAdapter } from '@lucia-auth/adapter-session-redis';
import { github, google } from '@lucia-auth/oauth/providers';
import { lucia } from 'lucia';
import { elysia } from 'lucia/middleware';

const isProd: boolean = process.env.NODE_ENV === 'production';
export const auth = lucia({
	env: isProd ? 'PROD' : 'DEV', // "PROD" if deployed to HTTPS
	middleware: elysia(),
	adapter: {
		user: postgresAdapter(queryClient, {
			user: 'auth_user',
			key: 'user_key',
			session: 'user_session',
		}),
		session: redisAdapter(redisClient),
	},
	getUserAttributes: (data) => {
		return {
			githubUsername: data.github_username,
			username: data.username,
			email: data.email,
			name: data.name,
			avatar: data.avatar,
		};
	},
	csrfProtection: false,
});

export type Auth = typeof auth;

export const githubAuth = github(auth, {
	clientId: process.env.GITHUB_CLIENT_ID ?? '',
	clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
});

export const googleAuth = google(auth, {
	clientId: process.env.GOOGLE_CLIENT_ID ?? '',
	clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
	redirectUri: `${process.env.CLIENT_URL}/backend/auth/google/callback` ?? '',
	scope: ['email', 'profile'],
});
