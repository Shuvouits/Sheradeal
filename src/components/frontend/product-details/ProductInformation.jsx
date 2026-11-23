"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";

const PANELS = [
  { id: "description", label: "DESCRIPTION" },
  { id: "ingredients", label: "INGREDIENTS" },
  { id: "how_to_use", label: "HOW TO USE" },
  { id: "reviews", label: "REVIEWS" },
];

function renderText(value) {
  if (!value) {
    return (
      <p className="text-sm text-gray-400">
        Information is not available for this product.
      </p>
    );
  }

  const cleanText = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

  return (
    <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
      {cleanText}
    </p>
  );
}

export default function ProductInformation({
  product,
  reviews = [],
}) {
  const [openPanels, setOpenPanels] = useState([]);

  function togglePanel(id) {
    setOpenPanels((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function panelContent(id) {
    if (id === "reviews") {
      if (reviews.length === 0) {
        return (
          <p className="text-sm text-gray-500">
            এই Product-এর জন্য এখনো কোনো Published Review পাওয়া যায়নি।
          </p>
        );
      }

      return (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4">
              <p className="font-semibold text-gray-900">
                {review.customer_name}
              </p>

              <p className="mt-1 text-amber-500">
                {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return renderText(product[id]);
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-2">
        {PANELS.map((panel) => {
          const isOpen = openPanels.includes(panel.id);

          return (
            <div
              key={panel.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <button
                type="button"
                onClick={() => togglePanel(panel.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-xs font-bold text-gray-900 hover:bg-emerald-50"
              >
                {panel.label}

                {isOpen ? (
                  <Minus size={17} className="text-[#05714B]" />
                ) : (
                  <Plus size={17} />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-5">
                  {panelContent(panel.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CustomerReviews({ reviews = [], reviewSummary }) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-950">
            Customer Reviews
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {reviewSummary?.count ?? reviews.length} reviews for this product
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Review submission will be enabled after the Reviews API is connected."
          className="cursor-not-allowed rounded-lg bg-[#05714B] px-5 py-2.5 text-xs font-semibold text-white opacity-60"
        >
          Add Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center">
          <MessageSquare
            size={30}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 text-sm text-gray-500">
            No customer reviews available yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="text-sm font-bold">
                {review.customer_name}
              </h3>

              <div className="mt-2 text-amber-500">
                {"★".repeat(
                  Math.max(0, Math.min(5, review.rating))
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}