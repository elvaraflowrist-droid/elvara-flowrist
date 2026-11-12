import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves full media URL from R2 key, local asset, or external URL.
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
  const base = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

/** Extract initials from a name string (e.g. "John Doe" → "JD") */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Format large numbers with K/M suffix */
export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(0)}M+`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}k+`;
  return `${views}+`;
}

/** Format ISO date string to human readable format */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Resolve active thumbnail URL from a product object with fallback */
export function getActiveThumbnail(item: {
  thumbnails?: string[] | null;
  activeThumbnailIndex?: number | null;
  imageUrl?: string | null;
}): string {
  const thumb = item.thumbnails?.[item.activeThumbnailIndex || 0] || item.imageUrl;
  return thumb ? getMediaUrl(thumb) : "/images/hero_flower.png";
}

/** Format price for display ("Free" or "₹499.00") */
export function formatPrice(price: string | number | null | undefined, currency = "INR"): string {
  if (!price || parseFloat(price.toString()) <= 0) return "Free";
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Check if an item has a paid price */
export function hasPaidPrice(price: string | number | null | undefined): boolean {
  return !!price && parseFloat(price.toString()) > 0;
}

/** Build a filename-safe print title: recipientName_orderName_YYYY-MM-DD */
export function buildGiftCardPrintTitle(
  recipientName: string,
  orderName: string,
  purchasedAt: string | Date
): string {
  const sanitize = (val: string) =>
    val
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ");
  const d = new Date(purchasedAt);
  const datePart = Number.isNaN(d.getTime()) ? "date" : d.toISOString().slice(0, 10);
  return `${sanitize(recipientName || "Patron")}_${sanitize(orderName || "Order")}_${datePart}`;
}

/** Trigger window.print() with a temporary document.title and print mode */
export function printWithTitle(
  title: string,
  onAfterPrint?: () => void,
  mode: "card" | "slip" = "card"
): () => void {
  const previousTitle = document.title;
  document.title = title;
  document.body.dataset.printMode = mode;

  const cleanup = () => {
    document.title = previousTitle;
    delete document.body.dataset.printMode;
    window.removeEventListener("afterprint", handleAfterPrint);
  };

  const handleAfterPrint = () => {
    cleanup();
    onAfterPrint?.();
  };

  window.addEventListener("afterprint", handleAfterPrint);
  const frameId = requestAnimationFrame(() => {
    window.print();
  });

  return () => {
    cancelAnimationFrame(frameId);
    cleanup();
  };
}
