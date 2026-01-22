import { prisma } from "@/lib/db";
import { FileText, Users, Mail, Eye } from "lucide-react";

export default async function AdminDashboard() {

  const [postsCount, subscribersCount, publishedCount] = await Promise.all([
    prisma.post.count(),
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Posts</p>
              <p className="text-3xl font-bold mt-2">{postsCount}</p>
            </div>
            <FileText className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Published</p>
              <p className="text-3xl font-bold mt-2">{publishedCount}</p>
            </div>
            <Eye className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Subscribers</p>
              <p className="text-3xl font-bold mt-2">{subscribersCount}</p>
            </div>
            <Mail className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <div key={post.id} className="border-b pb-3 last:border-b-0">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                By {post.author.name} • {post.status} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
