"use client";

import { Package, MessageSquare, Sliders } from "lucide-react";
import { AdminTab } from "./types";

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  productCount: number;
  testimonialCount: number;
}

export default function AdminTabs({
  activeTab,
  onTabChange,
  productCount,
  testimonialCount,
}: AdminTabsProps) {
  const tabs = [
    {
      id: "products" as AdminTab,
      label: "Floral Offerings",
      icon: Package,
      count: productCount,
    },
    {
      id: "testimonials" as AdminTab,
      label: "Client Testimonials",
      icon: MessageSquare,
      count: testimonialCount,
    },
    {
      id: "settings" as AdminTab,
      label: "Store & Fulfillment Settings",
      icon: Sliders,
    },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 border-b border-stone-200/80 pb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
