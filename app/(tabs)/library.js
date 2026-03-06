import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { searchPerfumes, getAllPerfumes, getCleanerAlternatives } from "../../services/perfumeService";
import { getPerfumeFlags, getSustainabilityScore, VOC_INFO } from "../../data/ingredientFlags";

const SEVERITY_COLORS = {
  high: { bg: "#F2E0D8", text: "#9E5C46" },
  moderate: { bg: "#F2E5D8", text: "#9E7C56" },
  low: { bg: "#E8E6EC", text: "#6B6878" },
};

function PerfumeBottle({ color }) {
  return (
    <View style={[styles.bottlePlaceholder, { backgroundColor: color + "20" }]}>
      <View style={[styles.bottleCap, { backgroundColor: color }]} />
      <View style={[styles.bottleBody, { backgroundColor: color + "40" }]}>
        <View style={[styles.bottleLabel, { backgroundColor: color + "60" }]} />
      </View>
    </View>
  );
}

function PerfumeDetail({ perfume, onClose, onAdd, inLibrary }) {
  const flags = getPerfumeFlags(perfume);
  const score = getSustainabilityScore(perfume);
  const alternatives = flags.length > 0 ? getCleanerAlternatives(perfume.id) : [];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.modalTop}>
            <PerfumeBottle color={perfume.bottleColor || "#CCC"} />
            <Text style={styles.modalBrand}>{perfume.brand}</Text>
            <Text style={styles.modalName}>{perfume.name}</Text>
            {perfume.description && (
              <Text style={styles.modalDescription}>{perfume.description}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            {perfume.notes_top?.length > 0 && (
              <View style={styles.noteRow}>
                <Text style={styles.noteLabel}>Top</Text>
                <Text style={styles.noteValues}>{perfume.notes_top.join(", ")}</Text>
              </View>
            )}
            {perfume.notes_middle?.length > 0 && (
              <View style={styles.noteRow}>
                <Text style={styles.noteLabel}>Heart</Text>
                <Text style={styles.noteValues}>{perfume.notes_middle.join(", ")}</Text>
              </View>
            )}
            {perfume.notes_base?.length > 0 && (
              <View style={styles.noteRow}>
                <Text style={styles.noteLabel}>Base</Text>
                <Text style={styles.noteValues}>{perfume.notes_base.join(", ")}</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{perfume.longevity || "--"}</Text>
              <Text style={styles.statLabel}>Longevity</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{perfume.sillage || "--"}</Text>
              <Text style={styles.statLabel}>Sillage</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Eco score</Text>
            </View>
          </View>

          {/* Ingredient flags */}
          {flags.length > 0 && (
            <View style={styles.flagsSection}>
              <Text style={styles.flagsSectionTitle}>Ingredient alerts</Text>
              {flags.map((flag, i) => {
                const colors = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.low;
                return (
                  <View key={i} style={[styles.flagCard, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.flagLabel, { color: colors.text }]}>{flag.label}</Text>
                    <Text style={styles.flagDescription}>{flag.description}</Text>
                    <Text style={styles.flagTip}>{flag.tip}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* VOC details */}
          {perfume.ingredients?.vocs?.length > 0 && (
            <View style={styles.flagsSection}>
              <Text style={styles.flagsSectionTitle}>VOC compounds detected</Text>
              {perfume.ingredients.vocs.map((voc, i) => {
                const info = VOC_INFO[voc];
                return (
                  <View key={i} style={styles.vocItem}>
                    <Text style={styles.vocName}>{voc}</Text>
                    <Text style={styles.vocDesc}>{info?.description || "No data available."}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Cleaner alternatives */}
          {alternatives.length > 0 && (
            <View style={styles.flagsSection}>
              <Text style={styles.flagsSectionTitle}>Cleaner alternatives</Text>
              {alternatives.map((alt) => (
                <View key={alt.id} style={styles.altCard}>
                  <PerfumeBottle color={alt.bottleColor || "#CCC"} />
                  <View style={styles.altInfo}>
                    <Text style={styles.altBrand}>{alt.brand}</Text>
                    <Text style={styles.altName}>{alt.name}</Text>
                    <Text style={styles.altScore}>
                      {alt.ingredients.naturally_derived_percentage}% naturally derived
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add/Remove button */}
          <Pressable
            style={[styles.addButton, inLibrary && styles.removeButton]}
            onPress={() => onAdd(perfume)}
          >
            <Text style={[styles.addButtonText, inLibrary && styles.removeButtonText]}>
              {inLibrary ? "Remove from library" : "Add to my library"}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function LibraryScreen() {
  const { state, dispatch, getLibraryPerfumes } = useApp();
  const [query, setQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const libraryPerfumes = getLibraryPerfumes();
  const libraryIds = state.library.map((l) => l.perfumeId);

  const results = query.length >= 2 ? searchPerfumes(query) : [];
  const showSearch = query.length >= 2;

  const handleAddRemove = (perfume) => {
    if (libraryIds.includes(perfume.id)) {
      dispatch({ type: "REMOVE_FROM_LIBRARY", perfumeId: perfume.id });
    } else {
      dispatch({ type: "ADD_TO_LIBRARY", perfumeId: perfume.id });
    }
    setSelectedPerfume(null);
  };

  const displayList = showSearch ? results : libraryPerfumes;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfume Library</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.tabInactive} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search perfumes..."
            placeholderTextColor={COLORS.tabInactive}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.tabInactive} />
            </Pressable>
          )}
        </View>

        {showSearch && (
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Text>
        )}

        {!showSearch && (
          <Text style={styles.sectionLabel}>Your collection ({libraryPerfumes.length})</Text>
        )}

        {displayList.map((perfume) => {
          const inLib = libraryIds.includes(perfume.id);
          const flags = getPerfumeFlags(perfume);
          return (
            <Pressable
              key={perfume.id}
              style={styles.card}
              onPress={() => setSelectedPerfume(perfume)}
            >
              <PerfumeBottle color={perfume.bottleColor || "#CCC"} />
              <View style={styles.cardContent}>
                <Text style={styles.brandName}>{perfume.brand}</Text>
                <Text style={styles.perfumeName}>{perfume.name}</Text>
                <View style={styles.tagsRow}>
                  {inLib && (
                    <View style={[styles.tag, { backgroundColor: "#E8EDE5" }]}>
                      <Text style={[styles.tagText, { color: "#5C6B52" }]}>in library</Text>
                    </View>
                  )}
                  {flags.length > 0 && (
                    <View style={[styles.tag, { backgroundColor: "#F2E5D8" }]}>
                      <Text style={[styles.tagText, { color: "#9E7C56" }]}>
                        {flags.length} alert{flags.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                  {perfume.longevity && (
                    <View style={[styles.tag, { backgroundColor: "#E8E6EC" }]}>
                      <Text style={[styles.tagText, { color: "#6B6878" }]}>{perfume.longevity}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable
                style={styles.heartButton}
                onPress={() => {
                  if (inLib) {
                    dispatch({ type: "REMOVE_FROM_LIBRARY", perfumeId: perfume.id });
                  } else {
                    dispatch({ type: "ADD_TO_LIBRARY", perfumeId: perfume.id });
                  }
                }}
                hitSlop={10}
              >
                <Ionicons
                  name={inLib ? "heart" : "heart-outline"}
                  size={20}
                  color={inLib ? COLORS.dustyRose : COLORS.tabInactive}
                />
              </Pressable>
            </Pressable>
          );
        })}

        {showSearch && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No perfumes found for "{query}"</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedPerfume && (
        <PerfumeDetail
          perfume={selectedPerfume}
          onClose={() => setSelectedPerfume(null)}
          onAdd={handleAddRemove}
          inLibrary={libraryIds.includes(selectedPerfume.id)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    shadowColor: "#C8C2B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  resultCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  bottlePlaceholder: {
    width: 65,
    height: 80,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bottleCap: {
    width: 14,
    height: 12,
    borderRadius: 3,
    marginBottom: 2,
  },
  bottleBody: {
    width: 36,
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bottleLabel: {
    width: 22,
    height: 14,
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  brandName: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  perfumeName: {
    fontSize: 17,
    color: COLORS.text,
    marginTop: 1,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "400",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Modal styles
  modalSafe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalTop: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalBrand: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 12,
  },
  modalName: {
    fontFamily: FONTS.title,
    fontSize: 26,
    color: COLORS.text,
    marginTop: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 16,
  },

  // Notes
  notesSection: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  noteRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  noteLabel: {
    width: 50,
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    paddingTop: 2,
  },
  noteValues: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 16,
    alignItems: "center",
    ...SHADOWS.neumorphicLight,
  },
  statValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.tabInactive,
    marginTop: 4,
  },

  // Flags
  flagsSection: {
    marginBottom: 16,
  },
  flagsSectionTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  flagCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  flagLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  flagTip: {
    fontSize: 12,
    color: COLORS.tabInactive,
    marginTop: 6,
    fontStyle: "italic",
  },
  vocItem: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.neumorphicLight,
  },
  vocName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  vocDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Alternatives
  altCard: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    ...SHADOWS.neumorphicLight,
  },
  altInfo: {
    flex: 1,
  },
  altBrand: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  altName: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 1,
  },
  altScore: {
    fontSize: 12,
    color: "#5C6B52",
    marginTop: 3,
  },

  // Add button
  addButton: {
    backgroundColor: COLORS.mutedGreen,
    borderRadius: 36,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.tagBorder,
  },
  removeButtonText: {
    color: COLORS.textSecondary,
  },
});
