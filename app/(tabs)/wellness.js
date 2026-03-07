import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, NUMBER_STYLE, SHADOWS } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { getPerfumeById } from "../../services/perfumeService";
import { getPerfumeFlags, getSustainabilityScore, SPRAY_TIPS } from "../../data/ingredientFlags";
import {
  getFlaggedChemicals,
  calculateRiskTier,
  getTransparencyScore,
  CHEMICAL_CATEGORIES,
  HEALTH_DISCLAIMER,
} from "../../data/chemicalDatabase";
import { getVocAlertThreshold } from "../../data/sensitivityProfile";
import { getContentForContext } from "../../data/educationalContent";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH = MONTH_NAMES[new Date().getMonth()];

function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr},${rg},${rb})`;
}

function SustainabilityRing({ score, size = 120 }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const numSegs = 40;
  const totalAngle = (score / 100) * 360;
  const segAngle = totalAngle / numSegs;

  const toXY = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  const getSegColor = (t) => {
    if (t < 0.5) return lerpColor("#7A8E6A", "#C4A860", t / 0.5);
    return lerpColor("#C4A860", "#C49680", (t - 0.5) / 0.5);
  };

  const arcs = [];
  for (let i = 0; i < numSegs; i++) {
    const a1 = i * segAngle;
    const a2 = (i + 1) * segAngle + 0.5;
    const p1 = toXY(a1);
    const p2 = toXY(Math.min(a2, totalAngle));
    arcs.push(
      <Path
        key={i}
        d={`M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`}
        fill="none"
        stroke={getSegColor(i / numSegs)}
        strokeWidth={strokeWidth}
        strokeLinecap={i === 0 || i === numSegs - 1 ? "round" : "butt"}
      />
    );
  }

  const label = score >= 80 ? "Excellent" : score >= 60 ? "Mindful" : score >= 40 ? "Moderate" : "Needs attention";

  return (
    <View style={styles.ringContainer}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} fill="none" stroke="#ECEAE5" strokeWidth={strokeWidth} />
          {arcs}
        </Svg>
        <Text style={styles.ringScore}>{score}</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

export default function WellnessScreen() {
  const {
    getLibraryPerfumes,
    getTotalSpraysThisMonth,
    getAverageDailySprays,
    getOverallSustainabilityScore,
    getSprayEventsForMonth,
    getSecondaryExposureForMonth,
    state,
  } = useApp();

  const libraryPerfumes = getLibraryPerfumes();
  const totalSprays = getTotalSpraysThisMonth();
  const avgDaily = getAverageDailySprays();
  const overallScore = getOverallSustainabilityScore();
  const monthEvents = getSprayEventsForMonth();

  // Calculate stats from library
  const perfumesWithFlags = libraryPerfumes.filter((p) => getPerfumeFlags(p).length > 0);
  const naturallyDerived = libraryPerfumes.length > 0
    ? Math.round(
        libraryPerfumes.reduce(
          (sum, p) => sum + (p.ingredients?.naturally_derived_percentage || 50),
          0
        ) / libraryPerfumes.length
      )
    : 0;
  const crueltyFreeCount = libraryPerfumes.filter(
    (p) => p.ingredients?.cruelty_free
  ).length;
  const crueltyFreePercent = libraryPerfumes.length > 0
    ? Math.round((crueltyFreeCount / libraryPerfumes.length) * 100)
    : 0;
  const parabenCount = libraryPerfumes.filter(
    (p) => p.ingredients?.parabens
  ).length;

  // Pick a random tip
  const tipIndex = new Date().getDate() % SPRAY_TIPS.length;
  const dailyTip = SPRAY_TIPS[tipIndex];

  // Personalized exposure threshold
  const vocThreshold = getVocAlertThreshold(state.sensitivityProfile);
  const exposureSpikes = monthEvents.filter((e) => e.score > vocThreshold).length;

  // Secondary exposure data
  const secondaryEvents = getSecondaryExposureForMonth();
  const secondaryCount = secondaryEvents.length;
  const secondaryTotalMs = secondaryEvents.reduce((sum, e) => sum + (e.durationMs || 0), 0);
  const secondaryTotalMin = Math.round(secondaryTotalMs / 60000);

  // Cumulative chemical exposure estimate by category
  const chemicalExposure = {};
  Object.keys(CHEMICAL_CATEGORIES).forEach((cat) => { chemicalExposure[cat] = 0; });
  libraryPerfumes.forEach((p) => {
    const sprayCount = monthEvents.filter((e) => e.perfumeId === p.id).length;
    const flagged = getFlaggedChemicals(p);
    flagged.forEach((c) => {
      if (chemicalExposure[c.category] !== undefined) {
        chemicalExposure[c.category] += sprayCount;
      }
    });
  });
  const hasChemicalExposure = Object.values(chemicalExposure).some((v) => v > 0);

  // Ingredient transparency overview
  const avgTransparency = libraryPerfumes.length > 0
    ? Math.round(
        libraryPerfumes.reduce((sum, p) => sum + getTransparencyScore(p), 0) / libraryPerfumes.length
      )
    : 0;

  // Monthly report educational content
  const reportContent = getContentForContext("monthly_report");

  // Secondhand scent check — frequent indoor spraying
  const avgSpraysPerDay = parseFloat(avgDaily);
  const showSecondhandTip = avgSpraysPerDay >= 3;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Scent Wellness</Text>
          <Text style={styles.subtitle}>{MONTH} Overview</Text>
        </View>

        {/* Sustainability Score Card */}
        <View style={styles.sustainCard}>
          <Text style={styles.sustainTitle}>Your Sustainability Score</Text>
          <SustainabilityRing score={overallScore} />

          <View style={styles.statsRowVertical}>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>&middot;</Text>
              <Text style={styles.statText}>{naturallyDerived}% naturally derived ingredients</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>&middot;</Text>
              <Text style={styles.statText}>
                {parabenCount} of {libraryPerfumes.length} fragrances contain parabens
              </Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>&middot;</Text>
              <Text style={styles.statText}>{crueltyFreePercent}% cruelty-free certified</Text>
            </View>
          </View>

          {/* Advisory Banner */}
          {perfumesWithFlags.length > 0 && (
            <View style={styles.advisory}>
              <Ionicons name="alert-circle-outline" size={16} color="#B89060" style={{ marginTop: 1 }} />
              <Text style={styles.advisoryText}>
                {perfumesWithFlags.length} fragrance{perfumesWithFlags.length > 1 ? "s" : ""} in
                your collection {perfumesWithFlags.length > 1 ? "have" : "has"} ingredient alerts.
                Tap into your library for details.
              </Text>
            </View>
          )}
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewCard}>
          <View style={styles.stat}>
            <Text style={styles.overviewValue}>{totalSprays}</Text>
            <Text style={styles.overviewLabel}>spritzes this month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.overviewValue}>{avgDaily}</Text>
            <Text style={styles.overviewLabel}>daily average</Text>
          </View>
        </View>

        {/* Exposure summary */}
        <View style={styles.exposureCard}>
          <Text style={styles.exposureTitle}>Exposure summary</Text>
          <View style={styles.exposureRow}>
            <View style={styles.exposureItem}>
              <Text style={styles.exposureValue}>{exposureSpikes}</Text>
              <Text style={styles.exposureLabel}>high-intensity{"\n"}events</Text>
            </View>
            <View style={styles.exposureItem}>
              <Text style={styles.exposureValue}>{libraryPerfumes.length}</Text>
              <Text style={styles.exposureLabel}>perfumes{"\n"}tracked</Text>
            </View>
            <View style={styles.exposureItem}>
              <Text style={styles.exposureValue}>{perfumesWithFlags.length}</Text>
              <Text style={styles.exposureLabel}>with{"\n"}alerts</Text>
            </View>
          </View>
        </View>

        {/* Cumulative Chemical Exposure */}
        {hasChemicalExposure && (
          <View style={styles.chemExposureCard}>
            <Text style={styles.exposureTitle}>Cumulative chemical exposure</Text>
            <Text style={styles.chemDisclaimer}>
              Directional estimate based on spray frequency and flagged ingredients. Not a medical measurement.
            </Text>
            {Object.entries(chemicalExposure)
              .filter(([, count]) => count > 0)
              .map(([cat, count]) => {
                const catInfo = CHEMICAL_CATEGORIES[cat];
                const maxBar = Math.max(...Object.values(chemicalExposure), 1);
                return (
                  <View key={cat} style={styles.chemRow}>
                    <Text style={styles.chemLabel}>
                      {catInfo?.label || cat.replace(/_/g, " ")}
                    </Text>
                    <View style={styles.chemBarBg}>
                      <View
                        style={[
                          styles.chemBarFill,
                          { width: `${Math.min(100, (count / maxBar) * 100)}%` },
                          catInfo?.severityWeight >= 3 && styles.chemBarHigh,
                        ]}
                      />
                    </View>
                    <Text style={styles.chemCount}>{count} sprays</Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* Secondary Exposure Summary */}
        {secondaryCount > 0 && (
          <View style={styles.secondaryCard}>
            <Text style={styles.exposureTitle}>Secondary exposure</Text>
            <View style={styles.exposureRow}>
              <View style={styles.exposureItem}>
                <Text style={styles.exposureValue}>{secondaryCount}</Text>
                <Text style={styles.exposureLabel}>events{"\n"}detected</Text>
              </View>
              <View style={styles.exposureItem}>
                <Text style={styles.exposureValue}>{secondaryTotalMin}</Text>
                <Text style={styles.exposureLabel}>minutes{"\n"}elevated</Text>
              </View>
            </View>
            <Text style={styles.secondaryHint}>
              VOC levels stayed elevated after spray events, possibly from terpene-ozone reactions producing secondary pollutants.
            </Text>
          </View>
        )}

        {/* Ingredient Transparency Overview */}
        {libraryPerfumes.length > 0 && (
          <View style={styles.transparencyCard}>
            <Text style={styles.exposureTitle}>Ingredient transparency</Text>
            <View style={styles.transparencyBarLarge}>
              <View style={[styles.transparencyFill, { width: `${avgTransparency}%` }]} />
            </View>
            <Text style={styles.transparencyLabel}>
              {avgTransparency}% average disclosure across your {libraryPerfumes.length} perfume{libraryPerfumes.length !== 1 ? "s" : ""}
            </Text>
            {avgTransparency < 60 && (
              <Text style={styles.transparencyWarning}>
                Many of your perfumes have limited ingredient disclosure. The term "fragrance" can hide dozens of undisclosed chemicals.
              </Text>
            )}
          </View>
        )}

        {/* Secondhand Scent Note */}
        {showSecondhandTip && (
          <View style={styles.secondhandCard}>
            <Ionicons name="people-outline" size={16} color="#B89060" style={{ marginTop: 1 }} />
            <Text style={styles.secondhandText}>
              You average {avgSpraysPerDay.toFixed(1)} sprays/day. Research shows ~30% of people report irritation from others' fragrances. Consider being mindful of fragrance intensity in shared or enclosed spaces.
            </Text>
          </View>
        )}

        {/* Daily tip */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf-outline" size={16} color="#7A8E6A" style={{ marginTop: 1 }} />
          <Text style={styles.tipText}>{dailyTip}</Text>
        </View>

        {/* Educational Content */}
        {reportContent.length > 0 && (
          <View style={styles.eduCard}>
            <Text style={styles.exposureTitle}>Learn more</Text>
            {reportContent.map((content) => (
              <View key={content.id} style={styles.eduItem}>
                <Ionicons name="book-outline" size={13} color={COLORS.tabActive} style={{ marginTop: 2 }} />
                <View style={styles.eduItemContent}>
                  <Text style={styles.eduQuestion}>{content.question}</Text>
                  <Text style={styles.eduAnswer}>{content.answer}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>{HEALTH_DISCLAIMER}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 26,
  },

  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 6,
  },

  sustainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 24,
    marginBottom: 20,
    ...SHADOWS.neumorphicLight,
  },
  sustainTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  ringContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  ringScore: {
    position: "absolute",
    fontSize: 36,
    color: COLORS.text,
    ...NUMBER_STYLE,
  },
  ringLabel: {
    fontSize: 13,
    color: COLORS.tabInactive,
    marginTop: 8,
  },
  statsRowVertical: {
    gap: 6,
    marginBottom: 16,
  },
  statLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  statDot: {
    fontSize: 16,
    color: COLORS.tabInactive,
    lineHeight: 18,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  advisory: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0E8DF",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  advisoryText: {
    fontSize: 12,
    color: "#8A7560",
    lineHeight: 17,
    flex: 1,
  },

  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 28,
    color: COLORS.text,
    ...NUMBER_STYLE,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E2DED7",
  },

  exposureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  exposureTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  exposureRow: {
    flexDirection: "row",
    gap: 10,
  },
  exposureItem: {
    flex: 1,
    alignItems: "center",
  },
  exposureValue: {
    fontSize: 24,
    color: COLORS.text,
    ...NUMBER_STYLE,
  },
  exposureLabel: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 15,
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8EDE5",
    borderRadius: 36,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 13,
    color: "#5C6B52",
    lineHeight: 19,
    flex: 1,
  },

  // Chemical exposure
  chemExposureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  chemDisclaimer: {
    fontSize: 11,
    color: COLORS.tabInactive,
    fontStyle: "italic",
    lineHeight: 15,
    marginBottom: 12,
  },
  chemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  chemLabel: {
    width: 90,
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  chemBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#E8E4DE",
    borderRadius: 3,
  },
  chemBarFill: {
    height: 6,
    backgroundColor: "#B89060",
    borderRadius: 3,
  },
  chemBarHigh: {
    backgroundColor: "#C47860",
  },
  chemCount: {
    width: 56,
    fontSize: 11,
    color: COLORS.tabInactive,
    textAlign: "right",
  },

  // Secondary exposure
  secondaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  secondaryHint: {
    fontSize: 11,
    color: COLORS.tabInactive,
    lineHeight: 16,
    marginTop: 10,
    fontStyle: "italic",
  },

  // Transparency
  transparencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  transparencyBarLarge: {
    height: 8,
    backgroundColor: "#E8E4DE",
    borderRadius: 4,
    marginBottom: 6,
    marginTop: 4,
  },
  transparencyFill: {
    height: 8,
    backgroundColor: "#5C6B4F",
    borderRadius: 4,
  },
  transparencyLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transparencyWarning: {
    fontSize: 11,
    color: "#B89060",
    lineHeight: 16,
    marginTop: 6,
    fontStyle: "italic",
  },

  // Secondhand
  secondhandCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0E8DF",
    borderRadius: 36,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  secondhandText: {
    flex: 1,
    fontSize: 12,
    color: "#8A7560",
    lineHeight: 17,
  },

  // Educational
  eduCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  eduItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  eduItemContent: {
    flex: 1,
  },
  eduQuestion: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: 3,
  },
  eduAnswer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // Disclaimer
  disclaimerCard: {
    backgroundColor: "#F0EDE8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 11,
    color: COLORS.tabInactive,
    lineHeight: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});
