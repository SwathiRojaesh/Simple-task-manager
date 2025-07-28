import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This part is new and important.
  // It makes your environment variables available to the app during the build.
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
  },
};

export default nextConfig;