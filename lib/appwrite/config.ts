import { Client, Account, Databases, Storage } from 'appwrite';

// Client-side Appwrite configuration
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };

// Database and Collection IDs
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
