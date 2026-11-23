
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminAccountMenu from "./AdminAccountMenu";

import {
  LayoutDashboard,
  ChartNoAxesColumn,
  ClipboardList,
  Truck,
  Package,
  Sparkles,
  Bot,
  UsersRound,
  Store,
  UserCog,
  Landmark,
  Percent,
  Handshake,
  Rocket,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShoppingCart,
  Globe,
  Bell,
  Settings,
  ChevronRight,
  Megaphone,
  ImageIcon,
  Menu,
  X,
} from "lucide-react";

const productLinks = [
  { label: "All Products", href: "/admin/products" },
  { label: "Global Variants", href: "/admin/global-variants" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Inventory", href: null },
  { label: "Locations", href: null },
  { label: "Transfers", href: null },
  { label: "Reviews", href: null },
];

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    label: "Analytics",
    icon: ChartNoAxesColumn,
    submenu: true,
  },
  {
    label: "Orders",
    icon: ClipboardList,
    submenu: true,
  },
  {
    label: "Delivery",
    icon: Truck,
    submenu: true,
  },
  {
    label: "Products",
    icon: Package,
    children: productLinks,
  },
  {
    label: "Homepage Sliders",
    icon: ImageIcon,
    href: "/admin/sliders",
  },
  {
    label: "Homepage Advertisements",
    icon: Megaphone,
    href: "/admin/advertisements",
  },
  {
    label: "AI Studio",
    icon: Sparkles,
  },
  {
    label: "Sales Agent",
    icon: Bot,
  },
  {
    label: "Customers",
    icon: UsersRound,
  },
  {
    label: "Vendors",
    icon: Store,
    submenu: true,
  },
  {
    label: "Team",
    icon: UserCog,
  },
  {
    label: "Finance",
    icon: Landmark,
    submenu: true,
  },
  {
    label: "Discounts",
    icon: Percent,
  },
  {
    label: "Affiliates",
    icon: Handshake,
    submenu: true,
  },
  {
    label: "Boosting",
    icon: Rocket,
    submenu: true,
  },
  {
    label: "Content",
    icon: FileText,
    submenu: true,
  },
];

