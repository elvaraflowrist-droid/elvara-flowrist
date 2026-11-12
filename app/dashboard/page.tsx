"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { buildGiftCardPrintTitle, printWithTitle } from "@/lib/utils";
import AuthDialog from "@/components/AuthDialog";
import GiftCardWriter from "@/components/GiftCardWriter";
import OrdersSkeleton from "@/components/dashboard/OrdersSkeleton";
import OrderCard from "@/components/dashboard/OrderCard";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";
import OrdersEmptyState from "@/components/dashboard/OrdersEmptyState";
import NotSignedInCard from "@/components/dashboard/NotSignedInCard";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import {
  OrderFilter,
  PurchaseItem,
  PurchasesApiResponse,
} from "@/components/dashboard/types";

const ORDERS_PER_PAGE = 6;

export default function CustomerDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseItem | null>(null);
  const [printingOrder, setPrintingOrder] = useState<PurchaseItem | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<OrderFilter>("all");

  const isSessionAdmin = Boolean(session?.user?.isAdmin);

  const { data: responseData, isLoading: purchasesLoading } = useQuery<PurchasesApiResponse>({
    queryKey: ["user-purchases", page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ORDERS_PER_PAGE),
        filter,
      });
      const res = await fetch(`/api/user/purchases?${params.toString()}`);
      if (res.status === 401) {
        throw new Error("Please sign in to view your orders");
      }
      if (!res.ok) {
        throw new Error("Failed to load orders");
      }
      return res.json();
    },
    enabled: !!session?.user,
  });

  // Trigger browser print once the off-screen printable card mounts
  useEffect(() => {
    if (!printingOrder) return;
    const recipientName = printingOrder.customerName || printingOrder.accountName || "Patron";
    const printTitle = buildGiftCardPrintTitle(
      recipientName,
      printingOrder.title,
      printingOrder.purchasedAt
    );
    return printWithTitle(printTitle, () => setPrintingOrder(null));
  }, [printingOrder]);

  const purchases = responseData?.purchases || [];
  const userIsAdmin = responseData?.isAdmin ?? isSessionAdmin;
  const totalOrders = responseData?.totalOrders ?? purchases.length;
  const totalPages = responseData?.totalPages ?? 1;

  const handleFilterChange = (nextFilter: OrderFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

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
                {userIsAdmin ? "Customer Delivery Orders" : "Order History"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {userIsAdmin
                  ? "Bespoke floral orders placed by customers awaiting handover or dispatch"
                  : "Past floral arrangements, deliveries, and masterclass admissions"}
              </p>
            </div>

            <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1 self-start sm:self-auto">
              {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {/* Filter Pills */}
          <DashboardFilters
            activeFilter={filter}
            onChangeFilter={handleFilterChange}
          />

          {/* Main Orders List / Loading / Empty */}
          {purchasesLoading ? (
            <OrdersSkeleton count={4} />
          ) : purchases.length === 0 ? (
            <OrdersEmptyState
              userIsAdmin={userIsAdmin}
              hasActiveFilter={filter !== "all"}
              onResetFilter={() => handleFilterChange("all")}
            />
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <OrderCard
                  key={purchase.orderId}
                  purchase={purchase}
                  userIsAdmin={userIsAdmin}
                  onSelect={setSelectedOrder}
                  onPrintGiftCard={setPrintingOrder}
                />
              ))}

              <DashboardPagination
                page={page}
                totalPages={totalPages}
                totalOrders={totalOrders}
                onPageChange={setPage}
              />
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

      {/* Off-screen Printable Gift Card Target for Direct Card Printing */}
      {printingOrder && !selectedOrder && printingOrder.isGift && printingOrder.giftMessage && (
        <div
          aria-hidden="true"
          className="fixed -left-[9999px] top-0 w-[640px] pointer-events-none print:static print:w-full"
        >
          <GiftCardWriter
            selectedCardId={printingOrder.giftCardType || "vintage-botanical"}
            onSelectCardId={() => {}}
            message={printingOrder.giftMessage}
            onChangeMessage={() => {}}
            readOnly={true}
          />
        </div>
      )}
    </main>
  );
}
