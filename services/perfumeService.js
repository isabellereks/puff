// Perfume lookup service
// Currently uses local database, can be swapped for PerfumAPI calls

import PERFUME_DATABASE from "../data/perfumeDatabase";

export function searchPerfumes(query, limit = 20) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return PERFUME_DATABASE.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function getPerfumeById(id) {
  return PERFUME_DATABASE.find((p) => p.id === id) || null;
}

export function getAllPerfumes() {
  return PERFUME_DATABASE;
}

export function getPerfumesByBrand(brand) {
  return PERFUME_DATABASE.filter(
    (p) => p.brand.toLowerCase() === brand.toLowerCase()
  );
}

export function getCleanerAlternatives(perfumeId) {
  const perfume = getPerfumeById(perfumeId);
  if (!perfume) return [];

  return PERFUME_DATABASE.filter(
    (p) =>
      p.id !== perfumeId &&
      p.ingredients &&
      !p.ingredients.phthalates &&
      !p.ingredients.parabens &&
      p.ingredients.naturally_derived_percentage > 70
  ).slice(0, 3);
}

// Enhanced cleaner alternatives with specific chemical avoidance reasoning
export function getTargetedAlternatives(perfumeId) {
  const perfume = getPerfumeById(perfumeId);
  if (!perfume?.ingredients) return { alternatives: [], reasons: [] };

  const reasons = [];
  const filters = [];

  if (perfume.ingredients.phthalates) {
    reasons.push({
      chemical: "DEP",
      category: "phthalate",
      role: "fixative",
      message: "Your perfume contains phthalates (used as fixatives to make scent last). Here are alternatives that don't use phthalate fixatives.",
    });
    filters.push((p) => !p.ingredients.phthalates);
  }

  if (perfume.ingredients.parabens) {
    reasons.push({
      chemical: "Parabens",
      category: "paraben",
      role: "preservative",
      message: "Your perfume contains parabens (preservatives with estrogenic activity). Here are paraben-free alternatives.",
    });
    filters.push((p) => !p.ingredients.parabens);
  }

  if (perfume.ingredients.synthetic_musks) {
    reasons.push({
      chemical: "Synthetic musks",
      category: "synthetic_musk",
      role: "fragrance base",
      message: "Your perfume contains synthetic musks (which bioaccumulate in tissue). Here are alternatives using plant-based musk.",
    });
    filters.push((p) => !p.ingredients.synthetic_musks);
  }

  if (filters.length === 0) return { alternatives: [], reasons: [] };

  // Score scent family similarity
  const perfumeNotes = [
    ...(perfume.notes_top || []),
    ...(perfume.notes_middle || []),
    ...(perfume.notes_base || []),
  ].map((n) => n.toLowerCase());

  const candidates = PERFUME_DATABASE.filter((p) => {
    if (p.id === perfumeId) return false;
    if (!p.ingredients) return false;
    return filters.every((f) => f(p));
  });

  // Rank by scent similarity
  const scored = candidates.map((p) => {
    const pNotes = [
      ...(p.notes_top || []),
      ...(p.notes_middle || []),
      ...(p.notes_base || []),
    ].map((n) => n.toLowerCase());

    const overlap = perfumeNotes.filter((n) => pNotes.includes(n)).length;
    const similarity = perfumeNotes.length > 0 ? overlap / perfumeNotes.length : 0;

    return { ...p, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  return {
    alternatives: scored.slice(0, 3),
    reasons,
  };
}

export function getAllBrands() {
  const brands = [...new Set(PERFUME_DATABASE.map((p) => p.brand))];
  return brands.sort();
}
