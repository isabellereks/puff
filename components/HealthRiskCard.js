import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "./theme";
import {
  getFlaggedChemicals,
  calculateRiskTier,
  getTransparencyScore,
  getAffectedSystems,
  HEALTH_DISCLAIMER,
  FRAGRANCE_LABEL_WARNING,
} from "../data/chemicalDatabase";
import { getPersonalizedNotes, isSystemHighlighted } from "../data/sensitivityProfile";
import { EDUCATIONAL_CONTENT, getContentForContext } from "../data/educationalContent";

const TIER_CONFIG = {
  low: { label: "Low Risk", color: "#5C6B4F", bg: "#E8EDE5", icon: "checkmark-circle-outline" },
  moderate: { label: "Moderate Risk", color: "#B89060", bg: "#F0E8DF", icon: "alert-circle-outline" },
  high: { label: "High Risk", color: "#9E5C46", bg: "#F2E0D8", icon: "warning-outline" },
  unknown: { label: "Unknown", color: "#7A7A7A", bg: "#F0EDE8", icon: "help-circle-outline" },
};

const NOTE_TYPE_COLORS = {
  warning: { bg: "#F2E0D8", text: "#9E5C46", icon: "warning-outline" },
  caution: { bg: "#F0E8DF", text: "#B89060", icon: "alert-circle-outline" },
  info: { bg: "#E8EDE5", text: "#5C6B4F", icon: "information-circle-outline" },
};

