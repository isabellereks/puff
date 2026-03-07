// Comprehensive chemical ingredient database
// Based on Kazemi et al., 2022 — systematic review of 37 studies on perfume contaminants and health effects
// This data is for educational/awareness purposes only and does not constitute medical advice.

export const CHEMICAL_CATEGORIES = {
  phthalates: {
    id: "phthalates",
    label: "Phthalates",
    description: "Solvents and fixatives that slow evaporation so scent lasts longer on skin.",
    severityWeight: 3,
  },
  aldehydes: {
    id: "aldehydes",
    label: "Aldehydes",
    description: "Compounds used in scent production, some with documented respiratory and carcinogenic risks.",
    severityWeight: 3,
  },
  parabens: {
    id: "parabens",
    label: "Parabens",
    description: "Preservatives that extend product shelf life.",
    severityWeight: 2,
  },
  synthetic_musks: {
    id: "synthetic_musks",
    label: "Synthetic Musks",
    description: "Fragrance base compounds that provide lasting musky scent.",
    severityWeight: 2,
  },
  reactive_terpenes: {
    id: "reactive_terpenes",
    label: "Reactive Terpenes",
    description: "Not directly toxic, but react with indoor ozone to produce formaldehyde and secondary organic aerosols.",
    severityWeight: 1,
  },
};

export const BODY_SYSTEMS = {
  respiratory: { id: "respiratory", label: "Respiratory", icon: "cloud-outline" },
  skin: { id: "skin", label: "Skin", icon: "hand-left-outline" },
  endocrine: { id: "endocrine", label: "Endocrine", icon: "pulse-outline" },
  neurological: { id: "neurological", label: "Neurological", icon: "flash-outline" },
  liver: { id: "liver", label: "Liver", icon: "fitness-outline" },
  immune: { id: "immune", label: "Immune", icon: "shield-outline" },
  cardiovascular: { id: "cardiovascular", label: "Cardiovascular", icon: "heart-outline" },
};

