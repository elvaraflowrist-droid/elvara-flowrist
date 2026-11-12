import { useState } from "react";
import { User, Mail, Phone, MapPin, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ContactDetails } from "./types";

interface ContactStepProps {
  fulfillmentType: "delivery" | "pickup";
  contact: ContactDetails;
  onChange: (patch: Partial<ContactDetails>) => void;
}

export default function ContactStep({
  fulfillmentType,
  contact,
  onChange,
}: ContactStepProps) {
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (!res.ok) throw new Error("Could not convert coordinates to address");
          const data = await res.json();
          const addr = data.address || {};

          const streetParts = [
            addr.house_number,
            addr.building,
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood,
          ].filter(Boolean);

          const fullStreet =
            streetParts.length > 0
              ? streetParts.join(" ")
              : data.display_name?.split(",")?.slice(0, 2)?.join(",") || "";

          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
          const detectedPostalCode = addr.postcode || "";

          onChange({
            ...(fullStreet ? { address: fullStreet } : {}),
            ...(detectedCity ? { city: detectedCity } : {}),
            ...(detectedPostalCode ? { postalCode: detectedPostalCode } : {}),
          });

          toast.success("Delivery address populated from current location!");
        } catch (err) {
          console.error(err);
          onChange({ address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` });
          toast.info("GPS coordinates captured. Please refine your street address.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter address manually.");
        } else {
          toast.error("Unable to retrieve location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-base font-semibold text-neutral-900 border-b border-stone-100 pb-2">
        {fulfillmentType === "delivery"
          ? "Recipient & Delivery Details"
          : "Collector Contact Details"}
      </h3>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          {fulfillmentType === "delivery" ? "Recipient Full Name" : "Your Name / Collector"}{" "}
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 size-4 text-stone-400" />
          <input
            type="text"
            required
            value={contact.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Clara Oswald"
            className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 size-4 text-stone-400" />
            <input
              type="email"
              required
              value={contact.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 size-4 text-stone-400" />
            <input
              type="tel"
              required
              value={contact.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {fulfillmentType === "delivery" && (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200/60 transition-colors disabled:opacity-50 cursor-pointer"
                title="Detect current address using browser Geolocation"
              >
                {locating ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-amber-800" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={11} className="text-amber-800" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 size-4 text-stone-400" />
              <input
                type="text"
                required
                value={contact.address}
                onChange={(e) => onChange({ address: e.target.value })}
                placeholder="Apartment, suite, street name"
                className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contact.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Hyderabad"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Postal / Pin Code
              </label>
              <input
                type="text"
                value={contact.postalCode}
                onChange={(e) => onChange({ postalCode: e.target.value })}
                placeholder="500033"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <FileText size={12} className="text-stone-400" />
          <span>
            {fulfillmentType === "delivery"
              ? "Delivery Instructions (optional)"
              : "Pickup Time / Collection Notes (optional)"}
          </span>
        </label>
        <textarea
          rows={2}
          value={contact.deliveryNotes}
          onChange={(e) => onChange({ deliveryNotes: e.target.value })}
          placeholder={
            fulfillmentType === "delivery"
              ? "e.g. Please handle with care, gate code is 4321"
              : "e.g. Expecting to collect this Saturday around 3 PM"
          }
          className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}

