// Educational content blocks — plain-language explainers
// Accessible from perfume cards, monthly report, and alerts
// Based on Kazemi et al., 2022 systematic review

export const EDUCATIONAL_CONTENT = [
  {
    id: "why_phthalates",
    question: "Why does my perfume contain phthalates?",
    answer:
      "Phthalates (especially DEP) are used as solvents and fixatives in perfume. They slow evaporation so the scent lasts longer on your skin. They're one of the most common fragrance ingredients, but research has linked them to endocrine disruption and reproductive effects.",
    contexts: ["perfume_card", "monthly_report"],
  },
  {
    id: "fragrance_label",
    question: "What does 'fragrance' on a label actually mean?",
    answer:
      "Manufacturers can list hundreds of chemical ingredients under the single word 'fragrance' or 'parfum' with no disclosure requirement. This is a legal trade-secret exemption. Research shows fewer than 3% of hazardous volatile organic compounds (VOCs) in products are disclosed on labels — even in products marketed as 'green' or 'organic.'",
    contexts: ["perfume_card", "monthly_report"],
  },
  {
    id: "secondhand_scent",
    question: "Can my perfume affect people around me?",
    answer:
      "Yes. Research shows approximately 30% of people report irritation from involuntary exposure to others' fragrances. Common effects include headaches, respiratory difficulty, and skin irritation. Being mindful of fragrance intensity in shared or enclosed spaces can help reduce secondhand scent exposure.",
    contexts: ["monthly_report", "alert"],
  },
  {
    id: "natural_organic_safety",
    question: "Is 'natural' or 'organic' perfume safer?",
    answer:
      "Not necessarily. Research shows that products marketed as 'green,' 'natural,' or 'organic' emit similar types and quantities of hazardous VOCs as conventional products. The label doesn't reliably predict the chemical safety profile. What matters is the actual ingredient analysis, not the marketing claim.",
    contexts: ["perfume_card", "monthly_report"],
  },
  {
    id: "secondary_pollutants",
    question: "What are secondary pollutants?",
    answer:
      "Terpenes in your perfume — like limonene (citrus scent) and pinene (pine scent) — can react with indoor ozone to form formaldehyde and tiny particles called secondary organic aerosols. These reaction products can irritate airways even when the original terpene is harmless on its own. Ventilating the room helps reduce this effect.",
    contexts: ["perfume_card", "alert"],
  },
  {
    id: "vulnerable_populations",
    question: "Are certain people more at risk?",
    answer:
      "Yes. Research documents that people with asthma, pregnant individuals, children, and elderly individuals are more vulnerable to fragrance chemical exposure. During pregnancy, phthalate and paraben exposure has been specifically linked to fetal neurological risk. If you're in a higher-risk group, consider choosing fragrances with fewer flagged chemicals and using fewer sprays.",
    contexts: ["perfume_card", "monthly_report"],
  },
];

// Get content blocks relevant to a specific screen/context
export function getContentForContext(context) {
  return EDUCATIONAL_CONTENT.filter((c) => c.contexts.includes(context));
}

// Get a specific content block by id
export function getContentById(id) {
  return EDUCATIONAL_CONTENT.find((c) => c.id === id) || null;
}
