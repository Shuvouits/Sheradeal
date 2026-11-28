
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
    LayoutGrid,
    ChevronDown,
    ImageIcon,
    LoaderCircle,
    X,
} from "lucide-react";

const BACKEND_URL = (
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
).replace(/\/$/, "");

function categoryImageUrl(category) {
    const value =
        category.image_url ||
        category.image ||
        category.icon_url ||
        "";

    if (typeof value !== "string" || !value.trim()) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);

            if (
                url.hostname === "localhost" ||
                url.hostname === "127.0.0.1"
            ) {
                return `${BACKEND_URL}${url.pathname}${url.search}`;
            }

            return value;
        } catch {
            return "";
        }
    }

    const path = value
        .replace(/^\/+/, "")
        .replace(/^public\//, "")
        .replace(/^storage\//, "");

    return `${BACKEND_URL}/storage/${path}`;
}

function CategoryItem({ category, onSelect }) {
    const [failedUrl, setFailedUrl] = useState(null);

    const src = categoryImageUrl(category);
    const failed = failedUrl === src;

    const slug = category.slug || category.id;

    return (
        <Link
            href={`/categories/${encodeURIComponent(String(slug))}`}
            onClick={onSelect}
            className="group flex min-w-0 flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-[#F0F8F4]"
        >
            <div className="flex h-[66px] w-[66px] items-center justify-center overflow-hidden rounded-full bg-[#F3F9F5] transition-colors group-hover:bg-[#E4F3EB]">
                {src && !failed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={src}
                        alt={category.name || "Category"}
                        className="h-full w-full object-contain p-2"
                        onError={() => setFailedUrl(src)}
                    />
                ) : (
                    <ImageIcon
                        size={28}
                        strokeWidth={1.5}
                        className="text-[#05714B]"
                    />
                )}
            </div>

            <span className="line-clamp-2 max-w-full text-xs font-medium leading-[18px] text-gray-700 group-hover:text-[#05714B]">
                {category.name}
            </span>
        </Link>
    );
}

export default function CategoryMegaMenu({
    categories: providedCategories,
}) {
    const [fetchedCategories, setFetchedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [position, setPosition] = useState({
        top: 0,
        left: 16,
        width: 1000,
    });

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const closeTimerRef = useRef(null);

    const hasProvidedCategories = Array.isArray(providedCategories);

   const categories = hasProvidedCategories
    ? providedCategories
    : fetchedCategories;

const visibleCategories = categories.filter(
    (category) =>
        (category.show_in_megamenu === true ||
            category.show_in_megamenu === 1) &&
        category.is_active !== false
);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (hasProvidedCategories) return;

        const controller = new AbortController();

        async function loadCategories() {
            setLoading(true);

            try {
                const response = await fetch(
                    "/api/storefront/categories",
                    {
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                const result = await response.json();

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message || "Unable to load categories."
                    );
                }

                const data = result.data;

                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

                setFetchedCategories(list);
                setError("");
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load categories.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCategories();

        return () => controller.abort();
    }, [hasProvidedCategories]);

    const updatePosition = useCallback(() => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        const margin = viewportWidth < 640 ? 8 : 20;
        const maxWidth = 1440;

        const width = Math.min(
            maxWidth,
            viewportWidth - margin * 2
        );

        const left = Math.max(
            margin,
            (viewportWidth - width) / 2
        );

        setPosition({
            top: rect.bottom,
            left,
            width,
        });
    }, []);

    useEffect(() => {
        if (!open) return;

        updatePosition();

        function handleResize() {
            updatePosition();
        }

        function handleScroll() {
            updatePosition();
        }

        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        function handleOutsideClick(event) {
            const insideTrigger = wrapperRef.current?.contains(
                event.target
            );

            const insideMenu = menuRef.current?.contains(
                event.target
            );

            if (!insideTrigger && !insideMenu) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );

            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    function cancelClose() {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }

    function openMenu() {
        cancelClose();
        updatePosition();
        setOpen(true);
    }

    function scheduleClose() {
        cancelClose();

        closeTimerRef.current = setTimeout(() => {
            setOpen(false);
        }, 220);
    }

    function closeMenu() {
        cancelClose();
        setOpen(false);
    }

    return (
        <>
            <div
                ref={wrapperRef}
                className="relative inline-flex"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
            >


                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => {
                        if (open) {
                            closeMenu();
                        } else {
                            openMenu();
                        }
                    }}
                    onFocus={openMenu}
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls="sheradeal-category-mega-menu"
                    className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${open
                            ? "bg-[#045B3D] text-white"
                            : "bg-[#05714B] text-white hover:bg-[#045B3D]"
                        }`}
                >
                    <LayoutGrid size={18} />
                    <span>Categories</span>
                    <ChevronDown size={16} />
                </button>



            </div>

            {mounted && open &&
                createPortal(
                    <div
                        ref={menuRef}
                        id="sheradeal-category-mega-menu"
                        className="fixed z-[9999]"
                        style={{
                            top: position.top,
                            left: position.left,
                            width: position.width,
                        }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                    >
                        <div className="overflow-hidden rounded-b-2xl border border-gray-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.14)]">
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Shop by Category
                                    </h3>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Browse our product categories
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/categories"
                                        onClick={closeMenu}
                                        className="text-xs font-semibold text-[#05714B] hover:underline"
                                    >
                                        View All
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={closeMenu}
                                        aria-label="Close categories"
                                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[min(565px,70vh)] overflow-y-auto overscroll-contain px-4 py-3">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
                                        <LoaderCircle
                                            size={19}
                                            className="animate-spin text-[#05714B]"
                                        />

                                        Loading categories...
                                    </div>
                                ) : error ? (
                                    <div className="py-12 text-center text-sm text-red-600">
                                        {error}
                                    </div>
                                ) :  visibleCategories.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-gray-500">
                                        No categories available.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10">
                                        {visibleCategories.map((category) => (
                                            <CategoryItem
                                                key={category.id}
                                                category={category}
                                                onSelect={closeMenu}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 bg-[#FAFCFB] px-5 py-2.5">
                                <span className="text-xs text-gray-500">
                                    {visibleCategories.length} categories
                                </span>

                                <Link
                                    href="/categories"
                                    onClick={closeMenu}
                                    className="text-xs font-semibold text-[#05714B] hover:underline"
                                >
                                    Browse all categories
                                </Link>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
