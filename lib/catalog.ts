export interface FilterCategory {
  id: string;
  label: string;
  count: number;
}

export interface DynamicTag {
  tag: string;
  count: number;
}

const KNOWN_CATEGORY_LABELS: Record<string, string> = {
  bouquets: "Hand-Tied Bouquets",
  collections: "Vessel Arrangements",
  gifts: "Botanical Gifts",
  workshops: "Design Workshops",
};

/**
 * Dynamically extract and format categories from existing offerings.
 * Always includes "All Offerings" (id: "all"), followed by preferred
 * atelier categories and any custom categories created in the CMS.
 */
export function getDynamicCategories(
  products: Array<{ assetType?: string | null }>
): FilterCategory[] {
  const typeCounts: Record<string, number> = {};

  products.forEach((p) => {
    if (p.assetType) {
      const type = p.assetType.toLowerCase().trim();
      if (type) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    }
  });

  const categories: FilterCategory[] = [
    { id: "all", label: "All Offerings", count: products.length },
  ];

  // Preferred order for known atelier categories
  const preferred = ["bouquets", "collections", "gifts", "workshops"];
  preferred.forEach((type) => {
    if (typeCounts[type]) {
      categories.push({
        id: type,
        label: KNOWN_CATEGORY_LABELS[type],
        count: typeCounts[type],
      });
      delete typeCounts[type];
    }
  });

  // Any additional dynamic categories created by the florist
  Object.keys(typeCounts).forEach((type) => {
    const formatted = type
      .split(/[-_ ]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    categories.push({
      id: type,
      label: formatted,
      count: typeCounts[type],
    });
  });

  return categories;
}

/**
 * Dynamically extract unique tags from existing offerings.
 * If a category is selected (e.g. "bouquets"), returns the tags
 * present on offerings in that category, sorted by frequency (most used first).
 */
export function getDynamicTags(
  products: Array<{ assetType?: string | null; tags?: string[] | null }>,
  selectedCategory: string = "all"
): DynamicTag[] {
  const tagCounts: Record<string, number> = {};

  products.forEach((p) => {
    const matchesCategory =
      selectedCategory === "all" ||
      p.assetType?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    if (matchesCategory && Array.isArray(p.tags)) {
      p.tags.forEach((t) => {
        const clean = t?.toLowerCase().trim().replace(/^#+/, "");
        if (clean) {
          tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(tagCounts)
    .sort((a, b) => {
      // Sort by popularity (count descending), then alphabetically
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([tag, count]) => ({ tag, count }));
}
