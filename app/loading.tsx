export default function RootLoading() {
  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      {/* Top Header Placeholder */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-stone-200/80 rounded-md" />
        <div className="h-10 w-80 bg-stone-200/80 rounded-xl" />
        <div className="h-4 w-96 bg-stone-100 rounded-md" />
      </div>

      {/* Grid Cards Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs"
          >
            <div className="aspect-[4/5] bg-stone-200/80" />
            <div className="p-5 space-y-3">
              <div className="h-4.5 w-3/4 bg-stone-200/80 rounded-md" />
              <div className="h-3 w-1/2 bg-stone-100 rounded-md" />
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div className="h-5 w-16 bg-stone-200/80 rounded-md" />
                <div className="h-7 w-20 bg-stone-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
