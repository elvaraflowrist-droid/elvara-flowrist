"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import AuthDialog from "@/components/AuthDialog";
import OrdersSkeleton from "@/components/dashboard/OrdersSkeleton";
import OrderCard from "@/components/dashboard/OrderCard";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";
import OrdersEmptyState from "@/components/dashboard/OrdersEmptyState";
import NotSignedInCard from "@/components/dashboard/NotSignedInCard";
import { PurchaseItem, PurchasesApiResponse } from "@/components/dashboard/types";

export default function CustomerDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseItem | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<"all" | "mine">("all");

  const isSessionAdmin = Boolean(session?.user?.isAdmin);

  // Fetch purchases from GET /api/user/purchases
  const { data: responseData, isLoading: purchasesLoading } = useQuery<PurchasesApiResponse>({
    queryKey: ["user-purchases", adminViewMode],
    queryFn: async () => {
      const res = await fetch(`/api/user/purchases?view=${adminViewMode}`);
      if (res.status === 401) {
        throw new Error("Please sign in to view your orders");
      }
      return res.json();
    },
    enabled: !!session?.user,
  });

  const purchases = responseData?.purchases || [];
  const userIsAdmin = responseData?.isAdmin ?? isSessionAdmin;

  // 1. Session Loading Skeleton State
  if (sessionLoading) {
    return (
      <main className="min-h-screen pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <OrdersSkeleton count={3} showHeader={true} />
        </div>
      </main>
    );
  }

  // 2. Unauthenticated State
  if (!session?.user) {
    return (
      <>
        <NotSignedInCard onOpenAuth={() => setAuthOpen(true)} />
        <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  // 3. Authenticated Dashboard State
  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-2xl text-neutral-900">
                {userIsAdmin && adminViewMode === "all"
                  ? "Customer Delivery Orders"
                  : "Order History"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {userIsAdmin && adminViewMode === "all"
                  ? "Bespoke floral orders placed by customers awaiting handover or dispatch"
                  : "Past floral arrangements, deliveries, and masterclass admissions"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {userIsAdmin && (
                <div className="flex items-center rounded-full bg-stone-100 p-1 text-xs">
                  <button
                    onClick={() => setAdminViewMode("all")}
                    className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      adminViewMode === "all"
                        ? "bg-white text-neutral-900 shadow-2xs"
                        : "text-stone-600 hover:text-neutral-900"
                    }`}
                  >
                    All Customer Orders
                  </button>
                  <button
                    onClick={() => setAdminViewMode("mine")}
                    className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      adminViewMode === "mine"
                        ? "bg-white text-neutral-900 shadow-2xs"
                        : "text-stone-600 hover:text-neutral-900"
                    }`}
                  >
                    My Personal Orders
                  </button>
                </div>
              )}

              <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1">
                {purchases.length} {purchases.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>

          {/* Main Orders List / Loading / Empty */}
          {purchasesLoading ? (
            <OrdersSkeleton count={4} />
          ) : purchases.length === 0 ? (
            <OrdersEmptyState
              userIsAdmin={userIsAdmin}
              adminViewMode={adminViewMode}
            />
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <OrderCard
                  key={purchase.orderId}
                  purchase={purchase}
                  userIsAdmin={userIsAdmin}
                  adminViewMode={adminViewMode}
                  onSelect={setSelectedOrder}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details & Dispatch Slip Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        userIsAdmin={userIsAdmin}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}
