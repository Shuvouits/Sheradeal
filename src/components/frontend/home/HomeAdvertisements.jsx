"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const API_URL = "/api/storefront/advertisements";

function getImageUrl(value) {
  if (!value || typeof value !== "string") return "";

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return "";

  const backendUrl = (
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  if (value.startsWith("/")) {
    return `${backendUrl}${value}`;
  }

  const path = value.startsWith("storage/")
    ? value
    : `storage/${value}`;

  return `${backendUrl}/${path}`;
}

function getValidLink(value) {
  if (!value || typeof value !== "string") return "";

  const link = value.trim();

  if (link.startsWith("/") && !link.startsWith("//")) {
    return link;
  }

  if (/^https?:\/\//i.test(link)) {
    return link;
  }

  return "";
}

function AdvertisementButton({ href, children, primary = false }) {
  const link = getValidLink(href);

  if (!link) return null;

  const external = /^https?:\/\//i.test(link);

  return (
    <a
      href={link}
      className={`sd-ad-button ${
        primary ? "sd-ad-primary" : "sd-ad-secondary"
      }`}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}

      {primary && <ArrowUpRight size={15} />}
    </a>
  );
}

function AdvertisementCard({ advertisement }) {
  const [imageError, setImageError] = useState(false);

  const desktopImage = getImageUrl(
    advertisement.desktop_image_url ||
    advertisement.desktop_image
  );

  const mobileImage = getImageUrl(
    advertisement.mobile_image_url ||
    advertisement.mobile_image
  );

  const imageUrl = desktopImage || mobileImage;

  const hasImage = Boolean(imageUrl) && !imageError;

  const backgroundColor =
    /^#[0-9a-f]{6}$/i.test(advertisement.background_color || "")
      ? advertisement.background_color
      : "#05714B";

  const textColor =
    /^#[0-9a-f]{6}$/i.test(advertisement.text_color || "")
      ? advertisement.text_color
      : "#FFFFFF";

  return (
    <article
      className={`sd-home-ad-card ${
        hasImage ? "sd-home-ad-with-image" : "sd-home-ad-no-image"
      }`}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {hasImage && (
        <picture className="sd-home-ad-picture">
          {mobileImage && (
            <source
              media="(max-width: 640px)"
              srcSet={mobileImage}
            />
          )}

          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="sd-home-ad-background"
            onError={() => setImageError(true)}
          />
        </picture>
      )}

      {hasImage && <div className="sd-home-ad-overlay" />}

      <div className="sd-home-ad-content">
        {advertisement.badge_text && (
          <span className="sd-home-ad-badge">
            {advertisement.badge_text}
          </span>
        )}

        <h3 className="sd-home-ad-title">
          {advertisement.heading}
        </h3>

        {advertisement.description && (
          <p className="sd-home-ad-description">
            {advertisement.description}
          </p>
        )}

        <div className="sd-home-ad-actions">
          {advertisement.primary_button_text &&
            advertisement.primary_button_link && (
              <AdvertisementButton
                href={advertisement.primary_button_link}
                primary
              >
                {advertisement.primary_button_text}
              </AdvertisementButton>
            )}

          {advertisement.secondary_button_text &&
            advertisement.secondary_button_link && (
              <AdvertisementButton
                href={advertisement.secondary_button_link}
              >
                {advertisement.secondary_button_text}
              </AdvertisementButton>
            )}
        </div>
      </div>

      <style jsx>{`
        .sd-home-ad-card {
          position: relative;
          width: 100%;
          min-width: 0;
          height: 300px;
          overflow: hidden;
          border-radius: 16px;
          isolation: isolate;
        }

        .sd-home-ad-picture {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: block;
          width: 100%;
          height: 100%;
        }

        .sd-home-ad-background {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .sd-home-ad-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.32) 0%,
            rgba(0, 0, 0, 0.16) 43%,
            rgba(0, 0, 0, 0) 70%
          );
          pointer-events: none;
        }

        .sd-home-ad-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          width: 64%;
          height: 100%;
          padding: 26px 20px;
        }

        .sd-home-ad-no-image .sd-home-ad-content {
          width: 100%;
          max-width: 540px;
        }

        .sd-home-ad-badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          margin-bottom: 13px;
          padding: 5px 8px;
          border-radius: 4px;
          background: #ffffff;
          color: #171717;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.2;
        }

        .sd-home-ad-title {
          display: -webkit-box;
          max-width: 100%;
          overflow: hidden;
          margin: 0;
          font-size: clamp(18px, 1.5vw, 23px);
          font-weight: 750;
          line-height: 1.35;
          letter-spacing: -0.4px;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .sd-home-ad-description {
          display: -webkit-box;
          overflow: hidden;
          max-width: 360px;
          margin: 9px 0 0;
          font-size: 12px;
          line-height: 1.5;
          opacity: 0.95;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .sd-home-ad-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 13px;
          margin-top: 17px;
        }

        @media (max-width: 1100px) {
          .sd-home-ad-card {
            height: 260px;
          }

          .sd-home-ad-content {
            width: 69%;
            padding: 20px 17px;
          }

          .sd-home-ad-title {
            font-size: 18px;
          }
        }

        @media (max-width: 767px) {
          .sd-home-ad-card {
            height: 280px;
            border-radius: 14px;
          }

          .sd-home-ad-content {
            width: 64%;
            padding: 22px 18px;
          }

          .sd-home-ad-title {
            font-size: clamp(17px, 4vw, 23px);
          }
        }

        @media (max-width: 420px) {
          .sd-home-ad-card {
            height: 235px;
          }

          .sd-home-ad-content {
            width: 72%;
            padding: 16px 13px;
          }

          .sd-home-ad-title {
            font-size: 16px;
          }

          .sd-home-ad-description {
            font-size: 11px;
          }

          .sd-home-ad-actions {
            gap: 7px;
            margin-top: 12px;
          }
        }
      `}</style>

      <style jsx global>{`
        .sd-home-ad-card .sd-ad-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 34px;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          text-decoration: none;
          transition: background 0.2s;
        }

        .sd-home-ad-card .sd-ad-primary {
          background: #ffffff;
          color: #05714B;
        }

        .sd-home-ad-card .sd-ad-primary:hover {
          background: #eaf5ef;
          color: #045c3d;
        }

        .sd-home-ad-card .sd-ad-secondary {
          border: 1px solid rgba(255, 255, 255, 0.65);
          background: rgba(0, 0, 0, 0.15);
          color: inherit;
        }

        .sd-home-ad-card .sd-ad-secondary:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 420px) {
          .sd-home-ad-card .sd-ad-button {
            min-height: 31px;
            padding: 7px 9px;
            font-size: 10px;
          }
        }
      `}</style>
    </article>
  );
}

function AdvertisementSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-[300px] animate-pulse rounded-2xl bg-gray-100"
        />
      ))}
    </div>
  );
}

export default function HomeAdvertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAdvertisements() {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message || "Unable to load advertisements."
          );
        }

        const items = Array.isArray(result.data)
          ? result.data
          : [];

        const visibleItems = items
          .filter(
            (item) =>
              item &&
              item.id != null &&
              item.heading &&
              (
                item.is_active === true ||
                item.is_active === 1 ||
                item.is_active === "1"
              )
          )
          .sort(
            (a, b) =>
              Number(a.display_order || 0) -
              Number(b.display_order || 0)
          );

        if (!controller.signal.aborted) {
          setAdvertisements(visibleItems);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load advertisements.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAdvertisements();

    return () => controller.abort();
  }, []);

  if (!loading && !error && advertisements.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full bg-white py-6 sm:py-10"
      aria-label="SheraDeal advertisements"
    >
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
        {loading ? (
          <AdvertisementSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        ) : (
          <div
            className={`sd-home-ad-grid ${
              advertisements.length === 1 ? "single" : ""
            }`}
          >
            {advertisements.map((advertisement) => (
              <AdvertisementCard
                key={advertisement.id}
                advertisement={advertisement}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .sd-home-ad-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .sd-home-ad-grid.single {
          grid-template-columns: minmax(0, 700px);
          justify-content: center;
        }

        @media (max-width: 767px) {
          .sd-home-ad-grid,
          .sd-home-ad-grid.single {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}
