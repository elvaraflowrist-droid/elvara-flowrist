import { Package } from "lucide-react";

interface NotSignedInCardProps {
  onOpenAuth: () => void;
}

export default function NotSignedInCard({ onOpenAuth }: NotSignedInCardProps) {
  return (
    <main className="min-h-screen py-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
        <div className="size-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-5">
          <Package size={28} />
        </div>
        <h1 className="font-serif text-3xl text-neutral-900">Patron Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600 font-light leading-relaxed">
          Please sign in to view your bespoke orders, workshop reservations, and delivery records.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 w-full rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
        >
          Sign In or Create Account
        </button>
      </div>
    </main>
  );
}
