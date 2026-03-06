import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularGauge from "../../components/CircularGauge";
import SprayChart from "../../components/SprayChart";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Puff</Text>

        <View style={styles.gaugeCard}>
          <CircularGauge value={45} size={240} />
        </View>

        <Text style={styles.sectionTitle}>Recent spray events</Text>
        <View style={styles.chartCard}>
          <SprayChart />
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
    fontFamily: FONTS.serifBold,
    fontSize: 36,
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
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 28,
    marginBottom: 12,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.neumorphicLight,
  },
});
