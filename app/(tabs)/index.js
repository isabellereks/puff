import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import CircularGauge from "../../components/CircularGauge";
import SprayChart from "../../components/SprayChart";
import PerfumeBottle from "../../components/PerfumeBottle";
import PerfumeDetail from "../../components/PerfumeDetail";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { startSensor, stopSensor, simulateSpray, setCurrentScore } from "../../services/sensorService";
import { getPerfumeById } from "../../services/perfumeService";

function SwipeableEventRow({ evt, perfume, onDelete }) {
  const height = useRef(new Animated.Value(1)).current;
  const handleDelete = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => onDelete());
  };
  const d = new Date(evt.timestamp);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return (
    <Animated.View style={{
      opacity: height,
      maxHeight: height.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }),
      transform: [{ scale: height.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
    }}>
      <Swipeable
        renderRightActions={(progress) => {
          const translateX = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [70, 0],
          });
          return (
            <Animated.View style={[scoreStyles.deleteAction, { transform: [{ translateX }] }]}>
              <Pressable style={scoreStyles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#FFF" />
              </Pressable>
            </Animated.View>
          );
        }}
        overshootRight={false}
      >
        <View style={scoreStyles.eventRow}>
          <View style={[scoreStyles.eventDot, { opacity: Math.max(0.3, evt.score / 100) }]} />
          <View style={scoreStyles.eventInfo}>
            <Text style={scoreStyles.eventName}>{perfume?.name || "Unknown"}</Text>
            <Text style={scoreStyles.eventTime}>{h}:{m} {ampm}</Text>
          </View>
          <Text style={scoreStyles.eventScore}>{evt.score}</Text>
        </View>
      </Swipeable>
    </Animated.View>
  );
}

