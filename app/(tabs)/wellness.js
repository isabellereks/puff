import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { getPerfumeById } from "../../services/perfumeService";
import { getPerfumeFlags, getSustainabilityScore, SPRAY_TIPS } from "../../data/ingredientFlags";

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

  const label = score >= 80 ? "Excellent" : score >= 60 ? "Mindful" : "Moderate";

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

  // Exposure spikes this month (scores above 70)
  const exposureSpikes = monthEvents.filter((e) => e.score > 70).length;

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

        {/* Daily tip */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf-outline" size={16} color="#7A8E6A" style={{ marginTop: 1 }} />
          <Text style={styles.tipText}>{dailyTip}</Text>
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
});
