import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";

function ProgressBar({ progress, color, label }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color }]}>{label}</Text>
    </View>
  );
}

function WellnessCard({ icon, iconColor, title, description, progress, progressColor, progressLabel }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + "15" }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDesc}>{description}</Text>
      <ProgressBar
        progress={progress}
        color={progressColor}
        label={progressLabel}
      />
    </View>
  );
}

export default function WellnessScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Wellness &{"\n"}Sustainability</Text>

        <WellnessCard
          icon="pulse-outline"
          iconColor={COLORS.mutedGreen}
          title="Monthly Exposure"
          description="Your average daily exposure is low. Continue with your mindful routine."
          progress={25}
          progressColor={COLORS.mutedGreen}
          progressLabel="Low Risk"
        />

        <WellnessCard
          icon="leaf-outline"
          iconColor={COLORS.amber}
          title="Sustainability Score"
          description="Your choices support sustainable practices. 85% of your scents are eco-conscious."
          progress={72}
          progressColor={COLORS.amber}
          progressLabel="Good"
        />

        <Text style={styles.sectionTitle}>Gentle recommendations</Text>

        <View style={styles.recommendationsCard}>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Consider alternating scents to reduce daily concentration.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Explore our refill options for your favorites.
            </Text>
          </View>
        </View>
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
    fontFamily: FONTS.serif,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 20,
    lineHeight: 38,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.neumorphic,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.progressBg,
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 12,
  },
  recommendationsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    ...SHADOWS.neumorphicLight,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 10,
    marginTop: -1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
