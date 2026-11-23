
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

const API_URL = "/api/storefront/categories";

function getCategoryList(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(response?.categories)) return response.categories;

  return [];
}

function isEnabled(value) {
  return value === true || value === 1 || value === "1";
}

function getImageUrl(category) {
  const image =
    category.image_url ||
    category.thumbnail_url ||
    category.icon_url ||
    category.image ||
    category.thumbnail ||
    category.icon ||
    "";

  if (!image || typeof image !== "string") return "";

  if (/^https?:\/\//i.test(image)) return image;

  if (image.startsWith("//")) return "";

  const backend = (
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  if (image.startsWith("/")) {
    return `${backend}${image}`;
  }

  const path = image.startsWith("storage/")
    ? image
    : `storage/${image}`;

  return `${backend}/${path}`;
}

function CategoryCard({ category }) {
  const imageUrl = getImageUrl(category);
  const [imageError, setImageError] = useState(false);

  const slug = category.slug || String(category.id);
  const href = `/categories/${encodeURIComponent(slug)}`;

  return (
    <a
      href={href}
      className="sd-featured-category-card"
      title={category.name}
    >
      <div className="sd-featured-category-image-wrap">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="sd-featured-category-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="sd-featured-category-placeholder">
            <ImageIcon size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <span className="sd-featured-category-name">
        {category.name}
      </span>
    </a>
  );
}

export default function FeaturedCategories() {
  const sliderRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrowState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;

    setCanPrevious(slider.scrollLeft > 4);
    setCanNext(
      maxScroll > 4 && slider.scrollLeft < maxScroll - 4
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load categories."
          );
        }

        // Only show active categories marked as featured.
        // Never fall back to all categories.
        const featuredCategories = getCategoryList(result)
          .filter(
            (category) =>
              category &&
              category.id != null &&
              category.name &&
              isEnabled(category.is_active) &&
              isEnabled(category.is_featured)
          )
          .sort(
            (a, b) =>
              Number(a.sort_order ?? a.position ?? 0) -
              Number(b.sort_order ?? b.position ?? 0)
          );

        if (!controller.signal.aborted) {
          setCategories(featuredCategories);
          setError("");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message ||
              "Unable to load featured categories."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const frame = requestAnimationFrame(updateArrowState);

    const observer = new ResizeObserver(updateArrowState);
    observer.observe(slider);

    window.addEventListener("resize", updateArrowState);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateArrowState);
    };
  }, [categories, updateArrowState]);

  function scrollCategories(direction) {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector(
      ".sd-featured-category-card"
    );

    if (!card) return;

    const sliderStyle = getComputedStyle(slider);
    const gap = parseFloat(sliderStyle.columnGap) || 0;
    const cardWidth = card.getBoundingClientRect().width + gap;

    const visibleCards = Math.max(
      1,
      Math.floor(slider.clientWidth / cardWidth)
    );

    slider.scrollBy({
      left: cardWidth * visibleCards * direction,
      behavior: "smooth",
    });
  }

  // Hide the entire section if no featured categories exist.
  if (!loading && !error && categories.length === 0) {
    return null;
  }

  return (
    <section
      className="sd-featured-categories"
      aria-labelledby="sd-featured-categories-title"
    >
      <div className="sd-featured-categories-header">
        <h2 id="sd-featured-categories-title">
          Featured Categories
        </h2>

        {!loading && !error && (
          <div className="sd-featured-categories-controls">
            <button
              type="button"
              onClick={() => scrollCategories(-1)}
              disabled={!canPrevious}
              aria-label="Previous categories"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories(1)}
              disabled={!canNext}
              aria-label="Next categories"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="sd-featured-categories-track sd-featured-loading">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="sd-featured-category-skeleton"
            >
              <div />
              <span />
            </div>
          ))}
        </div>
      ) : error ? (
        <p
          className="sd-featured-categories-error"
          role="alert"
        >
          {error}
        </p>
      ) : (
        <div
          ref={sliderRef}
          className="sd-featured-categories-track"
          onScroll={updateArrowState}
          aria-label="Browse featured categories"
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      )}

      <style>{`
        .sd-featured-categories {
          width: min(100% - 40px, 1440px);
          margin: 0 auto;
          padding: 42px 0 48px;
          font-family: "Segoe UI", Arial, sans-serif;
        }

        .sd-featured-categories-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .sd-featured-categories-header h2 {
          margin: 0;
          color: #151515;
          font-size: clamp(20px, 2vw, 26px);
          line-height: 1.3;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .sd-featured-categories-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .sd-featured-categories-controls button {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          border: 1px solid #e4e7e5;
          border-radius: 50%;
          background: #fff;
          color: #303c35;
          cursor: pointer;
          transition:
            border-color 0.2s,
            color 0.2s,
            background 0.2s;
        }

        .sd-featured-categories-controls button:hover:not(:disabled) {
          border-color: #05714B;
          background: #eaf5ef;
          color: #05714B;
        }

        .sd-featured-categories-controls button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .sd-featured-categories-track {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: calc((100% - 7 * 20px) / 8);
          gap: 20px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 5px 0 12px;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sd-featured-categories-track::-webkit-scrollbar {
          display: none;
        }

        .sd-featured-category-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #1b1b1b;
          text-align: center;
          text-decoration: none;
          scroll-snap-align: start;
          cursor: pointer;
        }

        .sd-featured-category-image-wrap {
          width: 100%;
          height: 116px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 12px;
          background: #fff;
        }

        .sd-featured-category-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.25s ease;
        }

        .sd-featured-category-card:hover .sd-featured-category-image {
          transform: scale(1.07);
        }

        .sd-featured-category-placeholder {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #f2f7f4;
          color: #a2b2a8;
        }

        .sd-featured-category-name {
          display: -webkit-box;
          width: 100%;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: #242424;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .sd-featured-category-card:hover .sd-featured-category-name {
          color: #05714B;
        }

        .sd-featured-category-skeleton {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 12px;
          animation: sd-featured-pulse 1.4s ease-in-out infinite;
        }

        .sd-featured-category-skeleton div {
          width: 100%;
          height: 116px;
          border-radius: 12px;
          background: #e9eeeb;
        }

        .sd-featured-category-skeleton span {
          width: 75%;
          height: 12px;
          border-radius: 5px;
          background: #e9eeeb;
        }

        .sd-featured-categories-error {
          padding: 20px;
          border-radius: 10px;
          background: #fff5f5;
          color: #b42318;
          font-size: 13px;
        }

        @keyframes sd-featured-pulse {
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 1100px) {
          .sd-featured-categories-track {
            grid-auto-columns: calc((100% - 5 * 18px) / 6);
            gap: 18px;
          }
        }

        @media (max-width: 850px) {
          .sd-featured-categories-track {
            grid-auto-columns: calc((100% - 3 * 16px) / 4);
            gap: 16px;
          }

          .sd-featured-categories {
            padding-top: 32px;
            padding-bottom: 36px;
          }
        }

        @media (max-width: 520px) {
          .sd-featured-categories {
            width: calc(100% - 28px);
            padding-top: 26px;
            padding-bottom: 30px;
          }

          .sd-featured-categories-header {
            margin-bottom: 16px;
          }

          .sd-featured-categories-header h2 {
            font-size: 20px;
          }

          .sd-featured-categories-controls button {
            width: 31px;
            height: 31px;
          }

          .sd-featured-categories-track {
            grid-auto-columns: calc((100% - 2 * 12px) / 2.5);
            gap: 12px;
          }

          .sd-featured-category-image-wrap,
          .sd-featured-category-skeleton div {
            height: 100px;
          }

          .sd-featured-category-name {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sd-featured-categories-track {
            scroll-behavior: auto;
          }

          .sd-featured-category-image,
          .sd-featured-categories-controls button {
            transition: none;
          }

          .sd-featured-category-skeleton {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
