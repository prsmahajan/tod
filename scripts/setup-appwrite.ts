/**
 * Appwrite Setup Script
 * Run this once to create all required collections and storage buckets
 *
 * Usage: npx ts-node scripts/setup-appwrite.ts
 */

import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'opendraft';

// Collection definitions
const collections = [
  {
    id: 'transactions',
    name: 'Transactions',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userEmail', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'integer', required: true, min: 0, max: 10000000 },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'razorpayPaymentId', type: 'string', size: 255, required: true },
      { key: 'razorpayOrderId', type: 'string', size: 255, required: false },
      { key: 'razorpaySubscriptionId', type: 'string', size: 255, required: false },
      { key: 'planType', type: 'string', size: 50, required: true },
      { key: 'billingCycle', type: 'string', size: 50, required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
    ],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userEmail', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'razorpaySubscriptionId', type: 'string', size: 255, required: true },
      { key: 'planId', type: 'string', size: 255, required: true },
      { key: 'planType', type: 'string', size: 50, required: true },
      { key: 'billingCycle', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'integer', required: true, min: 0, max: 10000000 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'currentPeriodStart', type: 'string', size: 255, required: false },
      { key: 'currentPeriodEnd', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'razorpaySubId_idx', type: 'key', attributes: ['razorpaySubscriptionId'] },
    ],
  },
  {
    id: 'user_photos',
    name: 'User Photos',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userEmail', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'imageIds', type: 'string', size: 255, required: true, array: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'feedDate', type: 'string', size: 255, required: true },
      { key: 'animalCount', type: 'integer', required: false, min: 0, max: 1000 },
      { key: 'approvedAt', type: 'string', size: 255, required: false },
      { key: 'approvedBy', type: 'string', size: 255, required: false },
      { key: 'rejectionReason', type: 'string', size: 500, required: false },
      { key: 'featured', type: 'boolean', required: true },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'featured_idx', type: 'key', attributes: ['featured'] },
    ],
  },
  {
    id: 'animals_fed',
    name: 'Animals Fed',
    attributes: [
      { key: 'photoId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'feedDate', type: 'string', size: 255, required: true },
      { key: 'animalCount', type: 'integer', required: false, min: 0, max: 1000 },
      { key: 'location', type: 'string', size: 255, required: true },
      { key: 'imageUrl', type: 'string', size: 1000, required: true },
      { key: 'featured', type: 'boolean', required: true },
    ],
    indexes: [
      { key: 'featured_idx', type: 'key', attributes: ['featured'] },
      { key: 'feedDate_idx', type: 'key', attributes: ['feedDate'] },
    ],
  },
  {
    id: 'articles',
    name: 'Articles',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 100000, required: true },
      { key: 'excerpt', type: 'string', size: 500, required: true },
      { key: 'coverImageId', type: 'string', size: 255, required: false },
      { key: 'authorId', type: 'string', size: 255, required: true },
      { key: 'authorName', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'publishedAt', type: 'string', size: 255, required: false },
      { key: 'tags', type: 'string', size: 100, required: false, array: true },
      { key: 'views', type: 'integer', required: true, min: 0, max: 100000000 },
    ],
    indexes: [
      { key: 'slug_idx', type: 'unique', attributes: ['slug'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
    ],
  },
];

// Storage buckets
const buckets = [
  {
    id: 'user-uploads',
    name: 'User Uploads',
    maxFileSize: 10485760, // 10MB
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  {
    id: 'article-images',
    name: 'Article Images',
    maxFileSize: 10485760,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  {
    id: 'marquee-images',
    name: 'Marquee Images',
    maxFileSize: 10485760,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollection(collection: typeof collections[0]) {
  console.log(`\n📁 Creating collection: ${collection.name}...`);

  try {
    // Create collection with permissions
    await databases.createCollection(
      DATABASE_ID,
      collection.id,
      collection.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log(`   ✓ Collection "${collection.name}" created`);

    // Create attributes
    for (const attr of collection.attributes) {
      try {
        if (attr.type === 'string') {
          if (attr.array) {
            await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.size,
              attr.required,
              undefined,
              true // array
            );
          } else {
            await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.size,
              attr.required
            );
          }
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.required,
            attr.min,
            attr.max
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.required
          );
        }
        console.log(`   ✓ Attribute "${attr.key}" created`);
        await sleep(500); // Wait for attribute to be ready
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`   ⚠ Attribute "${attr.key}" already exists`);
        } else {
          console.error(`   ✗ Failed to create attribute "${attr.key}":`, error.message);
        }
      }
    }

    // Wait for all attributes to be ready before creating indexes
    console.log(`   ⏳ Waiting for attributes to be ready...`);
    await sleep(3000);

    // Create indexes
    if (collection.indexes) {
      for (const index of collection.indexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            collection.id,
            index.key,
            index.type as any,
            index.attributes
          );
          console.log(`   ✓ Index "${index.key}" created`);
          await sleep(500);
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`   ⚠ Index "${index.key}" already exists`);
          } else {
            console.error(`   ✗ Failed to create index "${index.key}":`, error.message);
          }
        }
      }
    }

  } catch (error: any) {
    if (error.code === 409) {
      console.log(`   ⚠ Collection "${collection.name}" already exists`);
    } else {
      console.error(`   ✗ Failed to create collection "${collection.name}":`, error.message);
      throw error;
    }
  }
}

async function createBucket(bucket: typeof buckets[0]) {
  console.log(`\n📦 Creating bucket: ${bucket.name}...`);

  try {
    await storage.createBucket(
      bucket.id,
      bucket.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // fileSecurity
      true,  // enabled
      bucket.maxFileSize,
      bucket.allowedExtensions
    );
    console.log(`   ✓ Bucket "${bucket.name}" created`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`   ⚠ Bucket "${bucket.name}" already exists`);
    } else {
      console.error(`   ✗ Failed to create bucket "${bucket.name}":`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting Appwrite Setup...\n');
  console.log('Configuration:');
  console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`   Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`   Database ID: ${DATABASE_ID}`);

  // Verify connection
  try {
    const db = await databases.get(DATABASE_ID);
    console.log(`\n✓ Connected to database: ${db.name}`);
  } catch (error: any) {
    console.error('\n✗ Failed to connect to database:', error.message);
    console.log('\nMake sure your .env.local has the correct Appwrite credentials.');
    process.exit(1);
  }

  // Create collections
  console.log('\n═══════════════════════════════════════');
  console.log('Creating Collections...');
  console.log('═══════════════════════════════════════');

  for (const collection of collections) {
    await createCollection(collection);
  }

  // Create storage buckets
  console.log('\n═══════════════════════════════════════');
  console.log('Creating Storage Buckets...');
  console.log('═══════════════════════════════════════');

  for (const bucket of buckets) {
    await createBucket(bucket);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Appwrite Setup Complete!');
  console.log('═══════════════════════════════════════');
  console.log('\nYour database is now ready to use.');
  console.log('You can start your app with: npm run dev');
}

main().catch(console.error);
