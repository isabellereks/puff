import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import CircularGauge from "../../components/CircularGauge";
import SprayChart from "../../components/SprayChart";
import PerfumeBottle from "../../components/PerfumeBottle";
import PerfumeDetail from "../../components/PerfumeDetail";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { startSensor, stopSensor, simulateSpray } from "../../services/sensorService";
import { getPerfumeById } from "../../services/perfumeService";

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
            const inLib = state.library.some((l) => l.perfumeId === perfume.id);
            dispatch({ type: inLib ? "REMOVE_FROM_LIBRARY" : "ADD_TO_LIBRARY", perfumeId: perfume.id });
            setSelectedPerfume(null);
          }}
          inLibrary={state.library.some((l) => l.perfumeId === selectedPerfume.id)}
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
