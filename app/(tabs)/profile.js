import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.tabInactive} />
          </View>
          <Text style={styles.name}>Isabelle R.</Text>
          <Text style={styles.subtitle}>Scent enthusiast since 2023</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Perfumes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>87</Text>
            <Text style={styles.statLabel}>Sprays</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.2</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {[
            { icon: "settings-outline", label: "Settings" },
            { icon: "notifications-outline", label: "Notifications" },
            { icon: "shield-outline", label: "Privacy" },
            { icon: "help-circle-outline", label: "Help & Support" },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.menuItem,
                i < 3 && styles.menuItemBorder,
              ]}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.tagBorder} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.progressBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  name: {
    fontFamily: FONTS.title,
    fontSize: 22,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    ...SHADOWS.neumorphicLight,
  },
  statValue: {
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
    ...NUMBER_STYLE,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    ...SHADOWS.neumorphicLight,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tagBg,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 14,
  },
});
