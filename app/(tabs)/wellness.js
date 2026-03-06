import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, NUMBER_STYLE } from "../../components/theme";

const MONTH = "March";
const OVERALL_SCORE = 64;

const TAG_STYLES = {
  "eco-friendly": { bg: "#E8EDE5", text: "#5C6B52" },
  "carbon neutral": { bg: "#EAE6DC", text: "#7A7452" },
  "standard": { bg: "#F0E4DB", text: "#A67C5B" },
  "clean": { bg: "#E8E6EC", text: "#6B6878" },
  "high voc": { bg: "#F2E5D8", text: "#9E7C56" },
};

const PERFUMES = [
  {
    id: 1,
    brand: "Le Labo",
    name: "Santal 33",
    sprays: 127,
    score: 82,
    tag: "eco-friendly",
    bottleColor: "#E8DFD0",
  },
  {
    id: 2,
    brand: "Aesop",
    name: "Rozu",
    sprays: 89,
    score: 91,
    tag: "carbon neutral",
    bottleColor: "#D4A44A",
  },
  {
    id: 3,
    brand: "Byredo",
    name: "Gypsy Water",
    sprays: 64,
    score: 58,
    tag: "standard",
    bottleColor: "#2C2C2C",
  },
  {
    id: 4,
    brand: "Diptyque",
    name: "Philosykos",
    sprays: 42,
    score: 74,
    tag: "eco-friendly",
    bottleColor: "#C9B896",
  },
];

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
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Draw gradient arc with small segments
  const numSegs = 40;
  const totalAngle = (score / 100) * 360;
  const segAngle = totalAngle / numSegs;

  const toXY = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  // sage green → amber → dusty rose based on where along the arc
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
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#ECEAE5"
            strokeWidth={strokeWidth}
          />
          {arcs}
        </Svg>
        <Text style={styles.ringScore}>{score}</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

function ScoreRing({ score, size = 44 }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#7A8E6A" : score >= 60 ? "#B8A060" : "#C4956A";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ECEAE5" strokeWidth={strokeWidth} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.smallScoreText, NUMBER_STYLE]}>{score}</Text>
    </View>
  );
}

function PerfumeBottle({ color, size = 48 }) {
  return (
    <View style={[styles.bottle, { width: size, height: size, backgroundColor: color + "18" }]}>
      <View style={[styles.bottleCap, { backgroundColor: color + "80" }]} />
      <View style={[styles.bottleBody, { backgroundColor: color + "35" }]} />
    </View>
  );
}

function PerfumeCard({ perfume }) {
  return (
    <Pressable style={({ pressed }) => [styles.perfumeCard, pressed && styles.cardPressed]}>
      <View style={styles.cardRow}>
        <PerfumeBottle color={perfume.bottleColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.brandText}>{perfume.brand}</Text>
          <Text style={styles.nameText}>{perfume.name}</Text>
          <Text style={styles.sprayCount}>{perfume.sprays} sprays</Text>
        </View>
        <View style={styles.cardRight}>
          <ScoreRing score={perfume.score} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        {(() => {
          const ts = TAG_STYLES[perfume.tag] || TAG_STYLES["standard"];
          return (
            <View style={[styles.tag, { backgroundColor: ts.bg }]}>
              <Text style={[styles.tagText, { color: ts.text }]}>{perfume.tag}</Text>
            </View>
          );
        })()}
      </View>
    </Pressable>
  );
}

export default function WellnessScreen() {
  const totalSprays = PERFUMES.reduce((sum, p) => sum + p.sprays, 0);
  const avgDaily = (totalSprays / 30).toFixed(1);

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

          <SustainabilityRing score={OVERALL_SCORE} />

          <View style={styles.statsRow}>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.statText}>72% naturally derived ingredients</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.statText}>3 of 12 fragrances contain parabens</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.statText}>89% cruelty-free certified</Text>
            </View>
          </View>

          {/* Advisory Banner */}
          <Pressable style={styles.advisory}>
            <Ionicons name="alert-circle-outline" size={16} color="#B89060" style={{ marginTop: 1 }} />
            <Text style={styles.advisoryText}>
              2 fragrances in your collection contain high-VOC compounds. Consider lighter application.
            </Text>
          </Pressable>
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalSprays}</Text>
            <Text style={styles.statLabel}>spritzes this month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{avgDaily}</Text>
            <Text style={styles.statLabel}>daily average</Text>
          </View>
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

  // Header
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

  // Sustainability Card
  sustainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
  statsRow: {
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

  // Overview Stats
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    color: COLORS.text,
    ...NUMBER_STYLE,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E2DED7",
  },

  // Section
  sectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // Perfume Cards
  perfumeCard: {
    paddingVertical: 14,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: "#F7F5F0",
    borderRadius: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottle: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    gap: 2,
  },
  bottleCap: {
    width: 10,
    height: 8,
    borderRadius: 2,
  },
  bottleBody: {
    width: 26,
    height: 30,
    borderRadius: 5,
  },
  cardInfo: {
    flex: 1,
  },
  brandText: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  nameText: {
    fontFamily: FONTS.title,
    fontSize: 17,
    color: COLORS.text,
    marginTop: 1,
  },
  sprayCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    marginLeft: 10,
  },
  smallScoreText: {
    position: "absolute",
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 62,
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
  divider: {
    height: 1,
    backgroundColor: "#EDEAE4",
    marginLeft: 62,
  },
});
