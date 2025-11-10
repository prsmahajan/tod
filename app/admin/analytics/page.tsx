import { prisma } from "@/lib/db";
import Link from "next/link";
import { Eye, TrendingUp, FileText, Users } from "lucide-react";

export default async function AnalyticsPage() {
  // Get top posts by views
  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { views: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      publishedAt: true,
      author: {
        select: { name: true },
      },
    },
  });

  // Get total stats
  const totalPosts = await prisma.post.count({
    where: { status: "PUBLISHED" },
  });

  const totalViews = await prisma.post.aggregate({
    where: { status: "PUBLISHED" },
    _sum: {
      views: true,
    },
  });

  const totalSubscribers = await prisma.subscriber.count({
    where: { isActive: true },
  });

  const stats = [
    {
      icon: FileText,
      label: "Published Posts",
      value: totalPosts.toLocaleString(),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: (totalViews._sum.views || 0).toLocaleString(),
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Users,
      label: "Active Subscribers",
      value: totalSubscribers.toLocaleString(),
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: TrendingUp,
      label: "Avg Views/Post",
      value: totalPosts > 0
        ? Math.round((totalViews._sum.views || 0) / totalPosts).toLocaleString()
        : "0",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">Track your content performance and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${stat.color} w-6 h-6`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Most Popular Posts</h2>
          <p className="text-sm text-gray-600 mt-1">Posts ranked by total views</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topPosts.map((post, index) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-200 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/newsletter/${post.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      target="_blank"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.author.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold">
                      <Eye size={16} className="text-gray-500" />
                      {post.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {topPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No published posts yet
          </div>
        )}
      </div>
    </div>
  );
}
