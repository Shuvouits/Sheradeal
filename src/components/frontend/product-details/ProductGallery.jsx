"use client";

import { useState } from "react";
import {
  ImageIcon,
  Expand,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductGallery({ product }) {
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];

  if (images.length === 0 && product.image_url) {
    images.push(product.image_url);
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const currentIndex = Math.min(
    selectedIndex,
    Math.max(0, images.length - 1)
  );

  const currentImage = images[currentIndex];

  function previousImage() {
    setSelectedIndex((index) =>
      (index - 1 + images.length) % images.length
    );
  }

  function nextImage() {
    setSelectedIndex((index) =>
      (index + 1) % images.length
    );
  }

  return (
    <div className="min-w-0">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-[#FAFAFA]">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.title}
            className="h-full w-full object-contain p-5 sm:p-8"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-300">
            <ImageIcon size={54} />
            <span className="text-xs">No product image</span>
          </div>
        )}

        {product.discount_percent > 0 && (
          <div className="absolute right-0 top-0 rounded-bl-xl bg-[#05714B] px-3 py-2 text-center text-xs font-bold text-white sm:text-sm">
            {product.discount_percent}%<br />
            OFF
          </div>
        )}

        {currentImage && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="View product image fullscreen"
            className="absolute bottom-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm hover:text-[#05714B]"
          >
            <Expand size={19} />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm"
            >
              <ChevronRight size={19} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-gray-50 p-1 ${
                currentIndex === index
                  ? "border-[#05714B]"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <img
                src={image}
                alt={`${product.title} - ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {fullscreen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90 p-5"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close preview"
            className="absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X size={23} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 rounded-full bg-white/20 p-3 text-white"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={currentImage}
            alt={product.title}
            className="max-h-[85vh] max-w-[85vw] object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 rounded-full bg-white/20 p-3 text-white"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}