export default function HealthRiskCard({ perfume, sensitivityProfile }) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [expandedContent, setExpandedContent] = useState(null);

  const flagged = getFlaggedChemicals(perfume);
  const riskTier = calculateRiskTier(perfume);
  const transparency = getTransparencyScore(perfume);
  const affectedSystems = getAffectedSystems(perfume);
  const personalizedNotes = getPersonalizedNotes(flagged, sensitivityProfile);
  const tier = TIER_CONFIG[riskTier];
  const relevantContent = getContentForContext("perfume_card");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Health risk overview</Text>
        <Pressable onPress={() => setShowDisclaimer(!showDisclaimer)} hitSlop={10}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.tabInactive} />
        </Pressable>
      </View>

      {showDisclaimer && (
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>{HEALTH_DISCLAIMER}</Text>
        </View>
      )}

      {/* Risk Tier Badge */}
      <View style={[styles.tierBadge, { backgroundColor: tier.bg }]}>
        <Ionicons name={tier.icon} size={18} color={tier.color} />
        <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
      </View>

      {/* Personalized Notes (profile-specific warnings) */}
      {personalizedNotes.length > 0 && (
        <View style={styles.personalizedSection}>
          {personalizedNotes.map((note, i) => {
            const noteStyle = NOTE_TYPE_COLORS[note.type] || NOTE_TYPE_COLORS.info;
            return (
              <View key={i} style={[styles.personalNote, { backgroundColor: noteStyle.bg }]}>
                <Ionicons name={noteStyle.icon} size={15} color={noteStyle.text} style={{ marginTop: 1 }} />
                <Text style={[styles.personalNoteText, { color: noteStyle.text }]}>{note.text}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Flagged Chemicals */}
      {flagged.length > 0 && (
        <View style={styles.flaggedSection}>
          <Text style={styles.subTitle}>Flagged chemicals</Text>
          {flagged.map((chemical, i) => (
            <View key={i} style={styles.chemicalCard}>
              <View style={styles.chemicalHeader}>
                <Text style={styles.chemicalName}>{chemical.name}</Text>
                <Text style={styles.chemicalCategory}>
                  {chemical.category.replace(/_/g, " ")}
                </Text>
              </View>
              <Text style={styles.chemicalExplain}>{chemical.plainLanguage}</Text>
            </View>
          ))}
        </View>
      )}

      {flagged.length === 0 && riskTier !== "unknown" && (
        <View style={styles.cleanCard}>
          <Ionicons name="leaf-outline" size={16} color="#5C6B4F" />
          <Text style={styles.cleanText}>
            No flagged chemicals detected in disclosed ingredients.
          </Text>
        </View>
      )}

      {/* Affected Body Systems */}
      {affectedSystems.length > 0 && (
        <View style={styles.systemsSection}>
          <Text style={styles.subTitle}>Affected body systems</Text>
          <View style={styles.systemTags}>
            {affectedSystems.map((system) => {
              const highlighted = isSystemHighlighted(system.id, sensitivityProfile);
              return (
                <View
                  key={system.id}
                  style={[styles.systemTag, highlighted && styles.systemTagHighlighted]}
                >
                  <Ionicons
                    name={system.icon}
                    size={13}
                    color={highlighted ? "#9E5C46" : COLORS.textSecondary}
                  />
                  <Text
                    style={[styles.systemTagText, highlighted && styles.systemTagTextHighlighted]}
                  >
                    {system.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Ingredient Transparency */}
      <View style={styles.transparencySection}>
        <Text style={styles.subTitle}>Ingredient transparency</Text>
        <View style={styles.transparencyBar}>
          <View style={[styles.transparencyFill, { width: `${transparency}%` }]} />
        </View>
        <Text style={styles.transparencyValue}>{transparency}% disclosed</Text>
        {transparency < 60 && (
          <Text style={styles.transparencyWarning}>{FRAGRANCE_LABEL_WARNING}</Text>
        )}
      </View>

      {/* Regulatory Notes */}
      {flagged.some((c) => c.regulatoryNotes) && (
        <View style={styles.regulatorySection}>
          <Text style={styles.subTitle}>Regulatory notes</Text>
          {flagged
            .filter((c) => c.regulatoryNotes)
            .map((c, i) => (
              <View key={i} style={styles.regulatoryItem}>
                <Text style={styles.regulatoryName}>{c.name}:</Text>
                <Text style={styles.regulatoryNote}>{c.regulatoryNotes}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Educational Links */}
      {relevantContent.length > 0 && (
        <View style={styles.eduSection}>
          {relevantContent.map((content) => (
            <Pressable
              key={content.id}
              style={styles.eduLink}
              onPress={() =>
                setExpandedContent(expandedContent === content.id ? null : content.id)
              }
            >
              <View style={styles.eduLinkRow}>
                <Ionicons name="book-outline" size={14} color={COLORS.tabActive} />
                <Text style={styles.eduQuestion}>{content.question}</Text>
                <Ionicons
                  name={expandedContent === content.id ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={COLORS.tabInactive}
                />
              </View>
              {expandedContent === content.id && (
                <Text style={styles.eduAnswer}>{content.answer}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  disclaimerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.neumorphicLight,
  },
  disclaimerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontStyle: "italic",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 36,
    gap: 8,
    marginBottom: 12,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  personalizedSection: {
    gap: 6,
    marginBottom: 12,
  },
  personalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 20,
    gap: 8,
  },
  personalNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  flaggedSection: {
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chemicalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.neumorphicLight,
  },
  chemicalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chemicalName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  chemicalCategory: {
    fontSize: 10,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  chemicalExplain: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  cleanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    gap: 10,
    marginBottom: 12,
    ...SHADOWS.neumorphicLight,
  },
  cleanText: {
    flex: 1,
    fontSize: 12,
    color: "#5C6B4F",
    lineHeight: 17,
  },
  systemsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.neumorphicLight,
  },
  systemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  systemTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tagBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 5,
  },
  systemTagHighlighted: {
    backgroundColor: "#F2E0D8",
    borderWidth: 1,
    borderColor: "#E0C8BC",
  },
  systemTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  systemTagTextHighlighted: {
    color: "#9E5C46",
    fontWeight: "500",
  },
  transparencySection: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.neumorphicLight,
  },
  transparencyBar: {
    height: 6,
    backgroundColor: "#E8E4DE",
    borderRadius: 3,
    marginBottom: 6,
  },
  transparencyFill: {
    height: 6,
    backgroundColor: "#5C6B4F",
    borderRadius: 3,
  },
  transparencyValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transparencyWarning: {
    fontSize: 11,
    color: "#B89060",
    lineHeight: 16,
    marginTop: 8,
    fontStyle: "italic",
  },
  regulatorySection: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.neumorphicLight,
  },
  regulatoryItem: {
    marginBottom: 8,
  },
  regulatoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
  regulatoryNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  eduSection: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    marginBottom: 8,
    ...SHADOWS.neumorphicLight,
  },
  eduLink: {
    backgroundColor: COLORS.tagBg,
    borderRadius: 20,
    padding: 12,
    marginBottom: 6,
  },
  eduLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eduQuestion: {
    flex: 1,
    fontSize: 12,
    color: COLORS.tabActive,
  },
  eduAnswer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.tagBorder,
  },
});
