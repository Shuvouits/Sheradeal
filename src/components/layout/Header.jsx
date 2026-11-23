"use client";

import { useEffect, useState } from "react";
import BrandMegaMenu from "@/components/frontend/navigation/BrandMegaMenu";
import Link from "next/link";
import {
  Search,
  UserRound,
  Heart,
  LayoutGrid,
  House,
  Package,
  BadgeCheck,
  Sparkles,
  Baby,
  Crown,
  Gift,
  Headset,
  ChevronDown,
  Menu,
  X,
  Flame,
  Zap,
  Tags,
  ChevronRight,
} from "lucide-react";

import CategoryMegaMenu from "@/components/frontend/navigation/CategoryMegaMenu";
import HeaderCartButton from "@/components/frontend/cart/HeaderCartButton";

import "./Header.css";

const navigation = [
  { label: "Home", href: "/", icon: House },
  { label: "Products", href: "/products", icon: Package },
  { label: "Brands", href: "/brands", icon: BadgeCheck },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "New Arrivals", href: "/new-arrivals", icon: Sparkles },
  { label: "Offers", href: "/offers", icon: Tags },
  { label: "Best Sellers", href: "/best-sellers", icon: Flame },
];

function isAdmin(user) {
  if (!user) return false;

  if (user.is_admin === true || user.is_super_admin === true) {
    return true;
  }

  const adminRoles = ["admin", "super_admin", "super-admin"];
  const role = user.role;

  if (typeof role === "string") {
    return adminRoles.includes(role.toLowerCase());
  }

  if (role && typeof role.name === "string") {
    return adminRoles.includes(role.name.toLowerCase());
  }

  if (Array.isArray(user.roles)) {
    return user.roles.some((item) => {
      const name = typeof item === "string" ? item : item?.name;

      return adminRoles.includes(
        String(name || "").toLowerCase()
      );
    });
  }

  return false;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        const result = await response.json().catch(() => ({}));

        const account =
          result.user ||
          result.data?.user ||
          result.data;

        if (
          response.ok &&
          result.success === true &&
          account?.id
        ) {
          setUser(account);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  const loggedIn = Boolean(user);

  const accountHref = !loggedIn
    ? "/auth/login"
    : isAdmin(user)
      ? "/admin/dashboard"
      : "/user/dashboard";

  const accountName =
    user?.name ||
    user?.full_name ||
    user?.first_name ||
    "Customer";

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    window.location.href =
      `/products?search=${encodeURIComponent(query)}`;
  }

  return (
    <header className="sd-header">
      {/* Announcement Bar */}
      <div className="sd-announcement">
        <div className="sd-announcement-track">
          <span>🎁 Free Gift on Selected Orders</span>
          <span>✦ Discover Your Favorite Products at SheraDeal</span>
          <span>🚚 Fast & Reliable Delivery Across Bangladesh</span>
          <span>🎁 Free Gift on Selected Orders</span>
          <span>✦ Discover Your Favorite Products at SheraDeal</span>
          <span>🚚 Fast & Reliable Delivery Across Bangladesh</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="sd-main-header">
        <div className="sd-container sd-main-inner">
          {/* Logo */}
          <Link href="/" className="sd-logo">
            <span className="sd-logo-symbol">S</span>

            <span className="sd-logo-content">
              <strong>
                Shera<span>Deal</span>
              </strong>

              <small>BANGLADESH</small>
            </span>
          </Link>

          {/* Desktop Search */}
          <form className="sd-search" onSubmit={handleSearch}>
            <Search size={21} strokeWidth={1.8} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search products, brands or categories..."
              aria-label="Search products"
            />

            <button type="submit">
              Search
            </button>
          </form>

          {/* Header Actions */}
          <div className="sd-header-actions">
            {/* My Account */}
            <Link
              href={accountHref}
              className="sd-account"
              aria-label={
                authLoading
                  ? "Checking account"
                  : loggedIn
                    ? `My account: ${accountName}`
                    : "Sign in to your account"
              }
              onClick={(event) => {
                if (authLoading) {
                  event.preventDefault();
                }
              }}
            >
              <span className="sd-action-icon">
                <UserRound
                  size={22}
                  strokeWidth={1.7}
                />
              </span>

              <span className="sd-account-text">
                <small>
                  {authLoading
                    ? "Checking account..."
                    : loggedIn
                      ? `Hello, ${accountName}`
                      : "Hello, sign in"}
                </small>

                <strong>
                  {authLoading
                    ? "Your account"
                    : loggedIn
                      ? "My Account"
                      : "Your account"}
                </strong>
              </span>
            </Link>

            {/* Wishlist: Existing Functionality */}
            <Link
              href="/wishlist"
              className="sd-round-action"
              aria-label="Wishlist"
            >
              <Heart
                size={24}
                strokeWidth={1.8}
              />

              <span className="sd-action-count">
                0
              </span>
            </Link>

            {/* Cart: Dynamic Count + Drawer */}
            <div className="sd-cart-action">
              <HeaderCartButton />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="sd-mobile-toggle"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="sd-navigation">
        <div className="sd-container sd-nav-inner">
          <CategoryMegaMenu />

          <nav
            className="sd-nav-links"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="sd-nav-link sd-nav-active"
            >
              <House size={18} />
              <span>Home</span>
            </Link>

            <Link
              href="/products"
              className="sd-nav-link"
            >
              <Package size={18} />
              <span>Products</span>
            </Link>

          <BrandMegaMenu />

            <Link
              href="/skin-care"
              className="sd-nav-link"
            >
              <Sparkles size={18} />
              <span>Skin Care</span>
              <ChevronDown size={14} />
            </Link>

            <Link
              href="/baby-care"
              className="sd-nav-link sd-baby-link"
            >
              <Baby size={18} />
              <span>Baby Care</span>
            </Link>

            <Link
              href="/premium"
              className="sd-nav-link sd-premium-link"
            >
              <Crown size={19} />
              <span>Premium</span>
            </Link>

            <Link
              href="/combo"
              className="sd-nav-link"
            >
              <Gift size={18} />
              <span>Combo</span>
            </Link>

            <Link
              href="/offers"
              className="sd-nav-link"
            >
              <Tags size={18} />
              <span>Offers</span>
            </Link>

            <Link
              href="/new-arrivals"
              className="sd-nav-link"
            >
              <Zap size={18} />
              <span>New Arrival</span>
            </Link>

            <Link
              href="/best-sellers"
              className="sd-nav-link"
            >
              <Flame size={18} />
              <span>Best Seller</span>
            </Link>
          </nav>

          {/* Hotline */}
          <a
            href="tel:+8801300000000"
            className="sd-hotline"
          >
            <span className="sd-hotline-icon">
              <Headset size={21} />
            </span>

            <span>
              <small>HOTLINE</small>
              <strong>+880 1300-000000</strong>
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sd-mobile-search">
        <form onSubmit={handleSearch}>
          <Search size={19} />

          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          className="sd-mobile-menu"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>
                  <Icon size={19} />
                  {item.label}
                </span>

                <ChevronRight size={17} />
              </Link>
            );
          })}

          <Link
            href={accountHref}
            onClick={(event) => {
              if (authLoading) {
                event.preventDefault();
                return;
              }

              setMobileMenuOpen(false);
            }}
          >
            <span>
              <UserRound size={19} />
              {loggedIn ? "My Account" : "Login / Register"}
            </span>

            <ChevronRight size={17} />
          </Link>
        </nav>
      )}
    </header>
  );
}