function isActivePath(pathname, href) {
  if (!href) return false;

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ user, children }) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({
    Products: true,
  });

  const productActive = productLinks.some((link) =>
    isActivePath(pathname, link.href)
  );

  const searchTerm = search.trim().toLowerCase();

  const menuItems = navigation.filter((item) => {
    if (!searchTerm) return true;

    const matchesLabel = item.label
      .toLowerCase()
      .includes(searchTerm);

    const matchesChild = item.children?.some((child) =>
      child.label.toLowerCase().includes(searchTerm)
    );

    return matchesLabel || matchesChild;
  });

  function closeMobile() {
    setMobileOpen(false);
  }

  function toggleMenu(label) {
    if (collapsed) {
      setCollapsed(false);
      setExpanded((previous) => ({
        ...previous,
        [label]: true,
      }));
      return;
    }

    setExpanded((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  }

  return (
    <div
      className={`sd-admin-root ${
        collapsed ? "sd-admin-collapsed" : ""
      }`}
    >
      {mobileOpen && (
        <button
          type="button"
          className="sd-admin-overlay"
          onClick={closeMobile}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`sd-admin-sidebar ${
          mobileOpen ? "sd-sidebar-open" : ""
        }`}
      >
        <div className="sd-admin-sidebar-logo">
          <Link
            href="/admin/dashboard"
            className="sd-admin-brand"
            onClick={closeMobile}
          >
            <span className="sd-admin-brand-icon">S</span>

            <span className="sd-admin-brand-name">
              Shera<span>Deal</span>
            </span>
          </Link>

          <button
            type="button"
            className="sd-admin-mobile-close"
            onClick={closeMobile}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <nav
          className="sd-admin-menu"
          aria-label="Admin navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              isActivePath(pathname, item.href) ||
              (item.label === "Products" && productActive);

            const isExpanded = Boolean(
              expanded[item.label] ||
              (searchTerm && item.children)
            );

            const content = (
              <>
                <span className="sd-menu-item-left">
                  <Icon size={19} strokeWidth={1.8} />

                  <span className="sd-menu-label">
                    {item.label}
                  </span>
                </span>

                {(item.children || item.submenu) && (
                  <ChevronRight
                    size={17}
                    className={`sd-menu-chevron ${
                      isExpanded ? "open" : ""
                    }`}
                  />
                )}
              </>
            );

            if (item.children) {
              return (
                <div
                  key={item.label}
                  className="sd-nav-group"
                >
                  <button
                    type="button"
                    className={`sd-admin-menu-item sd-nav-button ${
                      active ? "active" : ""
                    }`}
                    onClick={() => toggleMenu(item.label)}
                    aria-expanded={isExpanded}
                    aria-controls="sd-products-submenu"
                    title="Expand or collapse Products"
                  >
                    {content}
                  </button>

                  {isExpanded && (
                    <div
                      id="sd-products-submenu"
                      className="sd-admin-submenu"
                    >
                      {item.children.map((child) =>
                        child.href ? (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={closeMobile}
                            className={`sd-admin-submenu-item ${
                              isActivePath(pathname, child.href)
                                ? "active"
                                : ""
                            }`}
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <span
                            key={child.label}
                            className="sd-admin-submenu-item disabled"
                            title="Module coming soon"
                          >
                            {child.label}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobile}
                  className={`sd-admin-menu-item ${
                    active ? "active" : ""
                  }`}
                  title={item.label}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="sd-admin-menu-item sd-menu-placeholder"
                title={`${item.label} module coming soon`}
              >
                {content}
              </div>
            );
          })}
        </nav>

        <div className="sd-admin-account-area">
          <AdminAccountMenu />
        </div>
      </aside>

      <div className="sd-admin-main">
        <header className="sd-admin-topbar">
          <div className="sd-admin-top-left">
            <button
              type="button"
              className="sd-admin-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen size={21} />
              ) : (
                <PanelLeftClose size={21} />
              )}
            </button>

            <button
              type="button"
              className="sd-admin-mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="sd-admin-search">
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search menu"
                aria-label="Search menu"
              />
            </div>
          </div>

          <div className="sd-admin-top-center">
            <span className="sd-admin-pos">
              <ShoppingCart size={17} />
              POS
            </span>

            <Link
              href="/"
              className="sd-admin-browse"
            >
              <Globe size={17} />
              Browse Website
            </Link>
          </div>

          <div className="sd-admin-top-right">
            <span
              className="sd-admin-flag"
              title="Bangladesh"
            >
              🇧🇩
            </span>

            <span
              className="sd-admin-icon-btn"
              title="Notifications coming soon"
            >
              <Bell size={20} />
            </span>

            <span
              className="sd-admin-icon-btn"
              title="Settings coming soon"
            >
              <Settings size={20} />
            </span>
          </div>
        </header>

        <main className="sd-admin-content">
          {children}
        </main>
      </div>

      <style>{`
        .sd-admin-root {
          --admin-sidebar-width: 248px;
          --brand-primary: #05714B;
          --brand-light: #E9F4EF;
          --brand-lighter: #F5FBF8;
          --brand-border: #CCE5DA;
          --brand-black: #171717;
          width: 100%;
          min-height: 100vh;
          background: #f5f5f5;
          color: #202124;
          font-family: "Segoe UI", Arial, sans-serif;
          font-size: 14px;
        }

        .sd-admin-root *,
        .sd-admin-root *::before,
        .sd-admin-root *::after {
          box-sizing: border-box;
        }

        .sd-admin-root button,
        .sd-admin-root input {
          font-family: inherit;
        }

        .sd-admin-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: var(--admin-sidebar-width);
          display: flex;
          flex-direction: column;
          background: #fff;
          border-right: 1px solid #e8e8e8;
          z-index: 100;
          transition: width .2s, transform .2s;
        }

        .sd-admin-sidebar-logo {
          height: 65px;
          min-height: 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .sd-admin-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          overflow: hidden;
          white-space: nowrap;
          text-decoration: none;
        }

        .sd-admin-brand-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-primary);
          color: #fff;
          font-size: 24px;
          font-weight: 800;
          border-radius: 8px 3px 8px 3px;
        }

        .sd-admin-brand-name {
          color: var(--brand-black);
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .sd-admin-brand-name span {
          color: var(--brand-primary);
        }

        .sd-admin-menu {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 10px 18px 20px;
          scrollbar-width: thin;
        }

        .sd-admin-menu-item {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 0 12px;
          margin-bottom: 2px;
          color: #505050;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 22px;
          transition: background .15s, color .15s;
        }

        .sd-admin-menu-item:hover {
          background: #f6f6f6;
        }

        .sd-admin-menu-item.active {
          background: var(--brand-light);
          color: var(--brand-primary);
          font-weight: 650;
        }

        .sd-menu-placeholder {
          cursor: default;
        }

        .sd-nav-button {
          background: transparent;
          border: 0;
          text-align: left;
          cursor: pointer;
        }

        .sd-menu-item-left {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .sd-menu-item-left svg {
          flex-shrink: 0;
        }

        .sd-menu-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sd-menu-chevron {
          flex-shrink: 0;
          color: #909090;
          transition: transform .2s;
        }

        .sd-menu-chevron.open {
          transform: rotate(90deg);
          color: var(--brand-primary);
        }

        .sd-admin-submenu {
          margin: 3px 0 9px 18px;
          padding-left: 13px;
          border-left: 1px solid #e6e6e6;
        }

        .sd-admin-submenu-item {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          min-height: 32px;
          padding: 4px 10px;
          margin-bottom: 1px;
          border-radius: 18px;
          color: #707070;
          font-size: 12px;
          text-decoration: none;
        }

        .sd-admin-submenu-item::before {
          content: "";
          position: absolute;
          width: 10px;
          height: 1px;
          background: #e6e6e6;
          top: 50%;
          left: -13px;
        }

        .sd-admin-submenu-item.active {
          background: var(--brand-light);
          color: var(--brand-primary);
          font-weight: 650;
        }

        a.sd-admin-submenu-item:hover {
          background: var(--brand-light);
          color: var(--brand-primary);
        }

        .sd-admin-submenu-item.disabled {
          cursor: default;
        }

        .sd-admin-account-area {
          flex-shrink: 0;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          background: #fff;
        }

        .sd-admin-main {
          min-height: 100vh;
          min-width: 0;
          margin-left: var(--admin-sidebar-width);
          transition: margin-left .2s;
        }

        .sd-admin-topbar {
          height: 63px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 24px;
          background: #f5f5f5;
          border-bottom: 1px solid #e7e7e7;
        }

        .sd-admin-top-left,
        .sd-admin-top-center,
        .sd-admin-top-right {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .sd-admin-top-center {
          gap: 9px;
        }

        .sd-admin-collapse-btn,
        .sd-admin-mobile-menu,
        .sd-admin-icon-btn {
          width: 30px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: 0;
          color: #555;
        }

        .sd-admin-collapse-btn,
        .sd-admin-mobile-menu {
          cursor: pointer;
        }

        .sd-admin-mobile-menu,
        .sd-admin-mobile-close {
          display: none;
        }

        .sd-admin-search {
          width: 135px;
          height: 35px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          background: #f8f8f8;
          border: 1px solid #e5e5e5;
          border-radius: 22px;
        }

        .sd-admin-search:focus-within {
          border-color: var(--brand-border);
        }

        .sd-admin-search svg {
          flex-shrink: 0;
          color: #777;
        }

        .sd-admin-search input {
          width: 100%;
          min-width: 0;
          background: transparent;
          border: 0;
          outline: 0;
          font-size: 12px;
          color: #333;
        }

        .sd-admin-search input::placeholder {
          color: #999;
        }

        .sd-admin-pos,
        .sd-admin-browse {
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 13px;
          background: #fff;
          border: 1px solid #e4e4e4;
          border-radius: 20px;
          font-size: 13px;
          color: #292929;
          white-space: nowrap;
          text-decoration: none;
        }

        .sd-admin-pos {
          color: var(--brand-primary);
          border-color: var(--brand-border);
          background: var(--brand-lighter);
        }

        .sd-admin-browse:hover {
          border-color: var(--brand-primary);
        }

        .sd-admin-flag {
          font-size: 19px;
        }

        .sd-admin-content {
          width: 100%;
          padding: 24px;
        }

        .sd-admin-collapsed {
          --admin-sidebar-width: 76px;
        }

        .sd-admin-collapsed .sd-admin-brand-name,
        .sd-admin-collapsed .sd-menu-label,
        .sd-admin-collapsed .sd-menu-chevron,
        .sd-admin-collapsed .sd-admin-submenu {
          display: none;
        }

        .sd-admin-collapsed .sd-admin-menu {
          padding-left: 13px;
          padding-right: 13px;
        }

        .sd-admin-collapsed .sd-admin-menu-item {
          justify-content: center;
          padding: 0;
        }

        .sd-admin-collapsed .sd-menu-item-left {
          gap: 0;
        }

        .sd-admin-collapsed .sd-admin-account-area {
          padding: 12px 8px;
        }

        .sd-admin-overlay {
          display: none;
        }

        @media (max-width: 1100px) {
          .sd-admin-top-center {
            display: none;
          }
        }

        @media (max-width: 900px) {
          .sd-admin-sidebar {
            width: 248px;
            transform: translateX(-100%);
          }

          .sd-admin-sidebar.sd-sidebar-open {
            transform: translateX(0);
          }

          .sd-admin-main {
            margin-left: 0;
          }

          .sd-admin-collapse-btn {
            display: none;
          }

          .sd-admin-mobile-menu,
          .sd-admin-mobile-close {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .sd-admin-overlay {
            position: fixed;
            inset: 0;
            display: block;
            background: rgba(0, 0, 0, .4);
            z-index: 90;
            border: 0;
          }

          .sd-admin-collapsed .sd-admin-brand-name,
          .sd-admin-collapsed .sd-menu-label,
          .sd-admin-collapsed .sd-menu-chevron {
            display: initial;
          }

          .sd-admin-collapsed .sd-admin-submenu {
            display: block;
          }

          .sd-admin-collapsed .sd-admin-menu-item {
            justify-content: space-between;
            padding: 0 12px;
          }

          .sd-admin-collapsed .sd-menu-item-left {
            gap: 13px;
          }
        }

        @media (max-width: 600px) {
          .sd-admin-topbar {
            padding: 0 15px;
          }

          .sd-admin-content {
            padding: 16px;
          }

          .sd-admin-search {
            width: 115px;
          }

          .sd-admin-flag {
            display: none;
          }

          .sd-admin-top-right {
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}
