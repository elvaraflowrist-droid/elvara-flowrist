"use client";

import { Heart, Feather, Printer, ChevronDown } from "lucide-react";
import { printWithTitle } from "@/lib/utils";

export type CardCategory = "celebration" | "reflection";

export interface CardTheme {
  id: string;
  name: string;
  occasion: string;
  category: CardCategory;
  defaultSalutation: string;
  defaultSignoff: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  sealColor: string;
  fontClass: string;
  cornerMotif: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: "vintage-botanical",
    name: "Botanical Herbarium",
    occasion: "Birthdays, everyday warmth & gratitude",
    category: "celebration",
    defaultSalutation: "Dearest friend,",
    defaultSignoff: "With warmest wishes,",
    cardBg: "bg-[#FDFBF7]",
    cardBorder: "border-[#E7DEC8]",
    textColor: "text-[#3D332A]",
    sealColor: "bg-[#786243]",
    fontClass: "font-handwriting",
    cornerMotif: "❦",
  },
  {
    id: "blush-rose",
    name: "Blush Petal & Rose",
    occasion: "Romance, anniversaries & proposals",
    category: "celebration",
    defaultSalutation: "My dearest,",
    defaultSignoff: "Forever yours,",
    cardBg: "bg-[#FFF5F6]",
    cardBorder: "border-[#FBCFE8]",
    textColor: "text-[#831843]",
    sealColor: "bg-[#BE185D]",
    fontClass: "font-handwriting",
    cornerMotif: "❦",
  },
  {
    id: "minimal-ivory",
    name: "Ivory & Gilded Laurel",
    occasion: "Weddings, milestones & congratulations",
    category: "celebration",
    defaultSalutation: "Warmest congratulations,",
    defaultSignoff: "With deepest joy,",
    cardBg: "bg-[#FFFDF9]",
    cardBorder: "border-[#E5D7B7]",
    textColor: "text-[#1C1917]",
    sealColor: "bg-[#B45309]",
    fontClass: "font-serif",
    cornerMotif: "✦",
  },
  {
    id: "sunlit-marigold",
    name: "Sunlit Marigold",
    occasion: "Festivals, housewarmings & new beginnings",
    category: "celebration",
    defaultSalutation: "Wishing you light & joy,",
    defaultSignoff: "Warmly,",
    cardBg: "bg-[#FFFBEB]",
    cardBorder: "border-[#FDE68A]",
    textColor: "text-[#78350F]",
    sealColor: "bg-[#D97706]",
    fontClass: "font-handwriting",
    cornerMotif: "✦",
  },
  {
    id: "spring-meadow",
    name: "Spring Meadow Pastel",
    occasion: "New baby, Mother's Day & gentle cheer",
    category: "celebration",
    defaultSalutation: "With all our love,",
    defaultSignoff: "So happy for you,",
    cardBg: "bg-[#F4FAF6]",
    cardBorder: "border-[#BBF7D0]",
    textColor: "text-[#14532D]",
    sealColor: "bg-[#15803D]",
    fontClass: "font-handwriting",
    cornerMotif: "❦",
  },
  {
    id: "serene-lily",
    name: "Serene White Lily",
    occasion: "Sympathy, condolences & peaceful comfort",
    category: "reflection",
    defaultSalutation: "With deepest sympathy,",
    defaultSignoff: "Holding you in our thoughts,",
    cardBg: "bg-[#F8FAFC]",
    cardBorder: "border-[#CBD5E1]",
    textColor: "text-[#334155]",
    sealColor: "bg-[#64748B]",
    fontClass: "font-serif",
    cornerMotif: "✿",
  },
  {
    id: "quiet-olive",
    name: "Quiet Olive & Parchment",
    occasion: "Death anniversary & solemn remembrance",
    category: "reflection",
    defaultSalutation: "In loving memory,",
    defaultSignoff: "Remembered always with love,",
    cardBg: "bg-[#F7F7F2]",
    cardBorder: "border-[#D6D8C7]",
    textColor: "text-[#363B2B]",
    sealColor: "bg-[#5C6449]",
    fontClass: "font-serif",
    cornerMotif: "❦",
  },
  {
    id: "lavender-mist",
    name: "Soft Lavender Mist",
    occasion: "Get well soon, healing & thinking of you",
    category: "reflection",
    defaultSalutation: "Thinking of you,",
    defaultSignoff: "Wishing you strength & rest,",
    cardBg: "bg-[#FAF5FF]",
    cardBorder: "border-[#E9D5FF]",
    textColor: "text-[#4C1D95]",
    sealColor: "bg-[#7C3AED]",
    fontClass: "font-handwriting",
    cornerMotif: "✿",
  },
  {
    id: "terracotta-linen",
    name: "Warm Terracotta & Linen",
    occasion: "Apology, reconciliation & heartfelt thanks",
    category: "reflection",
    defaultSalutation: "From the heart,",
    defaultSignoff: "With sincere gratitude,",
    cardBg: "bg-[#FDF6F3]",
    cardBorder: "border-[#FED7AA]",
    textColor: "text-[#7C2D12]",
    sealColor: "bg-[#C2410C]",
    fontClass: "font-serif",
    cornerMotif: "❦",
  },
  {
    id: "midnight-noir",
    name: "Midnight Noir & Starbloom",
    occasion: "Evening galas, farewells & timeless tributes",
    category: "reflection",
    defaultSalutation: "To an unforgettable chapter,",
    defaultSignoff: "With enduring respect,",
    cardBg: "bg-[#18181B]",
    cardBorder: "border-[#3F3F46]",
    textColor: "text-[#FEF08A]",
    sealColor: "bg-[#CA8A04]",
    fontClass: "font-serif",
    cornerMotif: "✦",
  },
];

