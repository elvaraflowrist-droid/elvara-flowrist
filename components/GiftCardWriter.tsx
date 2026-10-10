"use client";

import { useState } from "react";
import { Sparkles, Check, Heart, Feather, RefreshCw, Printer } from "lucide-react";

export interface CardTheme {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  accentColor: string;
  sealColor: string;
  fontClass: string;
  previewBg: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: "vintage-botanical",
    name: "Botanical Herbarium",
    subtitle: "Deckled parchment with pressed wildflowers",
    badge: "Most Popular",
    cardBg: "bg-[#FDFBF7]",
    cardBorder: "border-[#E7DEC8]",
    textColor: "text-[#3D332A]",
    accentColor: "text-[#786243]",
    sealColor: "bg-[#786243]",
    fontClass: "font-handwriting",
    previewBg: "from-[#FBF8EF] to-[#F5EEDC]",
  },
  {
    id: "minimal-ivory",
    name: "Ivory & Gilded Laurel",
    subtitle: "Crisp architectural card with gold foil rim",
    badge: "Editorial Chic",
    cardBg: "bg-[#FFFDF9]",
    cardBorder: "border-[#E5D7B7]",
    textColor: "text-[#1C1917]",
    accentColor: "text-[#B45309]",
    sealColor: "bg-[#B45309]",
    fontClass: "font-serif",
    previewBg: "from-[#FFFDF9] to-[#F8F4EA]",
  },
  {
    id: "blush-rose",
    name: "Blush Petal & Rose",
    subtitle: "Romantic watercolor rose wash & poetic script",
    badge: "Romantic",
    cardBg: "bg-[#FFF5F6]",
    cardBorder: "border-[#FBCFE8]",
    textColor: "text-[#831843]",
    accentColor: "text-[#BE185D]",
    sealColor: "bg-[#BE185D]",
    fontClass: "font-handwriting",
    previewBg: "from-[#FFF1F2] to-[#FCE7F3]",
  },
  {
    id: "midnight-noir",
    name: "Midnight Noir & Starbloom",
    subtitle: "Velvet obsidian card with gilded celestial ink",
    badge: "Evening Glow",
    cardBg: "bg-[#18181B]",
    cardBorder: "border-[#3F3F46]",
    textColor: "text-[#FEF08A]",
    accentColor: "text-[#FDE047]",
    sealColor: "bg-[#CA8A04]",
    fontClass: "font-serif",
    previewBg: "from-[#18181B] to-[#09090B]",
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
  salutation = "Dearest friend,",
  onChangeSalutation,
  signoff = "With heartfelt warmth,",
  onChangeSignoff,
  readOnly = false,
}: GiftCardWriterProps) {
  const currentTheme = CARD_THEMES.find((t) => t.id === selectedCardId) || CARD_THEMES[0];
  const wordCount = countWords(message);
  const isOverWordLimit = wordCount > MAX_GIFT_NOTE_WORDS;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = countWords(val);
    if (words <= MAX_GIFT_NOTE_WORDS + 5) {
      onChangeMessage(val);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Card Aesthetic Selector Tabs */}
      {!readOnly && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <span>Choose Your Card Aesthetic (4 Handcrafted Styles)</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CARD_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectCardId(theme.id)}
                  className={`group relative text-left p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "ring-2 ring-neutral-900 border-neutral-900 shadow-md bg-stone-50"
                      : "border-stone-200 hover:border-stone-400 bg-white"
                  }`}
                >
                  {/* Miniature Card Preview Chip */}
                  <div
                    className={`h-12 w-full rounded-lg mb-2 flex items-center justify-center p-1.5 border shadow-2xs ${theme.cardBg} ${theme.cardBorder}`}
                  >
                    <span
                      className={`text-[11px] leading-tight text-center truncate ${theme.textColor} ${theme.fontClass}`}
                    >
                      {theme.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-neutral-900 truncate">
                      {theme.name}
                    </p>
                    {isSelected && (
                      <span className="size-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                    {theme.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The Interactive Stationery Letter Canvas */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-xs font-medium text-stone-700 flex items-center gap-1">
            <Feather size={12} className="text-stone-500" />
            <span>Write Directly On Your Card</span>
          </span>
          <div className="flex items-center gap-2">
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
            {readOnly && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-neutral-900 bg-stone-100 px-2 py-0.5 rounded-md transition-colors"
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
          {/* Subtle Decorative Floral Corner Motifs */}
          <div className="absolute top-2 left-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.id === "midnight-noir" ? "✦" : "❦"}
          </div>
          <div className="absolute top-2 right-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.id === "midnight-noir" ? "✦" : "❦"}
          </div>
          <div className="absolute bottom-2 left-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.id === "midnight-noir" ? "✦" : "❦"}
          </div>
          <div className="absolute bottom-2 right-2 text-[18px] opacity-40 select-none pointer-events-none">
            {currentTheme.id === "midnight-noir" ? "✦" : "❦"}
          </div>

          {/* Card Header & Wax Seal Emblem */}
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-current/15">
            <div className="flex items-center gap-2">
              <span
                className={`size-6 rounded-full text-white text-[11px] font-serif font-bold flex items-center justify-center shadow-xs ${currentTheme.sealColor}`}
              >
                E
              </span>
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

          {/* Salutation / Greeting Line */}
          <div className="mb-3">
            {readOnly || !onChangeSalutation ? (
              <p
                className={`text-base sm:text-lg font-medium ${currentTheme.textColor} ${currentTheme.fontClass}`}
              >
                {salutation}
              </p>
            ) : (
              <input
                type="text"
                value={salutation}
                onChange={(e) => onChangeSalutation(e.target.value)}
                placeholder="Dearest [Recipient Name],"
                className={`w-full bg-transparent border-b border-dashed border-current/25 focus:border-current/60 focus:outline-none text-base sm:text-lg py-0.5 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-40`}
              />
            )}
          </div>

          {/* Letter Body: Fluid Handwriting / Serif Canvas */}
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
                placeholder="Pour your heart onto this stationery card... E.g. 'Wishing you the happiest birthday filled with peace and blossoming joy! Every petal was curated just for you.'"
                className={`w-full bg-transparent focus:outline-none resize-none text-base sm:text-xl leading-relaxed py-1 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-35`}
              />
            )}
          </div>

          {/* Signoff / Closing */}
          <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between">
            <div className="max-w-[70%]">
              {readOnly || !onChangeSignoff ? (
                <p
                  className={`text-sm sm:text-base italic ${currentTheme.textColor} ${currentTheme.fontClass}`}
                >
                  {signoff}
                </p>
              ) : (
                <input
                  type="text"
                  value={signoff}
                  onChange={(e) => onChangeSignoff(e.target.value)}
                  placeholder="With all our love,"
                  className={`w-full bg-transparent border-b border-dashed border-current/25 focus:border-current/60 focus:outline-none text-sm sm:text-base py-0.5 ${currentTheme.textColor} ${currentTheme.fontClass} placeholder:opacity-40`}
                />
              )}
            </div>

            <div className="flex items-center gap-1.5 opacity-60">
              <Heart
                size={13}
                className={currentTheme.id === "midnight-noir" ? "text-amber-400" : "text-rose-500"}
              />
              <span className={`text-[10px] uppercase tracking-wider font-mono ${currentTheme.textColor}`}>
                300 GSM
              </span>
            </div>
          </div>
        </div>

        {/* Physical Print Note Guarantee */}
        <p className="mt-2 text-[11px] text-stone-500 leading-normal flex items-start gap-1.5">
          <span className="text-amber-700 shrink-0 font-bold">ℹ</span>
          <span>
            <strong>Physical Print Guarantee:</strong> Our Hyderabad floral atelier physically prints
            your letter on thick, archival cardstock matching this aesthetic and nests it inside your
            arrangement&apos;s reusable botanical tote bag.
          </span>
        </p>
      </div>
    </div>
  );
}