// Each chemical: name, category, roleInPerfume, risks[], affectedSystems[], regulatoryNotes
export const CHEMICAL_DATABASE = [
  // --- Phthalates ---
  {
    name: "DEP",
    fullName: "Diethyl phthalate",
    category: "phthalates",
    roleInPerfume: "Solvent and fixative that slows fragrance evaporation, making scent last longer.",
    risks: [
      "Endocrine disruption",
      "Male reproductive harm",
      "Potential fetal developmental effects",
    ],
    affectedSystems: ["endocrine", "neurological"],
    regulatoryNotes: "Most commonly found phthalate in fragrances. Not currently EU-restricted in cosmetics but under ongoing review.",
    plainLanguage: "DEP helps your perfume last longer by slowing evaporation. It can interfere with hormone signaling.",
  },
  {
    name: "DBP",
    fullName: "Dibutyl phthalate",
    category: "phthalates",
    roleInPerfume: "Fixative that binds fragrance to skin and slows scent release.",
    risks: [
      "Endocrine disruption",
      "Male reproductive toxicity",
      "Fetal developmental harm",
    ],
    affectedSystems: ["endocrine", "neurological", "liver"],
    regulatoryNotes: "EU-restricted: banned in cosmetics (EU Regulation 1223/2009, Annex II). Classified as toxic to reproduction (CMR Category 1B).",
    plainLanguage: "DBP is banned in EU cosmetics due to reproductive toxicity risks.",
  },
  {
    name: "DMP",
    fullName: "Dimethyl phthalate",
    category: "phthalates",
    roleInPerfume: "Solvent used to dissolve and stabilize fragrance oils.",
    risks: [
      "Mild endocrine disruption",
      "Skin and eye irritation at high concentrations",
    ],
    affectedSystems: ["endocrine", "skin"],
    regulatoryNotes: "Not specifically EU-restricted in cosmetics. Lower toxicity profile than DBP/DEHP.",
    plainLanguage: "DMP dissolves fragrance oils. It has milder effects than other phthalates but still shows endocrine activity.",
  },
  {
    name: "DiBP",
    fullName: "Diisobutyl phthalate",
    category: "phthalates",
    roleInPerfume: "Fixative used as an alternative to DBP in some formulations.",
    risks: [
      "Endocrine disruption",
      "Male reproductive harm",
      "Developmental toxicity",
    ],
    affectedSystems: ["endocrine", "neurological"],
    regulatoryNotes: "EU-restricted: classified as toxic to reproduction (CMR Category 1B). Included in REACH SVHC candidate list.",
    plainLanguage: "DiBP is a DBP substitute with similar reproductive toxicity concerns. Restricted in the EU.",
  },
  {
    name: "DEHP",
    fullName: "Di(2-ethylhexyl) phthalate",
    category: "phthalates",
    roleInPerfume: "Plasticizer occasionally found as a contaminant in fragrance packaging or formulations.",
    risks: [
      "Strong endocrine disruption",
      "Male reproductive toxicity",
      "Fetal neurological harm",
      "Liver toxicity",
    ],
    affectedSystems: ["endocrine", "neurological", "liver"],
    regulatoryNotes: "EU-restricted: banned in cosmetics. IARC Group 2B (possibly carcinogenic). REACH Authorization required.",
    plainLanguage: "DEHP is one of the most studied and restricted phthalates due to strong evidence of reproductive and developmental harm.",
  },

  // --- Aldehydes ---
  {
    name: "Acetaldehyde",
    fullName: "Acetaldehyde",
    category: "aldehydes",
    roleInPerfume: "Contributes fruity, ethereal top notes and enhances scent projection.",
    risks: [
      "Respiratory tract irritation",
      "Possible carcinogen",
      "Central nervous system effects at high exposure",
    ],
    affectedSystems: ["respiratory", "neurological"],
    regulatoryNotes: "IARC Group 2B (possibly carcinogenic to humans). Not specifically restricted in EU cosmetics at typical fragrance levels.",
    plainLanguage: "Acetaldehyde adds fruity brightness to perfume. It irritates airways and is classified as a possible carcinogen.",
  },
  {
    name: "Formaldehyde",
    fullName: "Formaldehyde",
    category: "aldehydes",
    roleInPerfume: "Not intentionally added but can form as a degradation product or secondary pollutant when terpenes react with ozone.",
    risks: [
      "Known human carcinogen",
      "Severe respiratory irritation",
      "Skin sensitization",
      "Asthma exacerbation",
    ],
    affectedSystems: ["respiratory", "skin", "immune"],
    regulatoryNotes: "IARC Group 1 (carcinogenic to humans). EU-restricted: banned as intentional ingredient in cosmetics; limits on formaldehyde-releasing preservatives.",
    plainLanguage: "Formaldehyde is a known carcinogen. It's not added to perfume directly but can form when terpenes in your fragrance react with indoor air.",
  },
  {
    name: "Hydroxycitronellal",
    fullName: "Hydroxycitronellal",
    category: "aldehydes",
    roleInPerfume: "Provides lily-of-the-valley and linden blossom floral notes.",
    risks: [
      "Skin sensitization and allergic contact dermatitis",
      "Respiratory irritation in sensitive individuals",
    ],
    affectedSystems: ["skin", "respiratory"],
    regulatoryNotes: "EU-regulated: must be declared on label above 0.001% in leave-on products. Listed as one of the 26 EU allergens.",
    plainLanguage: "Hydroxycitronellal creates floral scent notes. It's a known skin allergen that must be declared on EU product labels.",
  },

  // --- Parabens ---
  {
    name: "Methylparaben",
    fullName: "Methylparaben",
    category: "parabens",
    roleInPerfume: "Preservative that prevents bacterial and fungal growth in the formulation.",
    risks: [
      "Weak estrogenic activity",
      "Potential link to breast cancer (research ongoing)",
      "Skin sensitization in some individuals",
    ],
    affectedSystems: ["endocrine", "skin"],
    regulatoryNotes: "EU-permitted with concentration limits (0.4% single / 0.8% total parabens). Under ongoing safety review by SCCS.",
    plainLanguage: "Methylparaben prevents your perfume from spoiling. It shows weak estrogen-like activity in lab studies.",
  },
  {
    name: "Ethylparaben",
    fullName: "Ethylparaben",
    category: "parabens",
    roleInPerfume: "Preservative used alone or in combination with other parabens.",
    risks: [
      "Weak estrogenic activity",
      "Potential endocrine disruption",
    ],
    affectedSystems: ["endocrine"],
    regulatoryNotes: "EU-permitted with concentration limits. Similar regulatory status to methylparaben.",
    plainLanguage: "Ethylparaben is a preservative with mild estrogen-mimicking properties.",
  },
  {
    name: "Propylparaben",
    fullName: "Propylparaben",
    category: "parabens",
    roleInPerfume: "Preservative with stronger antimicrobial action than shorter-chain parabens.",
    risks: [
      "Moderate estrogenic activity",
      "Linked to reproductive effects in animal studies",
      "Potential breast cancer link",
    ],
    affectedSystems: ["endocrine", "skin"],
    regulatoryNotes: "EU-restricted: maximum 0.14% (as acid). Banned in leave-on products for children under 3 (diaper area).",
    plainLanguage: "Propylparaben has stronger estrogen-like effects than methylparaben. The EU restricts it more tightly.",
  },
  {
    name: "Butylparaben",
    fullName: "Butylparaben",
    category: "parabens",
    roleInPerfume: "Preservative with broad-spectrum antimicrobial properties.",
    risks: [
      "Strongest estrogenic activity among common parabens",
      "Reproductive and developmental effects in animal studies",
      "Linked to breast cancer cell proliferation in vitro",
    ],
    affectedSystems: ["endocrine", "skin"],
    regulatoryNotes: "EU-restricted: maximum 0.14% (as acid). Banned in leave-on products for children under 3 (diaper area). Some countries considering full bans.",
    plainLanguage: "Butylparaben has the strongest estrogen-like effects of common parabens. The EU restricts its use.",
  },

  // --- Synthetic Musks ---
  {
    name: "Nitro musks",
    fullName: "Nitro musks (musk xylene, musk ketone)",
    category: "synthetic_musks",
    roleInPerfume: "Provide a warm, powdery musk base note at low cost.",
    risks: [
      "Estrogenic activity",
      "Bioaccumulation in human adipose tissue",
      "Phototoxicity (skin damage when exposed to sunlight)",
      "Potential neurotoxicity",
    ],
    affectedSystems: ["endocrine", "skin", "neurological", "liver"],
    regulatoryNotes: "EU-restricted: musk xylene limited to 1% in fine fragrance; musk ambrette and musk tibetene banned entirely.",
    plainLanguage: "Nitro musks create warm base notes. They accumulate in body fat over time and have estrogen-like effects.",
  },
  {
    name: "Galaxolide",
    fullName: "Galaxolide (HHCB)",
    category: "synthetic_musks",
    roleInPerfume: "The most widely used polycyclic musk, providing a clean, sweet musk scent.",
    risks: [
      "Weak estrogenic and anti-androgenic activity",
      "Bioaccumulation in human tissue and breast milk",
      "Environmental persistence in waterways",
    ],
    affectedSystems: ["endocrine", "immune"],
    regulatoryNotes: "Not currently EU-restricted but under environmental review. Detected in human blood, breast milk, and adipose tissue.",
    plainLanguage: "Galaxolide is the most common synthetic musk. It accumulates in body tissue and has been found in breast milk.",
  },
  {
    name: "Tonalide",
    fullName: "Tonalide (AHTN)",
    category: "synthetic_musks",
    roleInPerfume: "Polycyclic musk providing a warm, sweet, musky base.",
    risks: [
      "Estrogenic activity",
      "Bioaccumulation in adipose tissue",
      "Environmental persistence",
    ],
    affectedSystems: ["endocrine", "liver"],
    regulatoryNotes: "Not currently EU-restricted but monitored. Found bioaccumulated in human tissue studies.",
    plainLanguage: "Tonalide provides a warm musk base. Like galaxolide, it accumulates in body fat over time.",
  },

  // --- Reactive Terpenes ---
  {
    name: "Limonene",
    fullName: "D-Limonene",
    category: "reactive_terpenes",
    roleInPerfume: "Provides bright citrus top notes. One of the most common fragrance ingredients.",
    risks: [
      "Contact allergen (oxidized form)",
      "Reacts with indoor ozone to produce formaldehyde and secondary organic aerosols",
      "Respiratory irritation from reaction byproducts",
    ],
    affectedSystems: ["skin", "respiratory"],
    regulatoryNotes: "EU-regulated: must be declared on label above 0.001% in leave-on products. IFRA restricted. Ozone reactivity is the primary indoor concern.",
    plainLanguage: "Limonene gives citrus scent. It's not directly harmful, but reacts with indoor air to form formaldehyde and other irritants.",
  },
  {
    name: "Alpha-pinene",
    fullName: "Alpha-pinene",
    category: "reactive_terpenes",
    roleInPerfume: "Contributes fresh, pine-like, woody top notes.",
    risks: [
      "Reacts with indoor ozone to produce formaldehyde and secondary organic aerosols",
      "Respiratory irritation from reaction products",
    ],
    affectedSystems: ["respiratory"],
    regulatoryNotes: "Not specifically EU-restricted in cosmetics. Indoor air quality concern due to ozone reactivity.",
    plainLanguage: "Alpha-pinene adds pine freshness. Like limonene, it reacts with indoor ozone to form secondary pollutants.",
  },
  {
    name: "Beta-pinene",
    fullName: "Beta-pinene",
    category: "reactive_terpenes",
    roleInPerfume: "Provides fresh, woody, herbal character. Often co-occurs with alpha-pinene.",
    risks: [
      "Reacts with indoor ozone to produce formaldehyde and secondary organic aerosols",
      "Respiratory irritation from reaction products",
    ],
    affectedSystems: ["respiratory"],
    regulatoryNotes: "Not specifically EU-restricted in cosmetics. Indoor air quality concern due to ozone reactivity.",
    plainLanguage: "Beta-pinene adds herbal-woody notes. It reacts with indoor ozone similarly to alpha-pinene.",
  },
];

