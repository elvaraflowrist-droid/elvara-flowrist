import { Gift } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import GiftCardWriter from "@/components/GiftCardWriter";
import { GiftDetails, StoreSettings } from "./types";

interface GiftStepProps {
  gift: GiftDetails;
  onChange: (patch: Partial<GiftDetails>) => void;
  settings: StoreSettings;
}

export default function GiftStep({ gift, onChange, settings }: GiftStepProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-base font-semibold text-neutral-900">
                Bespoke Gift Packaging &amp; Handcrafted Card
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                +{formatPrice(settings.gift_price)}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Gift-wrapped with satin ribbon, enclosed in our reusable botanical tote bag, plus a
              personalized card printed on 300 GSM textured paper.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
          <input
            type="checkbox"
            checked={gift.isGift}
            onChange={(e) => onChange({ isGift: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
        </label>
      </div>

      {gift.isGift ? (
        <div className="pt-3 border-t border-stone-200/80">
          <GiftCardWriter
            selectedCardId={gift.selectedCardId}
            onSelectCardId={(selectedCardId) => onChange({ selectedCardId })}
            message={gift.message}
            onChangeMessage={(message) => onChange({ message })}
            salutation={gift.salutation}
            onChangeSalutation={(salutation) => onChange({ salutation })}
            signoff={gift.signoff}
            onChangeSignoff={(signoff) => onChange({ signoff })}
          />
        </div>
      ) : (
        <p className="text-xs text-stone-500 italic">
          No gift card selected. You can toggle this on above to choose from 10 occasion styles and
          include a personal message, or continue to review your order.
        </p>
      )}
    </div>
  );
}

