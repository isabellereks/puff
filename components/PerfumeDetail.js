import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "./theme";
import { getCleanerAlternatives } from "../services/perfumeService";
import { getPerfumeFlags, getSustainabilityScore, VOC_INFO } from "../data/ingredientFlags";
import PerfumeBottle from "./PerfumeBottle";

const SEVERITY_COLORS = {
  high: { bg: "#F2E0D8", text: "#9E5C46" },
  moderate: { bg: "#F2E5D8", text: "#9E7C56" },
  low: { bg: "#E8E6EC", text: "#6B6878" },
};

export default function PerfumeDetail({ perfume, onClose, onAdd, inLibrary }) {
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

const styles = StyleSheet.create({
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
