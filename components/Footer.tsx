"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Instagram, Mail, MapPin, Clock, Phone, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Thank you for subscribing to the Elvara Gazette!");
    setEmail("");
  };

  return (
    <footer className="border-t border-stone-200/80 bg-stone-50 text-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Ethos */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/final_logo.png"
                alt="Elvara Florist"
                width={48}
                height={48}
                className="w-10 h-10 rounded-full object-contain"
              />
              <span className="font-serif text-2xl tracking-wide text-neutral-900">
                Elvara Florist
              </span>
            </Link>
            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              An artisanal botanical studio dedicated to poetic floral design, rare seasonal blooms, and meditative floral design workshops.
            </p>
            <div className="pt-2 flex items-center gap-4 text-neutral-600">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="mailto:elvaraflowrist@gmail.com"
                className="size-9 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                aria-label="Email Studio"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
              The Atelier
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/collections" className="hover:text-neutral-950 transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition-colors">
                  Our Story & Ethos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-950 transition-colors">
                  Bespoke Weddings & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Visit */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
              Visit The Studio
            </h4>
            <div className="space-y-2.5 text-sm text-neutral-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-stone-500 shrink-0" />
                <span className="leading-snug">
                  My Home Navadweepa, 606, Varuna, Patrika Nagar, Madhapur, Hitec City Road, Hyderabad – 500081
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-stone-500 shrink-0" />
                <a href="tel:+919652722499" className="hover:text-neutral-900 transition-colors">
                  +91 96527 22499
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
              Floral Journal
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Receive seasonal bloom forecasts, secret workshop drops, and floral styling notes.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 rounded-lg bg-neutral-900 px-2.5 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Check size={11} /> You are on our private guestlist.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Elvara Florist LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-neutral-900 transition-colors">
              Care & Handling
            </Link>
            <Link href="/contact" className="hover:text-neutral-900 transition-colors">
              Delivery Policy
            </Link>
            <Link href="/admin" className="hover:text-neutral-900 transition-colors">
              Studio Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