// Helper: get chemical by name (case-insensitive)
export function getChemicalByName(name) {
  return CHEMICAL_DATABASE.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

// Helper: get all chemicals in a category
export function getChemicalsByCategory(category) {
  return CHEMICAL_DATABASE.filter((c) => c.category === category);
}

// Helper: get category info
export function getCategoryInfo(categoryId) {
  return CHEMICAL_CATEGORIES[categoryId] || null;
}

// Map existing perfume boolean flags to specific chemicals present
// Returns array of chemical objects that are flagged for a given perfume
export function getFlaggedChemicals(perfume) {
  if (!perfume?.ingredients) return [];

  const flagged = [];

  if (perfume.ingredients.phthalates) {
    // When manufacturer only discloses "phthalates" generically, flag DEP as most common
    flagged.push({
      ...getChemicalByName("DEP"),
      detectionMethod: "manufacturer_disclosure",
    });
  }

  if (perfume.ingredients.parabens) {
    flagged.push({
      ...getChemicalByName("Methylparaben"),
      detectionMethod: "manufacturer_disclosure",
    });
    flagged.push({
      ...getChemicalByName("Propylparaben"),
      detectionMethod: "manufacturer_disclosure",
    });
  }

  if (perfume.ingredients.synthetic_musks) {
    flagged.push({
      ...getChemicalByName("Galaxolide"),
      detectionMethod: "manufacturer_disclosure",
    });
  }

  // Check VOCs for reactive terpenes
  const reactiveTerpeneNames = ["Limonene", "Alpha-pinene", "Beta-pinene"];
  (perfume.ingredients.vocs || []).forEach((voc) => {
    const match = reactiveTerpeneNames.find(
      (t) => t.toLowerCase() === voc.toLowerCase()
    );
    if (match) {
      flagged.push({
        ...getChemicalByName(match),
        detectionMethod: "ingredient_list",
      });
    }
  });

  return flagged;
}

// Calculate health risk tier for a perfume
export function calculateRiskTier(perfume) {
  if (!perfume?.ingredients) return "unknown";

  const flagged = getFlaggedChemicals(perfume);
  if (flagged.length === 0) return "low";

  let riskScore = 0;
  const categoriesSeen = new Set();

  flagged.forEach((chemical) => {
    const catInfo = CHEMICAL_CATEGORIES[chemical.category];
    if (catInfo) {
      riskScore += catInfo.severityWeight;
      categoriesSeen.add(chemical.category);
    }
  });

  // More distinct categories = higher risk (cumulative exposure concern)
  riskScore += (categoriesSeen.size - 1) * 2;

  if (riskScore >= 8) return "high";
  if (riskScore >= 4) return "moderate";
  return "low";
}

// Calculate ingredient transparency score (0-100)
export function getTransparencyScore(perfume) {
  if (!perfume?.ingredients) return 0;

  let score = 30; // Base: at least some data exists

  const ing = perfume.ingredients;

  // VOC list provided (specific compounds named)
  if (ing.vocs && ing.vocs.length > 0) score += 25;

  // Explicit phthalate/paraben/musk disclosure (even if true, they disclosed it)
  if (typeof ing.phthalates === "boolean") score += 10;
  if (typeof ing.parabens === "boolean") score += 10;
  if (typeof ing.synthetic_musks === "boolean") score += 10;

  // Naturally derived percentage known
  if (typeof ing.naturally_derived_percentage === "number") score += 10;

  // Cruelty-free / vegan claims require some level of ingredient knowledge
  if (typeof ing.cruelty_free === "boolean") score += 3;
  if (typeof ing.vegan === "boolean") score += 2;

  return Math.min(100, score);
}

// Get affected body systems for a perfume (deduplicated)
export function getAffectedSystems(perfume) {
  const flagged = getFlaggedChemicals(perfume);
  const systemIds = new Set();
  flagged.forEach((c) => {
    (c.affectedSystems || []).forEach((s) => systemIds.add(s));
  });
  return [...systemIds].map((id) => BODY_SYSTEMS[id]).filter(Boolean);
}

// Disclaimer text
export const HEALTH_DISCLAIMER =
  "This information is for educational awareness only and does not constitute medical advice. Consult a healthcare professional for personal health concerns. Chemical exposure effects depend on concentration, duration, and individual sensitivity.";

export const FRAGRANCE_LABEL_WARNING =
  "This perfume lists 'fragrance' as an ingredient, which can hide dozens of undisclosed chemicals. Research shows fewer than 3% of hazardous VOCs in products are disclosed on labels.";
