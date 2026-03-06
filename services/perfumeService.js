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

export function getAllBrands() {
  const brands = [...new Set(PERFUME_DATABASE.map((p) => p.brand))];
  return brands.sort();
}
