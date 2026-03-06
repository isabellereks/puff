import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";

const TAG_STYLES = {
  "clean": { bg: "#E8E6EC", text: "#6B6878" },
  "high voc": { bg: "#F2E5D8", text: "#9E7C56" },
  "long-lasting": { bg: "#EAE6DC", text: "#7A7452" },
  "signature scent": { bg: "#E8EDE5", text: "#5C6B52" },
};

const PERFUMES = [
  { id: 1, brand: "Le Labo", name: "Santal 33", tags: ["Clean", "High VOC"], color: "#E8DFD0" },
  { id: 2, brand: "Aesop", name: "Rozu", tags: ["Long-lasting", "Signature Scent"], color: "#D4A44A" },
  { id: 3, brand: "Byredo", name: "Gypsy Water", tags: ["Clean", "High VOC"], color: "#2C2C2C" },
  { id: 4, brand: "Lynene", name: "Rozu", tags: ["Long-lasting", "Signature Scent"], color: "#C9B896" },
  { id: 5, brand: "Matror", name: "Violene", tags: ["Clean", "Long-lasting"], color: "#8B5E3C" },
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

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.tabInactive} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search perfumes..."
            placeholderTextColor={COLORS.tabInactive}
          />
        </View>

        {PERFUMES.map((perfume) => (
          <View key={perfume.id} style={styles.card}>
            <PerfumeBottle color={perfume.color} />
            <View style={styles.cardContent}>
              <Text style={styles.brandName}>{perfume.brand}</Text>
              <Text style={styles.perfumeName}>{perfume.name}</Text>
              <View style={styles.tagsRow}>
                {perfume.tags.map((tag, i) => {
                  const ts = TAG_STYLES[tag.toLowerCase()] || { bg: "#F0EDE8", text: "#7A7A7A" };
                  return (
                    <View key={i} style={[styles.tag, { backgroundColor: ts.bg }]}>
                      <Text style={[styles.tagText, { color: ts.text }]}>{tag.toLowerCase()}</Text>
                    </View>
                  );
                })}
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
    fontFamily: FONTS.title,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    shadowColor: "#C8C2B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
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
  brandName: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  perfumeName: {
    fontFamily: FONTS.title,
    fontSize: 17,
    color: COLORS.text,
    marginTop: 1,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
