"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  Heart,
  Gift,
  Package,
  ArrowRight,
  Bell,
  ChevronRight,
} from "lucide-react";

const STATS = [
  {
    label: "Total Orders",
    value: "—",
    icon: ShoppingBag,
  },
  {
    label: "Total Spent",
    value: "—",
    icon: Wallet,
  },
  {
    label: "Wishlist Items",
    value: "—",
    icon: Heart,
  },
  {
    label: "Store Credit",
    value: "—",
    icon: Gift,
  },
];

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex min-h-[110px] items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#05714B]">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-[23px] font-bold text-gray-950">
          {value}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function UserOverview() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-gray-100 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#05714B]">
            <Package size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#05714B]">
              Track Order
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              Your latest order activity
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Orders will appear here once the Order Module is connected.
            </p>
          </div>

          <ChevronRight size={19} className="text-gray-400" />
        </div>

        <div className="flex items-start gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#05714B]">
            <Bell size={21} />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#05714B]">
              Account Updates
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              Welcome to SheraDeal
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Manage your orders, profile and delivery information from here.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Recent Orders
          </h2>

          <Link
            href="/user/dashboard/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#05714B] hover:underline"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-[#05714B]">
            <ShoppingBag size={25} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            Your order history
          </h3>

          <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
            Order History API সংযুক্ত হওয়ার পরে এখানে
            তোমার প্রকৃত Orders, Order Status এবং
            Purchase Amount দেখা যাবে।
          </p>

          <Link
            href="/products"
            className="mt-5 rounded-lg bg-[#05714B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#045C3D]"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}