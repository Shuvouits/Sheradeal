"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_PLAY_DELAY = 5000;

function SliderButton({ text, href }) {
  if (!text || !href) return null;

  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const isExternal = /^https?:\/\//i.test(href);

  if (!isInternal && !isExternal) return null;

  return (
    <a
      href={href}
      className="sd-slider-cta"
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {text}
      <span aria-hidden="true">→</span>
    </a>
  );
}

export default function HomeSlider() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSliders() {
      try {
        const response = await fetch("/api/storefront/sliders", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(result.message || "Unable to load sliders.");
        }

        const items = Array.isArray(result.data)
          ? result.data
          : [];

        const validSlides = items.filter(
          (slide) => slide.desktop_image_url
        );

        if (!controller.signal.aborted) {
          setSlides(validSlides);
          setActiveIndex(0);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Homepage slider error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSliders();

    return () => controller.abort();
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 0 ? (current + 1) % slides.length : 0
    );
  }, [slides.length]);

  const previousSlide = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 0
        ? (current - 1 + slides.length) % slides.length
        : 0
    );
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return;

    const timer = window.setInterval(nextSlide, AUTO_PLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [slides.length, paused, nextSlide]);

  if (loading) {
    return (
      <div
        className="w-full animate-pulse bg-[#EAF5EF]"
        style={{ aspectRatio: "1920 / 620", minHeight: 220 }}
        aria-label="Loading homepage banners"
      />
    );
  }

  if (slides.length === 0) return null;

  return (
    <section
      className="sd-home-hero"
      aria-label="SheraDeal promotional banners"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="sd-home-hero-stage">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          const position = ["left", "center", "right"].includes(
            slide.text_position
          )
            ? slide.text_position
            : "left";

          const hasContent = Boolean(
            slide.title ||
            slide.subtitle ||
            slide.description ||
            (slide.button_text && slide.button_link)
          );

          return (
            <div
              key={slide.id}
              className={`sd-home-hero-slide ${
                isActive ? "is-active" : ""
              }`}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <picture className="sd-home-hero-picture">
                {slide.mobile_image_url && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={slide.mobile_image_url}
                  />
                )}

                <img
                  src={slide.desktop_image_url}
                  alt={slide.title || "SheraDeal Promotional Banner"}
                  className="sd-home-hero-image"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </picture>

              {Number(slide.overlay_opacity) > 0 && (
                <div
                  className="sd-home-hero-overlay"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${
                      Math.min(
                        100,
                        Math.max(0, Number(slide.overlay_opacity))
                      ) / 100
                    })`,
                  }}
                />
              )}

              {hasContent && (
                <div className="sd-home-hero-container">
                  <div
                    className={`sd-home-hero-content position-${position}`}
                    style={{
                      color: slide.text_color || "#FFFFFF",
                    }}
                  >
                    {slide.subtitle && (
                      <p className="sd-home-hero-subtitle">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.title && (
                      <h2 className="sd-home-hero-title">
                        {slide.title}
                      </h2>
                    )}

                    {slide.description && (
                      <p className="sd-home-hero-description">
                        {slide.description}
                      </p>
                    )}

                    <SliderButton
                      text={slide.button_text}
                      href={slide.button_link}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="sd-home-hero-arrow prev"
            onClick={previousSlide}
            aria-label="Previous banner"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            className="sd-home-hero-arrow next"
            onClick={nextSlide}
            aria-label="Next banner"
          >
            <ChevronRight size={22} />
          </button>

          <div className="sd-home-hero-dots">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={`sd-home-hero-dot ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show banner ${index + 1}`}
                aria-current={
                  index === activeIndex ? "true" : undefined
                }
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .sd-home-hero {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #eef5f1;
          isolation: isolate;
        }

        .sd-home-hero-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 1920 / 620;
          min-height: 280px;
          max-height: 720px;
          overflow: hidden;
        }

        .sd-home-hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 650ms ease, visibility 650ms;
        }

        .sd-home-hero-slide.is-active {
          opacity: 1;
          visibility: visible;
          z-index: 1;
        }

        .sd-home-hero-picture,
        .sd-home-hero-image {
          display: block;
          width: 100%;
          height: 100%;
        }

        .sd-home-hero-picture {
          position: absolute;
          inset: 0;
        }

        .sd-home-hero-image {
          object-fit: cover;
          object-position: center;
        }

        .sd-home-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .sd-home-hero-container {
          position: relative;
          z-index: 2;
          width: min(100%, 1500px);
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 35px 7%;
        }

        .sd-home-hero-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          max-width: 650px;
          text-align: left;
        }

        .sd-home-hero-content.position-center {
          margin: 0 auto;
          align-items: center;
          text-align: center;
        }

        .sd-home-hero-content.position-right {
          margin-left: auto;
          align-items: flex-end;
          text-align: right;
        }

        .sd-home-hero-subtitle {
          margin: 0 0 12px;
          font-size: clamp(15px, 1.7vw, 24px);
          font-weight: 500;
          line-height: 1.4;
        }

        .sd-home-hero-title {
          margin: 0;
          max-width: 650px;
          font-size: clamp(30px, 4.2vw, 65px);
          line-height: 1.12;
          font-weight: 800;
          letter-spacing: -1.2px;
        }

        .sd-home-hero-description {
          margin: 16px 0 0;
          max-width: 560px;
          font-size: clamp(13px, 1.25vw, 18px);
          line-height: 1.6;
        }

        .sd-slider-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 45px;
          margin-top: 26px;
          padding: 11px 24px;
          border-radius: 10px;
          background: #05714B;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0, 0, 0, .12);
          transition: background .2s, transform .2s;
        }

        .sd-slider-cta:hover {
          background: #045c3d;
          color: #fff;
          transform: translateY(-2px);
        }

        .sd-home-hero-arrow {
          position: absolute;
          top: 50%;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid rgba(0, 0, 0, .05);
          border-radius: 50%;
          background: rgba(255, 255, 255, .9);
          color: #26332c;
          cursor: pointer;
          box-shadow: 0 3px 15px rgba(0, 0, 0, .1);
          transform: translateY(-50%);
          transition: background .2s;
        }

        .sd-home-hero-arrow:hover {
          background: #fff;
          color: #05714B;
        }

        .sd-home-hero-arrow.prev {
          left: 20px;
        }

        .sd-home-hero-arrow.next {
          right: 20px;
        }

        .sd-home-hero-dots {
          position: absolute;
          bottom: 19px;
          left: 50%;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 8px;
          transform: translateX(-50%);
        }

        .sd-home-hero-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          border: 0;
          border-radius: 30px;
          background: rgba(255, 255, 255, .7);
          box-shadow: 0 1px 5px rgba(0, 0, 0, .15);
          cursor: pointer;
          transition: width .25s, background .25s;
        }

        .sd-home-hero-dot.active {
          width: 28px;
          background: #05714B;
        }

        @media (max-width: 900px) {
          .sd-home-hero-container {
            padding: 28px 9%;
          }

          .sd-home-hero-content {
            max-width: 520px;
          }
        }

        @media (max-width: 767px) {
          .sd-home-hero-stage {
            aspect-ratio: 4 / 5;
            min-height: 360px;
            max-height: 650px;
          }

          .sd-home-hero-container {
            padding: 35px 45px;
          }

          .sd-home-hero-content {
            max-width: 100%;
          }

          .sd-home-hero-title {
            font-size: clamp(26px, 7vw, 42px);
          }

          .sd-home-hero-description {
            font-size: 13px;
          }

          .sd-slider-cta {
            min-height: 40px;
            margin-top: 18px;
            padding: 9px 17px;
            font-size: 12px;
          }

          .sd-home-hero-arrow {
            width: 30px;
            height: 30px;
          }

          .sd-home-hero-arrow.prev {
            left: 7px;
          }

          .sd-home-hero-arrow.next {
            right: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sd-home-hero-slide,
          .sd-slider-cta,
          .sd-home-hero-dot {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
