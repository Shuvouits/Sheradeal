"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { createPortal } from "react-dom";

import {
  BadgeCheck,
  ChevronDown,
  Search,
  X,
  ArrowRight,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getFirstLetter(name) {
  const first = String(name || "")
    .trim()
    .charAt(0)
    .toUpperCase();

  return /^[A-Z]$/.test(first) ? first : "#";
}

function buildColumns(brands, columnCount) {
  const grouped = new Map();

  for (const brand of brands) {
    const letter = getFirstLetter(brand.name);

    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }

    grouped.get(letter).push(brand);
  }

  const groups = [...grouped.entries()]
    .sort(([a], [b]) => {
      if (a === "#") return -1;
      if (b === "#") return 1;
      return a.localeCompare(b);
    })
    .map(([letter, items]) => ({
      letter,
      items,
    }));

  const columns = Array.from(
    { length: columnCount },
    () => []
  );

  const total = brands.length;
  const target = Math.max(1, Math.ceil(total / columnCount));

  let columnIndex = 0;
  let columnItems = 0;

  for (const group of groups) {
    if (
      columnIndex < columnCount - 1 &&
      columnItems > 0 &&
      columnItems + group.items.length > target
    ) {
      columnIndex += 1;
      columnItems = 0;
    }

    columns[columnIndex].push(group);
    columnItems += group.items.length;
  }

  return columns;
}

