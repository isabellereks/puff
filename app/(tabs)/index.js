import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import CircularGauge from "../../components/CircularGauge";
import SprayChart from "../../components/SprayChart";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { startSensor, stopSensor, simulateSpray } from "../../services/sensorService";
import { getPerfumeById, getCleanerAlternatives } from "../../services/perfumeService";
import { getPerfumeFlags, getSustainabilityScore, VOC_INFO } from "../../data/ingredientFlags";

const TAG_STYLES = {
  "eco-friendly": { bg: "#E8EDE5", text: "#5C6B52" },
  "carbon neutral": { bg: "#EAE6DC", text: "#7A7452" },
  "standard": { bg: "#F0E4DB", text: "#A67C5B" },
  "clean": { bg: "#E8E6EC", text: "#6B6878" },
  "high voc": { bg: "#F2E5D8", text: "#9E7C56" },
};

function getTagForPerfume(perfume) {
  if (!perfume.ingredients) return "standard";
  const ing = perfume.ingredients;
  if (ing.naturally_derived_percentage >= 80 && !ing.phthalates) return "eco-friendly";
  if (!ing.phthalates && !ing.parabens && !ing.synthetic_musks) return "clean";
  if (ing.vocs && ing.vocs.length >= 3) return "high voc";
  return "standard";
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

const SEVERITY_COLORS = {
  high: { bg: "#F2E0D8", text: "#9E5C46" },
  moderate: { bg: "#F2E5D8", text: "#9E7C56" },
  low: { bg: "#E8E6EC", text: "#6B6878" },
};

function PerfumeDetail({ perfume, onClose, onAdd, inLibrary }) {
  const flags = getPerfumeFlags(perfume);
  const score = getSustainabilityScore(perfume);
  const alternatives = flags.length > 0 ? getCleanerAlternatives(perfume.id) : [];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={detailStyles.modalSafe}>
        <ScrollView style={detailStyles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={detailStyles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={detailStyles.modalTop}>
            <PerfumeBottle color={perfume.bottleColor || "#CCC"} />
            <Text style={detailStyles.modalBrand}>{perfume.brand}</Text>
            <Text style={detailStyles.modalName}>{perfume.name}</Text>
            {perfume.description && (
              <Text style={detailStyles.modalDescription}>{perfume.description}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={detailStyles.notesSection}>
            {perfume.notes_top?.length > 0 && (
              <View style={detailStyles.noteRow}>
                <Text style={detailStyles.noteLabel}>Top</Text>
                <Text style={detailStyles.noteValues}>{perfume.notes_top.join(", ")}</Text>
              </View>
            )}
            {perfume.notes_middle?.length > 0 && (
              <View style={detailStyles.noteRow}>
                <Text style={detailStyles.noteLabel}>Heart</Text>
                <Text style={detailStyles.noteValues}>{perfume.notes_middle.join(", ")}</Text>
              </View>
            )}
            {perfume.notes_base?.length > 0 && (
              <View style={detailStyles.noteRow}>
                <Text style={detailStyles.noteLabel}>Base</Text>
                <Text style={detailStyles.noteValues}>{perfume.notes_base.join(", ")}</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={detailStyles.statsRow}>
            <View style={detailStyles.statItem}>
              <Text style={detailStyles.statValue}>{perfume.longevity || "--"}</Text>
              <Text style={detailStyles.statLabel}>Longevity</Text>
            </View>
            <View style={detailStyles.statItem}>
              <Text style={detailStyles.statValue}>{perfume.sillage || "--"}</Text>
              <Text style={detailStyles.statLabel}>Sillage</Text>
            </View>
            <View style={detailStyles.statItem}>
              <Text style={detailStyles.statValue}>{score}</Text>
              <Text style={detailStyles.statLabel}>Eco score</Text>
            </View>
          </View>

          {/* Ingredient flags */}
          {flags.length > 0 && (
            <View style={detailStyles.flagsSection}>
              <Text style={detailStyles.flagsSectionTitle}>Ingredient alerts</Text>
              {flags.map((flag, i) => {
                const colors = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.low;
                return (
                  <View key={i} style={[detailStyles.flagCard, { backgroundColor: colors.bg }]}>
                    <Text style={[detailStyles.flagLabel, { color: colors.text }]}>{flag.label}</Text>
                    <Text style={detailStyles.flagDescription}>{flag.description}</Text>
                    <Text style={detailStyles.flagTip}>{flag.tip}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* VOC details */}
          {perfume.ingredients?.vocs?.length > 0 && (
            <View style={detailStyles.flagsSection}>
              <Text style={detailStyles.flagsSectionTitle}>VOC compounds detected</Text>
              {perfume.ingredients.vocs.map((voc, i) => {
                const info = VOC_INFO[voc];
                return (
                  <View key={i} style={detailStyles.vocItem}>
                    <Text style={detailStyles.vocName}>{voc}</Text>
                    <Text style={detailStyles.vocDesc}>{info?.description || "No data available."}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Cleaner alternatives */}
          {alternatives.length > 0 && (
            <View style={detailStyles.flagsSection}>
              <Text style={detailStyles.flagsSectionTitle}>Cleaner alternatives</Text>
              {alternatives.map((alt) => (
                <View key={alt.id} style={detailStyles.altCard}>
                  <PerfumeBottle color={alt.bottleColor || "#CCC"} />
                  <View style={detailStyles.altInfo}>
                    <Text style={detailStyles.altBrand}>{alt.brand}</Text>
                    <Text style={detailStyles.altName}>{alt.name}</Text>
                    <Text style={detailStyles.altScore}>
                      {alt.ingredients.naturally_derived_percentage}% naturally derived
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add/Remove button */}
          <Pressable
            style={[detailStyles.addButton, inLibrary && detailStyles.removeButton]}
            onPress={() => onAdd(perfume)}
          >
            <Text style={[detailStyles.addButtonText, inLibrary && detailStyles.removeButtonText]}>
              {inLibrary ? "Remove from library" : "Add to my library"}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PerfumeCard({ perfume, sprayCount, onPress }) {
  const tag = getTagForPerfume(perfume);
  const ts = TAG_STYLES[tag] || TAG_STYLES["standard"];
  const score = perfume.ingredients
    ? Math.round(perfume.ingredients.naturally_derived_percentage)
    : 50;

  return (
    <Pressable style={({ pressed }) => [styles.perfumeCard, pressed && styles.cardPressed]} onPress={onPress}>
      <PerfumeBottle color={perfume.bottleColor || "#CCC"} />
      <View style={styles.cardInfo}>
        <Text style={styles.brandText}>{perfume.brand}</Text>
        <Text style={styles.nameText}>{perfume.name}</Text>
        <Text style={styles.sprayCount}>{sprayCount} sprays</Text>
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: ts.bg }]}>
            <Text style={[styles.tagText, { color: ts.text }]}>{tag}</Text>
          </View>
        </View>
      </View>
      <ScoreRing score={score} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { state, dispatch, getLibraryPerfumes, getSprayEventsToday, getPerfumeSprayCount } = useApp();
  const [lastSprayPerfume, setLastSprayPerfume] = useState(null);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const libraryIds = state.library.map((l) => l.perfumeId);
  const libraryPerfumes = getLibraryPerfumes();
  const todayEvents = getSprayEventsToday();

  // Start mock sensor
  useEffect(() => {
    startSensor(
      (reading) => {
        dispatch({ type: "SET_LIVE_SCORE", score: reading.score });
        dispatch({ type: "ADD_SENSOR_READING", reading });
      },
      (sprayEvent) => {
        // Auto-detected spray
        dispatch({ type: "SET_LIVE_SCORE", score: sprayEvent.score });
      }
    );
    dispatch({ type: "SET_SENSOR_CONNECTED", connected: true });

    return () => {
      stopSensor();
      dispatch({ type: "SET_SENSOR_CONNECTED", connected: false });
    };
  }, []);

  const handleManualSpray = useCallback(() => {
    const event = simulateSpray(60);
    dispatch({ type: "SET_LIVE_SCORE", score: event.score });

    // Default to first perfume in library if none selected
    const perfumeId = libraryPerfumes.length > 0 ? libraryPerfumes[0].id : null;
    if (perfumeId) {
      dispatch({ type: "LOG_SPRAY", perfumeId, score: event.score, confirmed: true });
      setLastSprayPerfume(getPerfumeById(perfumeId));
      setTimeout(() => setLastSprayPerfume(null), 3000);
    }
  }, [libraryPerfumes]);

  // Get preferred range for the first perfume (or default)
  const activePerfume = libraryPerfumes[0];
  const preferredRange = activePerfume?.preferredRange || [40, 60];

  // Build chart data from today's events
  const chartData = buildChartData(todayEvents);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Puff Board</Text>

        <View style={styles.gaugeCard}>
          <CircularGauge value={state.liveScore} size={240} preferredRange={preferredRange} />
        </View>

        {/* Manual spray button */}
        <View style={styles.sprayButtonRow}>
          <Pressable
            style={({ pressed }) => [styles.sprayButton, pressed && { opacity: 0.7 }]}
            onPress={handleManualSpray}
          >
            <Text style={styles.sprayButtonText}>Spritzed! 𓇢𓆸</Text>
          </Pressable>
        </View>

        {lastSprayPerfume && (
          <View style={styles.sprayConfirm}>
            <Text style={styles.sprayConfirmText}>
              Logged spray for {lastSprayPerfume.name}
            </Text>
          </View>
        )}

        {/* Sensor status */}
        <View style={styles.sensorStatus}>
          <View style={[styles.statusDot, state.sensorConnected && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {state.sensorConnected ? "Sensor connected" : "Sensor offline"}
          </Text>
          <Text style={styles.statusScore}>{todayEvents.length} sprays today</Text>
        </View>

        <Text style={styles.sectionTitle}>Today's scent timeline</Text>
        <View style={styles.chartCard}>
          <SprayChart data={chartData} />
        </View>

        <Text style={styles.collectionLabel}>Your Collection</Text>
        {libraryPerfumes.map((perfume) => (
          <PerfumeCard
            key={perfume.id}
            perfume={perfume}
            sprayCount={getPerfumeSprayCount(perfume.id)}
            onPress={() => setSelectedPerfume(perfume)}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedPerfume && (
        <PerfumeDetail
          perfume={selectedPerfume}
          onClose={() => setSelectedPerfume(null)}
          onAdd={(perfume) => {
            if (libraryIds.includes(perfume.id)) {
              dispatch({ type: "REMOVE_FROM_LIBRARY", perfumeId: perfume.id });
            } else {
              dispatch({ type: "ADD_TO_LIBRARY", perfumeId: perfume.id });
            }
            setSelectedPerfume(null);
          }}
          inLibrary={libraryIds.includes(selectedPerfume.id)}
        />
      )}
    </SafeAreaView>
  );
}

function buildChartData(events) {
  const buckets = [
    { label: "Morning", icon: "sunny-outline", start: 6, end: 11, count: 0, lastTimestamp: null },
    { label: "Noon", icon: "partly-sunny-outline", start: 11, end: 15, count: 0, lastTimestamp: null },
    { label: "Evening", icon: "moon-outline", start: 15, end: 20, count: 0, lastTimestamp: null },
    { label: "Night", icon: "cloudy-night-outline", start: 20, end: 30, count: 0, lastTimestamp: null },
  ];

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    for (const b of buckets) {
      if (hour >= b.start && hour < b.end) {
        b.count++;
        b.lastTimestamp = e.timestamp;
        break;
      }
    }
  });

  return buckets.map((b) => ({
    label: b.label,
    icon: b.icon,
    value: b.count,
    timestamp: b.lastTimestamp,
  }));
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
    borderRadius: 36,
    paddingVertical: 30,
    alignItems: "center",
    ...SHADOWS.neumorphic,
  },
  sprayButtonRow: {
    alignItems: "center",
    marginTop: 16,
  },
  sprayButton: {
    backgroundColor: COLORS.mutedGreen,
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  sprayButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  sprayConfirm: {
    backgroundColor: "#E8EDE5",
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },
  sprayConfirmText: {
    color: "#5C6B52",
    fontSize: 13,
  },
  sensorStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tabInactive,
  },
  statusDotActive: {
    backgroundColor: "#7A8E6A",
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statusScore: {
    fontSize: 12,
    color: COLORS.tabInactive,
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
    borderRadius: 36,
    padding: 20,
    ...SHADOWS.neumorphicLight,
  },
  collectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 14,
  },
  perfumeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  cardPressed: {
    opacity: 0.85,
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
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
});

const detailStyles = StyleSheet.create({
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