function getScoreInsight(score) {
  if (score <= 10) return { title: "Barely there", desc: `At ${score}, no fragrance detected. A fresh baseline.` };
  if (score <= 20) return { title: "Whisper soft", desc: `${score} — the lightest hint. Only noticeable up close.` };
  if (score <= 30) return { title: "Gentle presence", desc: `At ${score}, a soft presence. Personal and understated.` };
  if (score <= 40) return { title: "Soft bloom", desc: `${score} is a comfortable everyday level. Present but not imposing.` };
  if (score <= 50) return { title: "Balanced", desc: `At ${score}, you're in a sweet spot. Noticeable without overwhelming.` };
  if (score <= 60) return { title: "Warm trail", desc: `${score} — you're leaving a trail. Your nose may be starting to adjust, so hold off on reapplying.` };
  if (score <= 70) return { title: "Strong projection", desc: `At ${score}, your scent projects well. Be mindful in small spaces — olfactory fatigue may be dulling your own perception.` };
  if (score <= 80) return { title: "Heavy exposure", desc: `${score} is high. You likely can't smell it on yourself anymore, but others can. Don't reapply — open a window or step outside.` };
  if (score <= 90) return { title: "Overexposure risk", desc: `At ${score}, the air is saturated. This can irritate airways over time. Ventilate the space and avoid adding more.` };
  return { title: "Sensory overload", desc: `${score} is as intense as it gets. Step into fresh air and give the room time to clear.` };
}

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
  const [showSprayModal, setShowSprayModal] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [sprayHour, setSprayHour] = useState(() => new Date().getHours());
  const [sprayMinute, setSprayMinute] = useState(() => new Date().getMinutes());
  const [sprayPerfumeId, setSprayPerfumeId] = useState(null);
  const [sprayCount, setSprayCount] = useState(2);
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

  const openSprayModal = () => {
    const now = new Date();
    setSprayHour(now.getHours());
    setSprayMinute(now.getMinutes());
    setSprayPerfumeId(libraryPerfumes.length > 0 ? libraryPerfumes[0].id : null);
    setSprayCount(2);
    setShowSprayModal(true);
  };

  const handleLogSpray = () => {
    if (!sprayPerfumeId) return;
    const totalSprays = todayEvents.length + sprayCount;
    // More sprays = higher score, with diminishing returns
    const targetScore = Math.min(95, Math.round(10 + 20 * Math.log2(totalSprays + 1) + sprayCount * 3 + Math.random() * 6));
    const now = new Date();
    now.setHours(sprayHour, sprayMinute, 0, 0);
    dispatch({ type: "LOG_SPRAY", perfumeId: sprayPerfumeId, score: targetScore, confirmed: true, timestamp: now.toISOString() });
    setLastSprayPerfume(getPerfumeById(sprayPerfumeId));
    setTimeout(() => setLastSprayPerfume(null), 3000);
    setShowSprayModal(false);

    // Sync sensor service so its background readings don't fight the animation
    setCurrentScore(targetScore);

    // Gradually ramp score up over ~2.5 seconds
    const startScore = state.liveScore;
    const diff = targetScore - startScore;
    const steps = 30;
    const stepTime = 80;
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const t = i / steps;
        const eased = startScore + Math.round(diff * (1 - Math.pow(1 - t, 3)));
        dispatch({ type: "SET_LIVE_SCORE", score: eased });
        // Keep sensor in sync during animation
        setCurrentScore(eased);
      }, i * stepTime);
    }
  };

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

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Scent score</Text>
          <Pressable onPress={() => setShowScoreInfo(!showScoreInfo)} hitSlop={10}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.tabInactive} />
          </Pressable>
        </View>
        {showScoreInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoNumber}>0</Text>
              <View style={styles.infoBar}>
                <Svg width="100%" height={6}>
                  <Defs>
                    <LinearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#9AAC86" />
                      <Stop offset="0.35" stopColor="#A8AD8A" />
                      <Stop offset="0.65" stopColor="#BBAA92" />
                      <Stop offset="1" stopColor="#D6BCB4" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="6" rx="3" fill="url(#barGrad)" />
                </Svg>
              </View>
              <Text style={styles.infoNumber}>100</Text>
            </View>
            <View style={styles.infoLabelsRow}>
              <Text style={styles.infoLabel}>no scent</Text>
              <Text style={styles.infoLabel}>fresh spritz</Text>
            </View>
            <Text style={styles.infoDesc}>
              Measured by Puff based on the air quality around you — spray intensity and how long your fragrance lingers.
            </Text>
          </View>
        )}
        <Pressable style={styles.gaugeCard} onPress={() => setShowScoreDetail(true)}>
          <CircularGauge value={state.liveScore} size={240} preferredRange={preferredRange} sprayEvents={todayEvents} />
        </Pressable>

        {/* Manual spray button */}
        <View style={styles.sprayButtonRow}>
          <Pressable
            style={({ pressed }) => [styles.sprayButton, pressed && { opacity: 0.7 }]}
            onPress={openSprayModal}
          >
            <Text style={styles.sprayButtonText}>Record Spritz</Text>
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

        <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 14 }]}>Today's scent timeline</Text>
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
          libraryEntry={state.library.find((l) => l.perfumeId === selectedPerfume.id)}
          onUpdateNotes={(perfumeId, idealSprays, userNotes) =>
            dispatch({ type: "UPDATE_PERFUME_NOTES", perfumeId, idealSprays, userNotes })
          }
        />
      )}

      {showScoreDetail && (() => {
        const insight = getScoreInsight(state.liveScore);
        return (
          <Modal visible animationType="slide" presentationStyle="pageSheet">
            <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={scoreStyles.safe}>
              <View style={scoreStyles.header}>
                <Text style={scoreStyles.headerTitle}>Your Scent Score</Text>
                <Pressable onPress={() => setShowScoreDetail(false)} hitSlop={12}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </Pressable>
              </View>

              <ScrollView style={scoreStyles.scroll} contentContainerStyle={scoreStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={scoreStyles.gaugeWrap}>
                  <CircularGauge value={state.liveScore} size={260} preferredRange={preferredRange} sprayEvents={todayEvents} />
                </View>

                <Text style={scoreStyles.insightTitle}>{insight.title}</Text>
                <Text style={scoreStyles.insightDesc}>{insight.desc}</Text>

                <View style={scoreStyles.scaleCard}>
                  <View style={scoreStyles.scaleBarRow}>
                    <Text style={scoreStyles.scaleNum}>0</Text>
                    <View style={scoreStyles.scaleBar}>
                      <Svg width="100%" height={8}>
                        <Defs>
                          <LinearGradient id="scaleGrad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#9AAC86" />
                            <Stop offset="0.35" stopColor="#A8AD8A" />
                            <Stop offset="0.65" stopColor="#BBAA92" />
                            <Stop offset="1" stopColor="#D6BCB4" />
                          </LinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width="100%" height="8" rx="4" fill="url(#scaleGrad)" />
                      </Svg>
                    </View>
                    <Text style={scoreStyles.scaleNum}>100</Text>
                  </View>
                  <View style={scoreStyles.scaleLabels}>
                    <Text style={scoreStyles.scaleLabel}>no scent</Text>
                    <Text style={scoreStyles.scaleLabel}>fresh spritz</Text>
                  </View>
                </View>

                <Text style={scoreStyles.howTitle}>How it works</Text>
                <Text style={scoreStyles.howDesc}>
                  Your Puff sensor reads the air quality around you in real time — picking up on fragrance concentration, how intensely it projects, and how long scent molecules linger. As your perfume evolves throughout the day, Puff tracks every shift.
                </Text>

                {todayEvents.length > 0 && (
                  <View style={scoreStyles.eventsSection}>
                    <Text style={scoreStyles.eventsTitle}>Today's scent events</Text>
                    {[...todayEvents].reverse().map((evt) => (
                      <SwipeableEventRow
                        key={evt.id}
                        evt={evt}
                        perfume={getPerfumeById(evt.perfumeId)}
                        onDelete={() => dispatch({ type: "REMOVE_SPRAY", sprayId: evt.id })}
                      />
                    ))}
                  </View>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </SafeAreaView>
            </GestureHandlerRootView>
          </Modal>
        );
      })()}

      {showSprayModal && (
        <Modal visible animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={sprayStyles.safe}>
            <View style={sprayStyles.header}>
              <Text style={sprayStyles.headerTitle}>Record Spritz</Text>
              <Pressable onPress={() => setShowSprayModal(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            <ScrollView style={sprayStyles.scroll} showsVerticalScrollIndicator={false}>
              {/* Spray count */}
              <Text style={sprayStyles.label}>How many sprays?</Text>
              <View style={sprayStyles.countRow}>
                <Pressable
                  style={sprayStyles.countBtn}
                  onPress={() => setSprayCount((c) => Math.max(1, c - 1))}
                  hitSlop={8}
                >
                  <Ionicons name="remove" size={20} color={COLORS.text} />
                </Pressable>
                <Text style={sprayStyles.countValue}>{sprayCount}</Text>
                <Pressable
                  style={sprayStyles.countBtn}
                  onPress={() => setSprayCount((c) => Math.min(15, c + 1))}
                  hitSlop={8}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </Pressable>
              </View>

              {/* Time picker */}
              <Text style={sprayStyles.label}>What time?</Text>
              <View style={sprayStyles.timeRow}>
                <Pressable style={sprayStyles.timeButton} onPress={() => setSprayHour((h) => (h - 1 + 24) % 24)}>
                  <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
                </Pressable>
                <Text style={sprayStyles.timeValue}>
                  {(sprayHour % 12 || 12).toString().padStart(2, "0")}
                </Text>
                <Pressable style={sprayStyles.timeButton} onPress={() => setSprayHour((h) => (h + 1) % 24)}>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </Pressable>

                <Text style={sprayStyles.timeSeparator}>:</Text>

                <Pressable style={sprayStyles.timeButton} onPress={() => setSprayMinute((m) => (m - 5 + 60) % 60)}>
                  <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
                </Pressable>
                <Text style={sprayStyles.timeValue}>
                  {sprayMinute.toString().padStart(2, "0")}
                </Text>
                <Pressable style={sprayStyles.timeButton} onPress={() => setSprayMinute((m) => (m + 5) % 60)}>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </Pressable>

                <Pressable
                  style={sprayStyles.ampmButton}
                  onPress={() => setSprayHour((h) => (h + 12) % 24)}
                >
                  <Text style={sprayStyles.ampmText}>{sprayHour >= 12 ? "PM" : "AM"}</Text>
                </Pressable>
              </View>

              {/* Perfume selector */}
              <Text style={sprayStyles.label}>Which perfume?</Text>
              {libraryPerfumes.map((p) => (
                <Pressable
                  key={p.id}
                  style={[sprayStyles.perfumeOption, sprayPerfumeId === p.id && sprayStyles.perfumeOptionActive]}
                  onPress={() => setSprayPerfumeId(p.id)}
                >
                  <PerfumeBottle color={p.bottleColor || "#CCC"} />
                  <View style={sprayStyles.perfumeInfo}>
                    <Text style={sprayStyles.perfumeBrand}>{p.brand}</Text>
                    <Text style={sprayStyles.perfumeName}>{p.name}</Text>
                  </View>
                  {sprayPerfumeId === p.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#5C6B52" />
                  )}
                </Pressable>
              ))}

              {libraryPerfumes.length === 0 && (
                <Text style={sprayStyles.emptyText}>Add perfumes to your library first</Text>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Log button */}
            <View style={sprayStyles.footer}>
              <Pressable
                style={[sprayStyles.logButton, !sprayPerfumeId && { opacity: 0.5 }]}
                onPress={handleLogSpray}
                disabled={!sprayPerfumeId}
              >
                <Text style={sprayStyles.logButtonText}>Log Spritz</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
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
    fontSize: 34,
    color: COLORS.text,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 6,
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
    alignItems: "center",
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  infoNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    ...NUMBER_STYLE,
  },
  infoBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  infoLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "lowercase",
  },
  infoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    textAlign: "center",
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

const sprayStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    ...SHADOWS.neumorphicLight,
  },
  timeButton: {
    padding: 8,
  },
  timeValue: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: "500",
    minWidth: 44,
    textAlign: "center",
    ...NUMBER_STYLE,
  },
  timeSeparator: {
    fontSize: 28,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  ampmButton: {
    backgroundColor: COLORS.progressBg,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  ampmText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  perfumeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.neumorphicLight,
  },
  perfumeOptionActive: {
    backgroundColor: "#E8EDE5",
    borderWidth: 1,
    borderColor: "#C5D4B8",
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeBrand: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  perfumeName: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 1,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 24,
    ...SHADOWS.neumorphicLight,
  },
  countBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  countValue: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: "500",
    minWidth: 36,
    textAlign: "center",
    ...NUMBER_STYLE,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 30,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logButton: {
    backgroundColor: COLORS.mutedGreen,
    borderRadius: 36,
    paddingVertical: 14,
    alignItems: "center",
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});

const scoreStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  gaugeWrap: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    ...SHADOWS.neumorphicLight,
  },
  insightTitle: {
    fontFamily: FONTS.title,
    fontSize: 22,
    color: COLORS.text,
    marginTop: 28,
    textAlign: "center",
  },
  insightDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 8,
  },
  scaleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    width: "100%",
    marginTop: 28,
    ...SHADOWS.neumorphicLight,
  },
  scaleBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  scaleNum: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  scaleBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  scaleLabel: {
    fontSize: 11,
    color: COLORS.tabInactive,
  },
  howTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  howDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  eventsSection: {
    width: "100%",
    marginTop: 28,
  },
  eventsTitle: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.neumorphicLight,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A08878",
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    color: COLORS.text,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.tabInactive,
    marginTop: 1,
  },
  eventScore: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    ...NUMBER_STYLE,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    marginBottom: 8,
  },
  deleteBtn: {
    backgroundColor: "#C4756A",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
