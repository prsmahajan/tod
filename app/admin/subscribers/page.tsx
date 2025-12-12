import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  if (!process.env.DATABASE_URL) {
    return <div>Database connection not configured.</div>;
  }
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscribers</h1>
        <p className="text-gray-600 mt-2">
          Total: {subscribers.length} | Active: {activeCount}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {subscribers.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No subscribers yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{sub.email}</td>
                  <td className="p-4 text-gray-600">{sub.name || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sub.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {sub.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
