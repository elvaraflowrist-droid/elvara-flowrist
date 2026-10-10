import OrdersSkeleton from "@/components/dashboard/OrdersSkeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrdersSkeleton count={4} showHeader={true} />
      </div>
    </main>
  );
}
