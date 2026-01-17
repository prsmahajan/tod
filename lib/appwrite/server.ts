import { Client, Databases, Storage, Users, ID, Query } from 'node-appwrite';

// Server-side Appwrite configuration (for API routes)
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);

export { client, ID, Query };

// Database and Collection IDs (server-side)
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'opendraft';

export const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  SUBSCRIPTIONS: 'subscriptions',
  USER_PHOTOS: 'user_photos',
  ARTICLES: 'articles',
  ANIMALS_FED: 'animals_fed',
} as const;

export const BUCKETS = {
  USER_UPLOADS: 'user-uploads',
  ARTICLE_IMAGES: 'article-images',
  MARQUEE_IMAGES: 'marquee-images',
} as const;
