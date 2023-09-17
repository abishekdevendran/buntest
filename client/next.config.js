/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: '/backend/:path*',
				destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
			},
		];
	},
};

module.exports = nextConfig
