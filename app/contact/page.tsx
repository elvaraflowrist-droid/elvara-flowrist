"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle2,
  Loader2,
  Calendar,
  MessageSquare,
  Sparkles
} from "lucide-react";
import AtelierRadialBackdrop from "@/components/AtelierRadialBackdrop";

export default function ContactPage() {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Custom Wedding & Event Florals");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all inquiry fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      toast.success(data.message || "Your inquiry has been submitted to the atelier!");
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-24 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-16">
          <AtelierRadialBackdrop
            variant="champagne-twilight"
            placement="split"
            intensity={1.15}
            className="p-8 sm:p-12 text-center shadow-2xl border border-purple-500/20 text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/25 text-purple-300 text-xs tracking-wider uppercase font-medium mb-4 backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span>Consultations & Inquiries</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight">
              Connect With Our Atelier
            </h1>
            <p className="mt-3 text-sm sm:text-base text-stone-300 font-light max-w-xl mx-auto leading-relaxed">              Whether planning an intimate wedding, commissioning a bespoke sculptural centerpiece, or inquiring about private masterclasses, we would love to hear from you.
            </p>

          </AtelierRadialBackdrop>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Studio Details & Hours */}
          <div className="lg:col-span-5 space-y-8">
            <div className="rounded-3xl bg-white p-7 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Lead Florist · Sridevi Dasari
                </span>
                <h3 className="font-serif text-2xl text-neutral-900 mt-0.5">
                  Atelier Floral & Conservatory
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-neutral-600">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-stone-500 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 font-medium">Studio Address</strong>
                    <span className="leading-relaxed block text-stone-700">
                      My Home Navadweepa<br />
                      606, Varuna, Patrika Nagar<br />
                      Madhapur, Hitec City Road<br />
                      Hyderabad – 500081
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-stone-500 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 font-medium">Direct Line / WhatsApp</strong>
                    <a href="tel:+919652722499" className="hover:underline text-neutral-900">
                      +91 96527 22499
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-stone-500 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 font-medium">Electronic Dispatch</strong>
                    <a
                      href="mailto:elvaraflowrist@gmail.com"
                      className="hover:underline text-neutral-900"
                    >
                      elvaraflowrist@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Wedding & Event Consultation Note */}
            <div className="rounded-3xl bg-amber-50/70 p-6 sm:p-7 border border-amber-200/60 text-xs sm:text-sm text-stone-800 space-y-2">
              <h4 className="font-serif text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Calendar size={16} className="text-amber-800" />
                {currentYear}/{currentYear + 1} Wedding Inquiries
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                We accept a limited number of full-service floral design commissions each season to ensure uncompromising artistic focus. Please submit your inquiry at least 6 weeks in advance.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-7 sm:p-10 border border-stone-200/80 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="size-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-900">Message Received</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Elvara Florist. A resident botanical designer will review your details and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Elena Vance"
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@example.com"
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Nature of Inquiry <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none transition-all cursor-pointer bg-white"
                    >
                      <option value="Custom Wedding & Event Florals">
                        Custom Wedding & Event Florals
                      </option>
                      <option value="Private Workshop & Group Booking">
                        Private Workshop & Group Booking
                      </option>
                      <option value="Bespoke Residential / Corporate Installation">
                        Bespoke Residential / Corporate Installation
                      </option>
                      <option value="Press, Editorial & Media Inquiries">
                        Press, Editorial & Media Inquiries
                      </option>
                      <option value="General Question / Customer Care">
                        General Question / Customer Care
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Tell Us About Your Vision <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please include details such as event dates, preferred color palette, venue location, or specific floral dreams..."
                      className="w-full rounded-2xl border border-stone-200 p-4 text-xs sm:text-sm text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-all resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 py-3.5 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md group"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>Transmit Inquiry</span>
                        <Send size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
