"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AdminUnauthorized() {
  return (
    <main className="min-h-screen py-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
        <div className="size-16 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={32} />
        </div>
        <h1 className="font-serif text-3xl text-neutral-900">Restricted Access</h1>
        <p className="mt-2 text-sm text-neutral-600 font-light leading-relaxed">
          The Studio CMS is reserved for authenticated florists and atelier administrators.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/admin/login"
            className="w-full rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs text-center"
          >
            Sign In to Atelier CMS
          </Link>
          <Link
            href="/"
            className="w-full rounded-full border border-stone-200 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors text-center"
          >
            Return to Boutique Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
