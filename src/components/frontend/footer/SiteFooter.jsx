"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ShieldCheck,
  Truck,
  Banknote,
  RotateCcw,
  Star,
  Package,
  Headphones,
  Globe,
  Camera,
  Play,
  Music2,
  MessageCircle,
  Mail,
  MapPin,
  Store,
  Pencil,
  Sparkles,
} from "lucide-react";

import FooterEditor from "./FooterEditor";

const PUBLIC_API = "/api/storefront/footer";
const ADMIN_API = "/api/admin/footer";

const TRUST_ICONS = {
  shield: ShieldCheck,
  truck: Truck,
  wallet: Banknote,
  refresh: RotateCcw,
  star: Star,
  package: Package,
  headphones: Headphones,
};


const SOCIAL_ICONS = {
  facebook: Globe,
  instagram: Camera,
  youtube: Play,
  tiktok: Music2,
  whatsapp: MessageCircle,
  messenger: MessageCircle,
};


function safeUrl(value) {
  if (typeof value !== "string") return null;

  const url = value.trim();

  if (
    url.startsWith("/") ||
    url.startsWith("#") ||
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url)
  ) {
    return url;
  }

  return null;
}

function SocialLink({ item }) {
  const Icon = SOCIAL_ICONS[item.platform] || MessageCircle;
  const href = safeUrl(item.url);

  if (!href) return null;

  const external = /^https?:\/\//i.test(href);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      title={item.platform}
      aria-label={item.platform}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20"
    >
      <Icon size={19} />
    </a>
  );
}

