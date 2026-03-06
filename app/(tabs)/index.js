import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import CircularGauge from "../../components/CircularGauge";
import SprayChart from "../../components/SprayChart";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";

const TAG_STYLES = {
  "eco-friendly": { bg: "#E8EDE5", text: "#5C6B52" },
  "carbon neutral": { bg: "#EAE6DC", text: "#7A7452" },
  "standard": { bg: "#F0E4DB", text: "#A67C5B" },
  "clean": { bg: "#E8E6EC", text: "#6B6878" },
  "high voc": { bg: "#F2E5D8", text: "#9E7C56" },
};

const PERFUMES = [
  { id: 1, brand: "Le Labo", name: "Santal 33", sprays: 127, score: 82, tag: "eco-friendly", bottleColor: "#E8DFD0" },
  { id: 2, brand: "Aesop", name: "Rozu", sprays: 89, score: 91, tag: "carbon neutral", bottleColor: "#D4A44A" },
  { id: 3, brand: "Byredo", name: "Gypsy Water", sprays: 64, score: 58, tag: "standard", bottleColor: "#2C2C2C" },
  { id: 4, brand: "Diptyque", name: "Philosykos", sprays: 42, score: 74, tag: "eco-friendly", bottleColor: "#C9B896" },
];

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
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.smallScoreText, NUMBER_STYLE]}>{score}</Text>
    </View>
  );
}

function PerfumeBottle({ color }) {
  return (
    <View style={[styles.bottle, { backgroundColor: color + "20" }]}>
      <View style={[styles.bottleCap, { backgroundColor: color }]} />
      <View style={[styles.bottleBody, { backgroundColor: color + "40" }]}>
        <View style={[styles.bottleLabel, { backgroundColor: color + "60" }]} />
      </View>
    </View>
  );
}

function PerfumeCard({ perfume }) {
  const ts = TAG_STYLES[perfume.tag] || TAG_STYLES["standard"];
  return (
    <Pressable style={({ pressed }) => [styles.perfumeCard, pressed && styles.cardPressed]}>
      <View style={styles.cardRow}>
        <PerfumeBottle color={perfume.bottleColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.brandText}>{perfume.brand}</Text>
          <Text style={styles.nameText}>{perfume.name}</Text>
          <Text style={styles.sprayCount}>{perfume.sprays} sprays</Text>
        </View>
        <ScoreRing score={perfume.score} />
      </View>
      <View style={styles.cardFooter}>
        <View style={[styles.tag, { backgroundColor: ts.bg }]}>
          <Text style={[styles.tagText, { color: ts.text }]}>{perfume.tag}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Puff Board</Text>

        <View style={styles.gaugeCard}>
          <CircularGauge value={45} size={240} />
        </View>

        <Text style={styles.sectionTitle}>Recent spray events</Text>
        <View style={styles.chartCard}>
          <SprayChart />
        </View>

        <Text style={styles.collectionLabel}>Your Collection</Text>
        {PERFUMES.map((perfume) => (
          <PerfumeCard key={perfume.id} perfume={perfume} />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    fontSize: 28,
    color: COLORS.text,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingVertical: 30,
    alignItems: "center",
    ...SHADOWS.neumorphic,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 14,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.neumorphicLight,
  },

  // Collection
  collectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 14,
  },
  collectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...SHADOWS.neumorphicLight,
  },
  perfumeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottle: {
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
  cardInfo: {
    flex: 1,
  },
  brandText: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  nameText: {
    fontSize: 17,
    color: COLORS.text,
    marginTop: 1,
  },
  sprayCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    marginTop: 4,
    marginLeft: 79,
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
    marginLeft: 79,
  },
});
