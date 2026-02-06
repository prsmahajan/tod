import { prisma } from "@/lib/db";
import { FileText, Eye, Mail, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {

  const [postsCount, subscribersCount, publishedCount, draftCount] = await Promise.all([
    prisma.post.count(),
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });

  const stats = [
    {
      label: "Total Posts",
      value: postsCount,
      icon: FileText,
      href: "/admin/posts",
      change: null,
    },
    {
      label: "Published",
      value: publishedCount,
      icon: Eye,
      href: "/admin/posts",
      change: null,
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: Clock,
      href: "/admin/posts",
      change: null,
    },
    {
      label: "Subscribers",
      value: subscribersCount,
      icon: Mail,
      href: "/admin/subscribers",
      change: null,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "DRAFT":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "PENDING":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-[var(--cms-border)]/50 text-[var(--cms-text-muted)]";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--cms-text-primary, #fff)" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--cms-text-muted, #666)" }}>
          Overview of your content and audience
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--cms-card-bg, #1a1a1a)",
                borderColor: "var(--cms-border, #2a2a2a)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--cms-border, #2a2a2a)" }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color: "var(--cms-text-secondary, #a1a1a1)" }} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--cms-text-muted, #666)" }}
                />
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--cms-text-primary, #fff)" }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1 font-medium uppercase tracking-wider" style={{ color: "var(--cms-text-muted, #666)" }}>
                {stat.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--cms-card-bg, #1a1a1a)",
            borderColor: "var(--cms-border, #2a2a2a)",
            borderWidth: "1px",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottomColor: "var(--cms-border, #2a2a2a)", borderBottomWidth: "1px" }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cms-text-muted, #666)" }}>
              Recent Posts
            </h2>
            <Link
              href="/admin/posts"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--cms-text-secondary, #a1a1a1)" }}
            >
              View all
            </Link>
          </div>

          <div>
            {recentPosts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FileText size={32} className="mx-auto mb-3" style={{ color: "var(--cms-text-muted, #666)" }} />
                <p className="text-sm" style={{ color: "var(--cms-text-muted, #666)" }}>
                  No posts yet. Create your first post.
                </p>
                <Link
                  href="/admin/posts/new"
                  className="inline-block mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: "var(--cms-border, #2a2a2a)",
                    color: "var(--cms-text-primary, #fff)",
                  }}
                >
                  New Post
                </Link>
              </div>
            ) : (
              recentPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between px-5 py-4 transition-colors group hover:bg-[#222]"
                  style={{
                    borderBottomColor: index < recentPosts.length - 1 ? "var(--cms-border, #2a2a2a)" : "transparent",
                    borderBottomWidth: index < recentPosts.length - 1 ? "1px" : "0",
                  }}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-sm font-medium truncate" style={{ color: "var(--cms-text-primary, #fff)" }}>
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: "var(--cms-text-muted, #666)" }}>
                        {post.author.name}
                      </span>
                      <span style={{ color: "var(--cms-text-muted, #444)" }}>·</span>
                      <span className="text-xs" style={{ color: "var(--cms-text-muted, #666)" }}>
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusStyle(post.status)}`}>
                    {post.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--cms-card-bg, #1a1a1a)",
            borderColor: "var(--cms-border, #2a2a2a)",
            borderWidth: "1px",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottomColor: "var(--cms-border, #2a2a2a)", borderBottomWidth: "1px" }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cms-text-muted, #666)" }}>
              Quick Actions
            </h2>
          </div>

          <div className="p-3 space-y-1">
            {[
              { label: "New Post", href: "/admin/posts/new", icon: FileText, desc: "Create article" },
              { label: "Send Newsletter", href: "/admin/send-newsletter", icon: Mail, desc: "Email subscribers" },
              { label: "View Analytics", href: "/admin/analytics", icon: TrendingUp, desc: "Traffic & insights" },
              { label: "Manage Users", href: "/admin/users", icon: Eye, desc: "Roles & access" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group hover:bg-[#222]"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--cms-border, #2a2a2a)" }}
                  >
                    <Icon size={15} strokeWidth={1.5} style={{ color: "var(--cms-text-secondary, #a1a1a1)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--cms-text-primary, #fff)" }}>
                      {action.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--cms-text-muted, #666)" }}>
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: "var(--cms-text-muted, #666)" }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Summary Strip */}
          <div
            className="mx-3 mb-3 p-4 rounded-lg"
            style={{ backgroundColor: "var(--cms-border, #2a2a2a)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--cms-text-muted, #666)" }}>
              At a Glance
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--cms-text-primary, #fff)" }}>
                  {Math.round((publishedCount / Math.max(postsCount, 1)) * 100)}%
                </p>
                <p className="text-[10px]" style={{ color: "var(--cms-text-muted, #666)" }}>
                  Publish rate
                </p>
              </div>
              <div
                className="w-px h-8"
                style={{ backgroundColor: "var(--cms-border-light, #333)" }}
              />
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--cms-text-primary, #fff)" }}>
                  {subscribersCount}
                </p>
                <p className="text-[10px]" style={{ color: "var(--cms-text-muted, #666)" }}>
                  Active readers
                </p>
              </div>
              <div
                className="w-px h-8"
                style={{ backgroundColor: "var(--cms-border-light, #333)" }}
              />
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--cms-text-primary, #fff)" }}>
                  {draftCount}
                </p>
                <p className="text-[10px]" style={{ color: "var(--cms-text-muted, #666)" }}>
                  In drafts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
