// Ingredient health/safety reference data

export const VOC_INFO = {
  Linalool: {
    risk: "low",
    description: "Naturally occurring terpene alcohol found in many flowers and spice plants.",
    tip: "Generally well-tolerated. May cause mild irritation in sensitive individuals.",
  },
  Limonene: {
    risk: "low",
    description: "Citrus-derived compound. Common allergen but low toxicity.",
    tip: "Avoid heavy application if you have citrus sensitivities.",
  },
  Citronellol: {
    risk: "low",
    description: "Rose-scented compound found in citronella and rose oils.",
    tip: "Common fragrance allergen. Patch test if you have reactive skin.",
  },
  Geraniol: {
    risk: "low",
    description: "Floral terpene found in rose and geranium oils.",
    tip: "Known contact allergen for some individuals.",
  },
  Coumarin: {
    risk: "moderate",
    description: "Naturally found in tonka bean and cinnamon. Restricted in some regions.",
    tip: "Moderate exposure levels are generally safe. Avoid ingestion.",
  },
  Eugenol: {
    risk: "low",
    description: "Found in clove oil. Has antiseptic properties.",
    tip: "Can cause skin sensitization in high concentrations.",
  },
  "Benzyl Benzoate": {
    risk: "moderate",
    description: "Solvent and fixative. Common in many fragrances.",
    tip: "Known irritant at high concentrations. Well-regulated in modern perfumery.",
  },
  "Benzyl Alcohol": {
    risk: "low",
    description: "Naturally found in many fruits and teas. Used as preservative.",
    tip: "Generally safe at typical fragrance concentrations.",
  },
  "Iso E Super": {
    risk: "low",
    description: "Synthetic woody molecule widely used in modern perfumery.",
    tip: "Very low allergenicity. Some people are anosmic to it.",
  },
  Ambroxan: {
    risk: "low",
    description: "Synthetic ambergris alternative. Sustainable substitute for whale-derived ambergris.",
    tip: "Very well tolerated. Sustainable choice.",
  },
};

export const CONCERN_LABELS = {
  phthalates: {
    label: "Contains phthalates",
    severity: "high",
    description: "Phthalates are endocrine-disrupting chemicals linked to hormonal interference.",
    tip: "Consider switching to a phthalate-free alternative.",
  },
  parabens: {
    label: "Contains parabens",
    severity: "moderate",
    description: "Parabens are preservatives that may mimic estrogen in the body.",
    tip: "Many brands now offer paraben-free formulations.",
  },
  synthetic_musks: {
    label: "Synthetic musks",
    severity: "low",
    description: "Synthetic musks are persistent environmental pollutants but generally safe for skin.",
    tip: "Look for fragrances using plant-based musk alternatives.",
  },
  high_alcohol: {
    label: "High alcohol content",
    severity: "low",
    description: "Alcohol above 80% can cause skin dryness with heavy application.",
    tip: "Apply to pulse points rather than rubbing across large skin areas.",
  },
};

export function getPerfumeFlags(perfume) {
  const flags = [];
  const ing = perfume.ingredients;
  if (!ing) return flags;

  if (ing.phthalates) flags.push(CONCERN_LABELS.phthalates);
  if (ing.parabens) flags.push(CONCERN_LABELS.parabens);
  if (ing.synthetic_musks) flags.push(CONCERN_LABELS.synthetic_musks);
  if (ing.alcohol_percentage > 80) flags.push(CONCERN_LABELS.high_alcohol);

  return flags;
}

export function getSustainabilityScore(perfume) {
  const ing = perfume.ingredients;
  if (!ing) return 50;

  let score = 50;
  score += (ing.naturally_derived_percentage - 50) * 0.4;
  if (ing.cruelty_free) score += 10;
  if (ing.vegan) score += 5;
  if (ing.phthalates) score -= 15;
  if (ing.parabens) score -= 8;
  if (!ing.synthetic_musks) score += 5;
  if (ing.alcohol_percentage <= 75) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export const SPRAY_TIPS = [
  "Apply to pulse points (wrists, neck, behind ears) for better longevity without over-spraying.",
  "Layer with an unscented moisturizer or body oil to help fragrance last longer.",
  "Spray from 6-8 inches away for even distribution.",
  "Avoid rubbing wrists together -- it breaks down top notes faster.",
  "Store fragrances away from direct sunlight and heat to preserve their composition.",
  "One spray on each pulse point is usually enough. You can always add more.",
  "Fragrances last longer on hydrated skin. Moisturize before applying.",
  "Hair holds fragrance well -- spray lightly on a brush before styling.",
];
