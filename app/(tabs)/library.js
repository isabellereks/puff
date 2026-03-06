import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";

const PERFUMES = [
  {
    id: 1,
    name: "Le Labo Santal 33",
    tags: ["Clean", "High VOC"],
    color: "#E8DFD0",
  },
  {
    id: 2,
    name: "Aesop Rozu",
    tags: ["Long-lasting", "Signature Scent"],
    color: "#D4A44A",
  },
  {
    id: 3,
    name: "Byredo Gypsy Water",
    tags: ["Clean", "High VOC"],
    color: "#2C2C2C",
  },
  {
    id: 4,
    name: "Lynene Rozu",
    tags: ["Long-lasting", "Signature Scent"],
    color: "#C9B896",
  },
  {
    id: 5,
    name: "Matror Violene",
    tags: ["Clean", "Long-lasting"],
    color: "#8B5E3C",
  },
];

function PerfumeBottle({ color }) {
  return (
    <View style={[styles.bottlePlaceholder, { backgroundColor: color + "20" }]}>
      <View style={[styles.bottleCap, { backgroundColor: color }]} />
      <View style={[styles.bottleBody, { backgroundColor: color + "40" }]}>
        <View style={[styles.bottleLabel, { backgroundColor: color + "60" }]} />
      </View>
    </View>
  );
}

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfume Library</Text>

        {PERFUMES.map((perfume) => (
          <View key={perfume.id} style={styles.card}>
            <PerfumeBottle color={perfume.color} />
            <View style={styles.cardContent}>
              <Text style={styles.perfumeName}>{perfume.name}</Text>
              <View style={styles.tagsRow}>
                {perfume.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
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
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  bottlePlaceholder: {
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
  cardContent: {
    flex: 1,
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.tagBg,
    borderWidth: 1,
    borderColor: COLORS.tagBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
