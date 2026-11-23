"use client";

import Link from "next/link";
import {
  Package,
  Bell,
  MessageSquare,
  FileText,
  Heart,
  Wallet,
  Coins,
  Gift,
  Handshake,
  UserRound,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const SECTIONS = {
  orders: {
    title: "My Orders",
    description: "View your orders, payment details and delivery status.",
    icon: Package,
  },
  notifications: {
    title: "Notifications",
    description: "Stay updated with your account and purchases.",
    icon: Bell,
  },
  inbox: {
    title: "Inbox",
    description: "Your messages and customer support conversations.",
    icon: MessageSquare,
  },
  quotes: {
    title: "Quotes",
    description: "View and manage your quotation requests.",
    icon: FileText,
  },
  wishlist: {
    title: "Wishlist",
    description: "Products you have saved for later.",
    icon: Heart,
  },
  "store-credit": {
    title: "Store Credit",
    description: "Track available credit and transaction history.",
    icon: Wallet,
  },
  points: {
    title: "Reward Points",
    description: "Your earned points and redemption history.",
    icon: Coins,
  },
  referrals: {
    title: "Refer a Friend",
    description: "Invite friends and view referral activity.",
    icon: Gift,
  },
  affiliate: {
    title: "Affiliate",
    description: "Manage your affiliate information.",
    icon: Handshake,
  },
  profile: {
    title: "My Profile",
    description: "Manage your personal account information.",
    icon: UserRound,
  },
  preferences: {
    title: "Preferences",
    description: "Manage your shopping and communication preferences.",
    icon: SlidersHorizontal,
  },
  addresses: {
    title: "My Addresses",
    description: "Manage your delivery addresses.",
    icon: MapPin,
  },
  security: {
    title: "Account Security",
    description: "Manage your password and account security.",
    icon: ShieldCheck,
  },
};

export default function UserSection({ section }) {
  const item = SECTIONS[section];

  if (!item) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-xl font-bold">Section not found</h1>

        <Link
          href="/user/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#05714B]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const Icon = item.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">
          {item.title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {item.description}
        </p>
      </div>

      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#05714B]">
          <Icon size={30} />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-gray-900">
          {item.title}
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          এই Section-এর Layout তৈরি আছে।
          পরবর্তী ধাপে সংশ্লিষ্ট Laravel API,
          Database এবং প্রয়োজনীয় CRUD Functionality
          সংযুক্ত করা হবে।
        </p>

        <Link
          href="/user/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045C3D]"
        >
          Back to Overview
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}