function TrustBadge({ badge }) {
  const Icon = TRUST_ICONS[badge.icon] || ShieldCheck;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
        <Icon size={23} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <h3 className="text-[13px] font-bold text-white sm:text-sm">
          {badge.title}
        </h3>

        {badge.subtitle && (
          <p className="mt-1 text-[11px] leading-5 text-white/65 sm:text-xs">
            {badge.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function FooterLinks({ column }) {
  return (
    <div>
      <h3 className="mb-6 text-[13px] font-bold uppercase tracking-[0.11em] text-white">
        {column.title}
      </h3>

      <div className="flex flex-col items-start gap-3">
        {(column.links || []).map((link, index) => {
          const href = safeUrl(link.url);

          if (!href) return null;

          const external = /^https?:\/\//i.test(href);

          return (
            <a
              key={`${link.label}-${index}`}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-[13px] leading-5 text-white/75 transition hover:text-white hover:underline"
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function FooterContact({ contact = {} }) {
  const phone = contact.hotline || "";
  const email = contact.email || "";
  const storeUrl = safeUrl(contact.store_url);
  const phoneHref = phone.replace(/[^+\d]/g, "");

  return (
    <div>
      <h3 className="mb-6 text-[13px] font-bold uppercase tracking-[0.11em] text-white">
        GET IN TOUCH
      </h3>

      <div className="space-y-6 rounded-[20px] border border-white/10 bg-white/10 p-5 sm:p-6">
        {phone && (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Headphones size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-white/55">
                Hotline
              </p>

              <a
                href={`tel:${phoneHref}`}
                className="mt-1 block break-words text-[15px] font-bold text-white hover:underline"
              >
                {phone}
              </a>
            </div>
          </div>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-start gap-3 text-[12px] leading-5 text-white/75 hover:text-white"
          >
            <Mail size={17} className="mt-0.5 shrink-0" />
            <span className="break-all">{email}</span>
          </a>
        )}

        {contact.address && (
          <div className="flex items-start gap-3 text-[12px] leading-6 text-white/75">
            <MapPin size={17} className="mt-1 shrink-0" />
            <span>{contact.address}</span>
          </div>
        )}

        {storeUrl && (
          <a
            href={storeUrl}
            className="flex items-center gap-3 text-[12px] text-white/80 hover:text-white"
          >
            <Store size={17} className="shrink-0" />
            <span>{contact.store_text || "Visit a store near you"}</span>
          </a>
        )}
      </div>
    </div>
  );
}

function FooterBrand({ footer }) {
  const socials = footer.social_links || [];

  const whatsapp = socials.find(
    (item) => item.platform === "whatsapp"
  );

  const messenger = socials.find(
    (item) => item.platform === "messenger"
  );

  const otherSocials = socials.filter(
    (item) =>
      item.platform !== "whatsapp" &&
      item.platform !== "messenger" &&
      safeUrl(item.url)
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        {footer.logo_url ? (
          <img
            src={footer.logo_url}
            alt={`${footer.brand_name} logo`}
            className="h-[66px] w-[66px] rounded-full border-2 border-white/20 bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-[61px] w-[61px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white text-[35px] font-extrabold text-[#05714B]">
            {footer.brand_name?.charAt(0) || "S"}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-[21px] font-extrabold tracking-tight text-white">
            {footer.brand_name}
          </p>

          {footer.brand_tagline && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/65">
              {footer.brand_tagline}
            </p>
          )}
        </div>
      </div>

      {footer.description && (
        <p className="mt-7 max-w-[310px] text-[13px] leading-7 text-white/80">
          {footer.description}
        </p>
      )}

      {footer.community_title && (
        <div className="mt-6 flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-200" />

          <p className="text-[12px] font-bold uppercase tracking-[0.09em] text-emerald-100">
            {footer.community_title}
          </p>
        </div>
      )}

      {otherSocials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {otherSocials.map((item, index) => (
            <SocialLink key={`${item.platform}-${index}`} item={item} />
          ))}
        </div>
      )}

      {(safeUrl(whatsapp?.url) || safeUrl(messenger?.url)) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {safeUrl(whatsapp?.url) && (
            <a
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#19C96A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#13B85D]"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>
          )}

          {safeUrl(messenger?.url) && (
            <a
              href={messenger.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#05714B] hover:bg-emerald-50"
            >
              <MessageCircle size={17} />
              Messenger
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function FooterBottom({ footer }) {
  return (
    <div className="bg-[#044A33]">
      <div className="mx-auto flex w-[calc(100%-32px)] max-w-[1440px] flex-col gap-5 py-5 text-center text-xs text-white/70 sm:w-[calc(100%-48px)] lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">
            {footer.copyright_text}
          </span>
        </p>

        {(footer.payment_methods || []).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-white/65">We accept</span>

            {footer.payment_methods.map((method, index) => (
              <span
                key={`${method}-${index}`}
                className="rounded-md bg-white px-3 py-2 text-[11px] font-bold text-[#05714B]"
              >
                {method}
              </span>
            ))}
          </div>
        )}

        {footer.bottom_right_text && (
          <span>{footer.bottom_right_text}</span>
        )}
      </div>
    </div>
  );
}

export default function SiteFooter() {
  const [footer, setFooter] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFooter = useCallback(async (signal) => {
    let isAdministrator = false;

    try {
      const authResponse = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });

      if (authResponse.ok) {
        const result = await authResponse.json();

        const user =
          result.user ||
          result.data?.user ||
          result.data;

        const role = String(user?.role || "").toLowerCase();

        isAdministrator = [
          "admin",
          "super_admin",
          "administrator",
        ].includes(role);
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
    }

    const url = isAdministrator ? ADMIN_API : PUBLIC_API;

    let response = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });

    if (isAdministrator && !response.ok) {
      isAdministrator = false;

      response = await fetch(PUBLIC_API, {
        cache: "no-store",
        signal,
      });
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(result.message || "Unable to load footer.");
    }

    return {
      data: result.data,
      isAdministrator,
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await loadFooter(controller.signal);

        if (!controller.signal.aborted) {
          setFooter(result.data);
          setAdmin(result.isAdministrator);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load footer.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [loadFooter, refreshKey]);

  if (loading) {
    return (
      <div className="h-16 bg-[#05714B]">
        <span className="sr-only">Loading footer</span>
      </div>
    );
  }

  if (!footer) {
    return error && admin ? (
      <p className="p-4 text-sm text-red-600">{error}</p>
    ) : null;
  }

  if (!footer.is_active && !admin) return null;

  return (
    <>
      <footer className="relative bg-[#05714B] text-white">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1440px] sm:w-[calc(100%-48px)]">
          {admin && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25"
              >
                <Pencil size={15} />
                Edit Footer
              </button>
            </div>
          )}

          {(footer.trust_badges || []).length > 0 && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-6 border-b border-white/20 py-9 lg:grid-cols-4 lg:gap-x-8">
              {footer.trust_badges.map((badge, index) => (
                <TrustBadge
                  key={`${badge.title}-${index}`}
                  badge={badge}
                />
              ))}
            </div>
          )}

          <div className="grid gap-x-8 gap-y-11 py-12 sm:py-14 md:grid-cols-2 xl:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr_1.35fr]">
            <FooterBrand footer={footer} />

            {(footer.link_columns || []).map((column, index) => (
              <FooterLinks
                key={`${column.title}-${index}`}
                column={column}
              />
            ))}

            <FooterContact contact={footer.contact} />
          </div>
        </div>

        <FooterBottom footer={footer} />
      </footer>

      {admin && editing && (
        <FooterEditor
          key={refreshKey}
          footer={footer}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setRefreshKey((value) => value + 1);
          }}
        />
      )}
    </>
  );
}
