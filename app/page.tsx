import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Clock, Award, Star } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import { getPublicProductsAction, getPublicTestimonialsAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Skeleton for the Featured Products grid
function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
        >
          <div className="aspect-[4/5] bg-stone-200/80 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-4.5 w-3/4 bg-stone-200/80 rounded-md" />
            <div className="h-3 w-1/2 bg-stone-100 rounded-md" />
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="h-5 w-16 bg-stone-200/80 rounded-md" />
              <div className="h-7 w-20 bg-stone-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Async component for fetching and rendering featured products
async function FeaturedProductsSection() {
  let products: ProductItem[] = [];

  try {
    const dbProducts = await getPublicProductsAction("views");
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        aspect: p.aspect,
        imageUrl: p.imageUrl,
        thumbnails: p.thumbnails || [],
        activeThumbnailIndex: p.activeThumbnailIndex || 0,
        assetType: p.assetType,
        tags: p.tags || [],
        views: p.views || 0,
        createdAt: p.createdAt,
      }));
    }
  } catch (err) {
    console.error("Could not load products from database:", err);
  }

  const displayProducts = products.length >= 4 ? products.slice(0, 4) : [...products];

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProducts.map((product, idx) => (
        <ProductCard key={product.id} product={product} priority={idx === 0} />
      ))}
    </div>
  );
}

// Skeleton for the Testimonials section
function TestimonialsSkeleton() {
  return (
    <section className="py-16 bg-stone-100/60 border-t border-stone-200/80 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="h-3 w-36 bg-stone-200/80 rounded-md mx-auto" />
          <div className="h-8 w-64 bg-stone-200/80 rounded-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-7 border border-stone-200/70 shadow-xs flex flex-col justify-between min-h-[180px]"
            >
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="size-3.5 rounded-full bg-amber-100" />
                  ))}
                </div>
                <div className="h-3.5 w-full bg-stone-100 rounded-md" />
                <div className="h-3.5 w-5/6 bg-stone-100 rounded-md" />
                <div className="h-3.5 w-3/4 bg-stone-100 rounded-md" />
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 space-y-1.5">
                <div className="h-4 w-24 bg-stone-200/80 rounded-md" />
                <div className="h-3 w-16 bg-stone-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Async component for fetching and rendering testimonials
async function TestimonialsSection() {
  let testimonials: any[] = [];
  try {
    testimonials = await getPublicTestimonialsAction();
  } catch (err) {
    console.error("Could not load testimonials from database:", err);
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-stone-100/60 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Kind Words From Our Patrons
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mt-1">
            Treasured Stories & Celebrations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl bg-white p-7 border border-stone-200/70 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(review.rating || 5)].map((_, s) => (
                    <Star key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 italic leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100">
                <h4 className="font-serif text-sm font-semibold text-neutral-900">
                  {review.author}
                </h4>
                {review.location && (
                  <p className="text-xs text-neutral-500">{review.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* 1. HERO SECTION (Static & Instant) */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 leading-[1.12] tracking-tight">
                Poetic floral expressions, handcrafted for life’s quiet & grand moments.
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-xl font-light leading-relaxed">
                Step into a world of rare seasonal stems, architectural arrangements, and meditative botanical workshops designed with mindful organic aesthetics.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white hover:bg-neutral-800 transition-all shadow-md group"
                >
                  <span>Explore Collections</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Badges / Micro Proof */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/80 max-w-lg text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-stone-500 shrink-0" />
                  <span>White-glove courier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-stone-500 shrink-0" />
                  <span>Fresh daily harvest</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-stone-500 shrink-0" />
                  <span>Artisan florists</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/60">
                  <Image
                    src="/images/hero_flower.avif"
                    alt="Artisanal Peony Floral Arrangement"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Floating Luxury Card */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                        Featured Atelier Design
                      </p>
                      <h4 className="font-serif text-sm font-semibold text-neutral-900">
                        Ethereal Garden Peony
                      </h4>
                    </div>
                    <Link
                      href="/collections"
                      className="size-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                      aria-label="View arrangement"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-amber-100/40 filter blur-2xl opacity-60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATIONS CAROUSEL/GRID (Streaming with Skeleton) */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Current Season Curation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mt-1">
                Handcrafted Bouquets & Sculptures
              </h2>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors group"
            >
              <span>View complete catalog</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <Suspense fallback={<FeaturedProductsSkeleton />}>
            <FeaturedProductsSection />
          </Suspense>
        </div>
      </section>

      {/* 3. ATELIER PHILOSOPHY & CRAFTSMANSHIP (Static & Instant) */}
      <section className="py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-stone-100">
                <Image
                  src="/images/bouquet_artisan.avif"
                  alt="Floral Designer Crafting Bouquet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Mindful Botanical Design
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 leading-snug">
                We believe flowers are living poetry, meant to transform space and evoke memory.
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
                Every stem at Elvara is personally sourced from regenerative grower cooperatives across the Hudson Valley and sustainable Dutch micro-farms. We honor the natural curve, texture, and wild imperfection of each petal — never forcing rigid symmetry, always celebrating organic beauty.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <h4 className="font-serif text-base font-semibold text-neutral-900 mb-1">
                    100% Floral Foam Free
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    We use reusable kenzan frogs, chicken wire armature, and clean water mechanics to eliminate microplastics.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <h4 className="font-serif text-base font-semibold text-neutral-900 mb-1">
                    Zero Synthetic Preservatives
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Our cold-chain transport ensures stems arrive brimming with natural vitality and delicate botanical perfume.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4"
                >
                  <span>Learn more about us</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLIENT EXPERIENCES & REVIEWS (Streaming with Skeleton) */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </Suspense>
    </main>
  );
}