export const MAX_GIFT_NOTE_WORDS = 55;

interface GiftCardWriterProps {
  selectedCardId: string;
  onSelectCardId: (id: string) => void;
  message: string;
  onChangeMessage: (msg: string) => void;
  salutation?: string;
  onChangeSalutation?: (val: string) => void;
  signoff?: string;
  onChangeSignoff?: (val: string) => void;
  readOnly?: boolean;
  printTitle?: string;
  hidePrintButton?: boolean;
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function GiftCardWriter({
  selectedCardId,
  onSelectCardId,
  message,
  onChangeMessage,
  salutation,
  onChangeSalutation,
  signoff,
  onChangeSignoff,
  readOnly = false,
  printTitle,
  hidePrintButton = false,
}: GiftCardWriterProps) {
  const currentTheme = CARD_THEMES.find((t) => t.id === selectedCardId) || CARD_THEMES[0];
  const wordCount = countWords(message);
  const isOverWordLimit = wordCount > MAX_GIFT_NOTE_WORDS;

  const celebrationThemes = CARD_THEMES.filter((t) => t.category === "celebration");
  const reflectionThemes = CARD_THEMES.filter((t) => t.category === "reflection");

  const handleThemeSelect = (nextId: string) => {
    onSelectCardId(nextId);
    const nextTheme = CARD_THEMES.find((t) => t.id === nextId);
    if (nextTheme) {
      onChangeSalutation?.(nextTheme.defaultSalutation);
      onChangeSignoff?.(nextTheme.defaultSignoff);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (countWords(val) <= MAX_GIFT_NOTE_WORDS + 5) {
      onChangeMessage(val);
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    printWithTitle(printTitle || document.title, undefined, "card");
  };

  const resolvedSalutation = salutation ?? (readOnly ? "" : currentTheme.defaultSalutation);
  const resolvedSignoff = signoff ?? (readOnly ? "" : currentTheme.defaultSignoff);

  return (
    <div className="space-y-4">
      {/* Occasion & Card Style Select */}
      {!readOnly && (
        <div>
          <label
            htmlFor="gift-card-style-select"
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-1.5"
          >
            Card Intention &amp; Aesthetic 
          </label>
          <div className="relative">
            <select
              id="gift-card-style-select"
              value={currentTheme.id}
              onChange={(e) => handleThemeSelect(e.target.value)}
              className="w-full appearance-none rounded-xl border border-stone-200 bg-white pl-3.5 pr-9 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none transition-colors cursor-pointer"
            >
              <optgroup label="Celebration &amp; Joy">
                {celebrationThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} — {theme.occasion}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Reflection, Comfort &amp; Remembrance">
                {reflectionThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} — {theme.occasion}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
          </div>
        </div>
      )}

      {/* Interactive Stationery Letter Canvas */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-xs font-medium text-stone-700 flex items-center gap-1">
            <Feather size={12} className="text-stone-500" />
            <span>{readOnly ? "Card Note Preview" : "Write Directly On Your Card"}</span>
          </span>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isOverWordLimit
                    ? "bg-rose-100 text-rose-700 font-semibold"
                    : wordCount >= MAX_GIFT_NOTE_WORDS - 5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {wordCount} / {MAX_GIFT_NOTE_WORDS} words
              </span>
            )}
            {readOnly && !hidePrintButton && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-neutral-900 bg-stone-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                title="Print this card note"
              >
                <Printer size={11} />
                <span>Print Card</span>
              </button>
            )}
          </div>
        </div>

        {/* The Card Surface */}
        <div
          id="printable-gift-card"
          className={`relative w-full rounded-2xl border-2 p-6 sm:p-7 shadow-lg transition-all duration-300 overflow-hidden ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
        >
          {/* Decorative Corner Motifs */}
          <div className="absolute top-2 left-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.cornerMotif}
          </div>
          <div className="absolute top-2 right-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.cornerMotif}
          </div>
          <div className="absolute bottom-2 left-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.cornerMotif}
          </div>
          <div className="absolute bottom-2 right-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.cornerMotif}
          </div>

          {/* Card Header & Brand Logo */}
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-current/15">
            <div className="flex items-center gap-2">
              <img
                src="/images/final_logo.png"
                alt="Elvara Florist Logo"
                loading="eager"
                decoding="sync"
                className="size-7 rounded-full object-contain bg-white/90 p-0.5 shadow-xs"
              />
              <span
                className={`text-[11px] uppercase tracking-widest font-semibold opacity-75 ${currentTheme.textColor}`}
              >
                ELVARA • HANDCRAFTED NOTE
              </span>
            </div>
            <span
              className={`text-[10px] italic tracking-wider opacity-60 ${currentTheme.textColor}`}
            >
              {currentTheme.name}
            </span>
          </div>

          {/* Salutation */}
          {(resolvedSalutation || (!readOnly && onChangeSalutation)) && (
            <div className="mb-3">
              {readOnly || !onChangeSalutation ? (
                <p
                  className={`text-base sm:text-lg font-medium ${currentTheme.textColor} ${currentTheme.fontClass}`}
                >
                  {resolvedSalutation}
                </p>
              ) : (
                <input
                  type="text"
                  aria-label="Card salutation"
                  value={resolvedSalutation}
                  onChange={(e) => onChangeSalutation(e.target.value)}
                  placeholder="Dearest [Recipient Name],"
                  className={`w-full bg-transparent border-b border-dashed border-current/30 hover:border-current/50 focus:border-current/70 focus:outline-none text-base sm:text-lg py-0.5 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-40`}
                />
              )}
            </div>
          )}

          {/* Letter Body */}
          <div className="relative my-2">
            {readOnly ? (
              <p
                className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap min-h-[90px] ${currentTheme.textColor} ${currentTheme.fontClass}`}
              >
                {message || "(No note message entered)"}
              </p>
            ) : (
              <textarea
                rows={4}
                value={message}
                onChange={handleMessageChange}
                placeholder="Write your heartfelt message here..."
                className={`w-full bg-transparent focus:outline-none resize-none text-base sm:text-xl leading-relaxed py-1 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-35`}
              />
            )}
          </div>

          {/* Signoff */}
          <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {resolvedSignoff || (!readOnly && onChangeSignoff) ? (
                readOnly || !onChangeSignoff ? (
                  <p
                    className={`text-sm sm:text-base italic ${currentTheme.textColor} ${currentTheme.fontClass}`}
                  >
                    {resolvedSignoff}
                  </p>
                ) : (
                  <input
                    type="text"
                    aria-label="Card sign-off"
                    value={resolvedSignoff}
                    onChange={(e) => onChangeSignoff(e.target.value)}
                    placeholder="With warmest wishes,"
                    className={`w-full bg-transparent border-b border-dashed border-current/30 hover:border-current/50 focus:border-current/70 focus:outline-none text-sm sm:text-base py-0.5 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-40`}
                  />
                )
              ) : null}
            </div>
          </div>
        </div>

        {!readOnly && (
          <p className="mt-2 text-[11px] text-stone-500 leading-normal flex items-start gap-1.5">
            <span className="text-amber-700 shrink-0 font-bold">ℹ</span>
            <span>
              <strong>Physical Print Guarantee:</strong> Our Hyderabad floral atelier physically prints
              your letter on thick, archival cardstock matching this aesthetic and nests it inside your
              arrangement&apos;s reusable botanical tote bag.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
