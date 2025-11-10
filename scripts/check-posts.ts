import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📄 Checking posts in database...\n');

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (posts.length === 0) {
    console.log('❌ No posts found in database\n');
    return;
  }

  console.log(`Found ${posts.length} post(s):\n`);

  posts.forEach((post, i) => {
    console.log(`${i + 1}. "${post.title}"`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Published At: ${post.publishedAt ? post.publishedAt.toLocaleString() : 'Not published'}`);
    console.log(`   Created: ${post.createdAt.toLocaleString()}`);
    console.log(`   Author: ${post.author.name} (${post.author.email})`);
    console.log('');
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${posts.length}`);
  console.log(`   Published: ${posts.filter(p => p.status === 'PUBLISHED').length}`);
  console.log(`   Draft: ${posts.filter(p => p.status === 'DRAFT').length}`);
  console.log(`   Scheduled: ${posts.filter(p => p.status === 'SCHEDULED').length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