export default function BrandMegaMenu() {
  const triggerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const searchRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("#");
  const [menuTop, setMenuTop] = useState(0);
  const [columnCount, setColumnCount] = useState(8);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const nav =
      triggerRef.current.closest(".sd-navigation") ||
      triggerRef.current.closest("nav");

    const rect = nav
      ? nav.getBoundingClientRect()
      : triggerRef.current.getBoundingClientRect();

    setMenuTop(Math.max(0, rect.bottom));

    const width = window.innerWidth;

    setColumnCount(
      width >= 1280
        ? 8
        : width >= 1024
          ? 6
          : width >= 640
            ? 4
            : 2
    );
  }, []);

  const loadBrands = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/storefront/brands",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to load brands."
        );
      }

      const records = Array.isArray(result.data)
        ? result.data
        : result.data?.brands;

      const items = Array.isArray(records)
        ? records
        : [];

      const cleaned = items
        .filter((brand) => brand?.id && brand?.name)
        .map((brand) => ({
          id: brand.id,
          name: String(brand.name),
          slug: String(brand.slug || ""),
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, "en", {
            sensitivity: "base",
          })
        );

      setBrands(cleaned);
      setLoaded(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load brands.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function onResize() {
      updateMenuPosition();
    }

    function onScroll() {
      updateMenuPosition();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onMouseDown(event) {
      const triggerContains =
        triggerRef.current?.contains(event.target);

      const panelContains =
        document
          .getElementById("sheradeal-brand-mega-menu")
          ?.contains(event.target);

      if (!triggerContains && !panelContains) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open, updateMenuPosition]);

 
  useEffect(() => {
  if (!open || loaded) return;

  const controller = new AbortController();

  loadBrands(controller.signal);

  return () => controller.abort();
}, [open, loaded, loadBrands]);



  useEffect(() => {
    return () => {
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

  function scheduleClose() {
    cancelClose();

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  }

  function openMenu() {
    cancelClose();
    updateMenuPosition();
    setOpen(true);
  }

  function closeMenu() {
    cancelClose();
    setOpen(false);
  }

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();

    return brands.filter((brand) => {
      const matchesSearch =
        term === "" ||
        brand.name.toLowerCase().includes(term);

      const matchesLetter =
        activeLetter === "#" ||
        getFirstLetter(brand.name) === activeLetter;

      return matchesSearch && matchesLetter;
    });
  }, [brands, search, activeLetter]);

  const columns = useMemo(
    () => buildColumns(filteredBrands, columnCount),
    [filteredBrands, columnCount]
  );

  const availableLetters = useMemo(() => {
    return new Set(
      brands.map((brand) => getFirstLetter(brand.name))
    );
  }, [brands]);

  const menu = (
    <div
      id="sheradeal-brand-mega-menu"
      role="region"
      aria-label="Shop by brand"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className="fixed left-1/2 z-[300] flex w-[calc(100vw-32px)] max-w-[1440px] -translate-x-1/2 flex-col overflow-hidden rounded-b-xl border border-t-2 border-gray-200 border-t-[#05714B] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
      style={{
        top: menuTop,
        maxHeight: `calc(100dvh - ${menuTop + 12}px)`,
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3 sm:px-6">
        <h2 className="text-[15px] font-bold text-[#111827]">
          Shop by Brand
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[190px] sm:w-[270px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveLetter("#");
              }}
              placeholder="Search brands..."
              aria-label="Search brands"
              className="h-10 w-full rounded-full border border-gray-200 bg-[#F8FAF9] pl-9 pr-9 text-xs text-gray-800 outline-none transition focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#05714B]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <span className="rounded-full bg-[#ECFDF5] px-3 py-1.5 text-[11px] font-semibold text-[#05714B]">
            {brands.length} brands
          </span>

          <Link
            href="/brands"
            onClick={closeMenu}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#05714B] hover:underline"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Alphabet Navigation */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-gray-100 px-4 py-2.5 sm:px-6">
        {["#", ...ALPHABETS].map((letter) => {
          const selected = activeLetter === letter;

          const enabled =
            letter === "#" || availableLetters.has(letter);

          return (
            <button
              key={letter}
              type="button"
              disabled={!enabled}
              onClick={() => {
                setActiveLetter(letter);
                setSearch("");
              }}
              aria-pressed={selected}
              className={`flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md px-1 text-[12px] font-semibold transition ${
                selected
                  ? "bg-[#05714B] text-white"
                  : enabled
                    ? "text-gray-700 hover:bg-[#ECFDF5] hover:text-[#05714B]"
                    : "cursor-not-allowed text-gray-300"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Brand List */}
      <div className="min-h-[180px] flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-gray-500">
            <LoaderCircle
              size={20}
              className="animate-spin text-[#05714B]"
            />
            Loading brands...
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadBrands()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-4 py-2 text-xs font-semibold text-white"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <Search size={28} className="text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-800">
              No brands found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              অন্য Brand Name অথবা Letter নির্বাচন করো।
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveLetter("#");
              }}
              className="mt-4 cursor-pointer text-xs font-semibold text-[#05714B]"
            >
              Show all brands
            </button>
          </div>
        ) : (
          <div
            className="grid items-start gap-x-5 gap-y-5"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="min-w-0 space-y-4"
              >
                {column.map((group) => (
                  <div key={group.letter}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[12px] font-extrabold text-[#05714B]">
                        {group.letter}
                      </span>

                      <div className="h-px min-w-0 flex-1 bg-emerald-100" />
                    </div>

                    <div className="flex flex-col items-start gap-1.5">
                      {group.items.map((brand) => (

                       
<Link
  key={brand.id}
  href={`/brand/${encodeURIComponent(brand.slug)}`}
  onClick={closeMenu}
  title={brand.name}
  className="block w-full break-words text-[12px] leading-[19px] text-gray-600 transition hover:text-[#05714B] hover:underline"
>
  {brand.name}
</Link>


                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-100 bg-[#FAFCFB] px-5 py-2.5 text-[11px] text-gray-500 sm:px-6">
        <span>
          Showing {filteredBrands.length} of {brands.length} brands
        </span>

        <button
          type="button"
          onClick={closeMenu}
          className="cursor-pointer font-semibold text-[#05714B]"
        >
          Close Menu
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="relative flex items-center"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={triggerRef}
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
          aria-controls="sheradeal-brand-mega-menu"
          aria-haspopup="true"
          className={`sd-nav-link cursor-pointer ${
            open ? "text-[#05714B]" : ""
          }`}
        >
          <BadgeCheck size={18} />
          <span>Brands</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {mounted && open && createPortal(menu, document.body)}
    </>
  );
}