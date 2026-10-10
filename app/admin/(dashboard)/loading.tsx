export default function AdminLoading() {
  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-stone-200/80 rounded-lg" />
            <div className="h-4 w-80 bg-stone-100 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-stone-200/80 rounded-full" />
        </div>

        {/* 4 Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 bg-stone-200/80 rounded-md" />
                <div className="size-5 rounded-md bg-stone-200/80" />
              </div>
              <div className="h-9 w-16 bg-stone-200/80 rounded-lg" />
              <div className="h-3 w-32 bg-stone-100 rounded-md" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-2 mb-6 border-b border-stone-200/80 pb-4">
          <div className="h-8 w-36 bg-stone-200/80 rounded-full" />
          <div className="h-8 w-40 bg-stone-100 rounded-full" />
          <div className="h-8 w-52 bg-stone-100 rounded-full" />
        </div>

        {/* Products Table Skeleton */}
        <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="h-6 w-48 bg-stone-200/80 rounded-md" />
            <div className="h-4 w-28 bg-stone-100 rounded-md" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Published</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-stone-200 shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="h-4 w-40 bg-stone-200 rounded-md" />
                          <div className="h-3 w-28 bg-stone-100 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-20 bg-stone-100 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-stone-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-12 bg-stone-100 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-20 bg-stone-100 rounded-md" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-7 w-12 rounded-full bg-stone-100" />
                        <div className="h-7 w-14 rounded-full bg-stone-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
