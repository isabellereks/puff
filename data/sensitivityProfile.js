// User sensitivity and life-stage profile definitions
// Used to personalize health alerts and risk thresholds

export const HEALTH_SENSITIVITIES = [
  { id: "asthma", label: "Asthma", icon: "cloud-outline", affectedSystems: ["respiratory"] },
  { id: "migraines", label: "Migraines", icon: "flash-outline", affectedSystems: ["neurological"] },
  { id: "eczema", label: "Eczema / Dermatitis", icon: "hand-left-outline", affectedSystems: ["skin"] },
  { id: "allergies", label: "Allergies", icon: "flower-outline", affectedSystems: ["immune", "respiratory"] },
  { id: "chemical_sensitivity", label: "Chemical Sensitivity", icon: "warning-outline", affectedSystems: ["respiratory", "neurological", "skin"] },
];

export const LIFE_STAGES = [
  { id: "pregnant", label: "Pregnant", riskFactors: ["endocrine", "neurological"] },
  { id: "breastfeeding", label: "Breastfeeding", riskFactors: ["endocrine"] },
  { id: "neither", label: "Neither", riskFactors: [] },
];

export const AGE_BRACKETS = [
  { id: "child", label: "Child (under 18)", vulnerable: true },
  { id: "adult", label: "Adult (18-64)", vulnerable: false },
  { id: "elderly", label: "Elderly (65+)", vulnerable: true },
];

export const DEFAULT_SENSITIVITY_PROFILE = {
  sensitivities: [],     // array of sensitivity ids
  lifeStage: "neither",
  ageBracket: "adult",
};

// Determine if a specific body system is heightened for this user profile
export function isSystemHighlighted(systemId, profile) {
  if (!profile) return false;

  // Check sensitivities
  const sensitivitiesMatch = (profile.sensitivities || []).some((sensId) => {
    const sens = HEALTH_SENSITIVITIES.find((s) => s.id === sensId);
    return sens?.affectedSystems?.includes(systemId);
  });
  if (sensitivitiesMatch) return true;

  // Check life stage
  const stage = LIFE_STAGES.find((s) => s.id === profile.lifeStage);
  if (stage?.riskFactors?.includes(systemId)) return true;

  return false;
}

// Get adjusted VOC alert threshold (lower = more sensitive)
export function getVocAlertThreshold(profile) {
  let threshold = 70; // default high-intensity threshold

  if (!profile) return threshold;

  if (profile.sensitivities?.includes("asthma")) threshold -= 15;
  if (profile.sensitivities?.includes("chemical_sensitivity")) threshold -= 10;
  if (profile.sensitivities?.includes("migraines")) threshold -= 5;

  if (profile.lifeStage === "pregnant") threshold -= 10;
  if (profile.lifeStage === "breastfeeding") threshold -= 5;

  const ageBracket = AGE_BRACKETS.find((a) => a.id === profile.ageBracket);
  if (ageBracket?.vulnerable) threshold -= 10;

  return Math.max(30, threshold); // never below 30
}

// Get personalized risk notes for a perfume based on profile
export function getPersonalizedNotes(flaggedChemicals, profile) {
  if (!profile || !flaggedChemicals?.length) return [];

  const notes = [];

  const hasEndocrine = flaggedChemicals.some((c) =>
    c.affectedSystems?.includes("endocrine")
  );
  const hasRespiratory = flaggedChemicals.some((c) =>
    c.affectedSystems?.includes("respiratory")
  );
  const hasNeuro = flaggedChemicals.some((c) =>
    c.affectedSystems?.includes("neurological")
  );

  if (profile.lifeStage === "pregnant") {
    if (hasEndocrine) {
      notes.push({
        type: "warning",
        text: "Contains chemicals linked to endocrine disruption. Research specifically flags fetal neurological risk from phthalate and paraben exposure during pregnancy.",
      });
    }
    if (hasNeuro) {
      notes.push({
        type: "warning",
        text: "Contains compounds associated with neurological effects. Extra caution is recommended during pregnancy.",
      });
    }
  }

  if (profile.lifeStage === "breastfeeding" && hasEndocrine) {
    notes.push({
      type: "caution",
      text: "Some synthetic musks and phthalates have been detected in breast milk in research studies. Consider minimizing exposure.",
    });
  }

  if (profile.sensitivities?.includes("asthma") && hasRespiratory) {
    notes.push({
      type: "caution",
      text: "Contains compounds known to irritate airways. You may want to apply in a ventilated area and use fewer sprays.",
    });
  }

  if (profile.sensitivities?.includes("migraines") && hasNeuro) {
    notes.push({
      type: "caution",
      text: "Contains compounds associated with neurological effects that may trigger headaches in sensitive individuals.",
    });
  }

  if (profile.sensitivities?.includes("eczema")) {
    const hasSkin = flaggedChemicals.some((c) =>
      c.affectedSystems?.includes("skin")
    );
    if (hasSkin) {
      notes.push({
        type: "caution",
        text: "Contains known skin sensitizers. Consider a patch test before regular use.",
      });
    }
  }

  const ageBracket = AGE_BRACKETS.find((a) => a.id === profile.ageBracket);
  if (ageBracket?.vulnerable && flaggedChemicals.length > 0) {
    notes.push({
      type: "info",
      text: "Your age group is documented as more vulnerable to chemical exposure. Consider lower-risk alternatives where available.",
    });
  }

  return notes;
}
