"use client";

import Link from "next/link";
import { Package, ShoppingBag, Calendar, Eye } from "lucide-react";
import { formatViews } from "@/lib/utils";
import { AdminStats } from "./types";

interface AdminStatsCardsProps {
  stats?: AdminStats | null;
  isLoading: boolean;
}

export default function AdminStatsCards({ stats, isLoading }: AdminStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs animate-pulse space-y-3"
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {/* 1. Total Items */}
      <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between text-stone-400 mb-3">
          <span className="text-xs uppercase font-medium tracking-wider">Total Items</span>
          <Package size={18} />
        </div>
        <span className="font-serif text-3xl font-medium text-neutral-900">
          {stats?.totalCount ?? 0}
        </span>
        <p className="text-[11px] text-neutral-500 mt-1">Active floral products</p>
      </div>

      {/* 2. Paid Orders */}
      <Link
        href="/dashboard"
        className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all group block cursor-pointer"
      >
        <div className="flex items-center justify-between text-stone-400 mb-3">
          <span className="text-xs uppercase font-medium tracking-wider group-hover:text-neutral-900 transition-colors">
            Paid Orders
          </span>
          <ShoppingBag size={18} className="group-hover:text-neutral-900 transition-colors" />
        </div>
        <span className="font-serif text-3xl font-medium text-neutral-900">
          {stats?.paidOrders ?? 0}
        </span>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-neutral-500">Completed purchases</p>
          <span className="text-[10px] text-stone-400 group-hover:text-neutral-700 transition-colors font-medium">
            View &rarr;
          </span>
        </div>
      </Link>

      {/* 3. New (30 Days) */}
      <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between text-stone-400 mb-3">
          <span className="text-xs uppercase font-medium tracking-wider">New (30 Days)</span>
          <Calendar size={18} />
        </div>
        <span className="font-serif text-3xl font-medium text-neutral-900">
          {stats?.newMonthlyItems ?? 0}
        </span>
        <p className="text-[11px] text-neutral-500 mt-1">Recently created stems</p>
      </div>

      {/* 4. Total Views */}
      <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between text-stone-400 mb-3">
          <span className="text-xs uppercase font-medium tracking-wider">Total Views</span>
          <Eye size={18} />
        </div>
        <span className="font-serif text-3xl font-medium text-neutral-900">
          {formatViews(stats?.totalViews ?? 0)}
        </span>
        <p className="text-[11px] text-neutral-500 mt-1">Client engagement views</p>
      </div>
    </div>
  );
}
