interface OrdersSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

export default function OrdersSkeleton({ count = 3, showHeader = false }: OrdersSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4">
          <div className="space-y-2">
            <div className="h-8 w-60 bg-stone-200/80 rounded-lg" />
            <div className="h-4 w-72 bg-stone-100 rounded-md" />
          </div>
          <div className="h-9 w-36 bg-stone-100 rounded-full" />
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          >
            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="size-20 rounded-2xl bg-stone-200/80 shrink-0" />
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="h-5 w-44 bg-stone-200/80 rounded-md" />
                  <div className="h-5 w-24 bg-stone-100 rounded-full" />
                </div>
                <div className="h-3.5 w-36 bg-stone-100 rounded-md" />
                <div className="space-y-1.5 pt-0.5">
                  <div className="h-3 w-52 bg-stone-100 rounded-md" />
                  <div className="h-3 w-36 bg-stone-100 rounded-md" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
              <div className="space-y-1 text-right">
                <div className="h-3 w-14 bg-stone-100 rounded-md ml-auto" />
                <div className="h-6 w-20 bg-stone-200/80 rounded-md ml-auto" />
              </div>
              <div className="h-9 w-28 bg-stone-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
