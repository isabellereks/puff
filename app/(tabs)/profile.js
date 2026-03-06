import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { getSensorStatus } from "../../services/sensorService";

const MODE_INFO = {
  enthusiast: {
    label: "Perfume Enthusiast",
    description: "Optimize for intensity and longevity tracking",
    icon: "sparkles-outline",
  },
  health: {
    label: "Health-Conscious",
    description: "Focus on exposure levels and sensitivity alerts",
    icon: "heart-outline",
  },
  general: {
    label: "General Consumer",
    description: "Simple view focused on how long perfume lasts",
    icon: "person-outline",
  },
};

function ModeSelector({ currentMode, onSelect, onClose }) {
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Your Mode</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.modalContent}>
          {Object.entries(MODE_INFO).map(([key, mode]) => (
            <Pressable
              key={key}
              style={[styles.modeCard, currentMode === key && styles.modeCardActive]}
              onPress={() => { onSelect(key); onClose(); }}
            >
              <Ionicons
                name={mode.icon}
                size={22}
                color={currentMode === key ? "#5C6B52" : COLORS.textSecondary}
              />
              <View style={styles.modeInfo}>
                <Text style={[styles.modeLabel, currentMode === key && styles.modeLabelActive]}>
                  {mode.label}
                </Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
              {currentMode === key && (
                <Ionicons name="checkmark-circle" size={20} color="#5C6B52" />
              )}
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { state, dispatch, getLibraryPerfumes, getTotalSpraysThisMonth, getAverageDailySprays } = useApp();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const libraryPerfumes = getLibraryPerfumes();
  const totalSprays = getTotalSpraysThisMonth();
  const avgDaily = getAverageDailySprays();
  const sensor = getSensorStatus();

  const currentMode = MODE_INFO[state.settings.mode] || MODE_INFO.general;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.statValue}>{libraryPerfumes.length}</Text>
            <Text style={styles.statLabel}>Perfumes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSprays}</Text>
            <Text style={styles.statLabel}>Sprays</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgDaily}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>
        </View>

        {/* Current mode card */}
        <Pressable
          style={styles.modeCurrentCard}
          onPress={() => setShowModeSelector(true)}
        >
          <Ionicons name={currentMode.icon} size={20} color="#5C6B52" />
          <View style={styles.modeCurrentInfo}>
            <Text style={styles.modeCurrentLabel}>{currentMode.label}</Text>
            <Text style={styles.modeCurrentDesc}>{currentMode.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.tagBorder} />
        </Pressable>

        {/* Sensor status */}
        <View style={styles.sensorCard}>
          <View style={styles.sensorRow}>
            <Ionicons name="bluetooth-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.sensorName}>{sensor.deviceName}</Text>
          </View>
          <View style={styles.sensorDetails}>
            <Text style={styles.sensorDetail}>Battery: {sensor.battery}%</Text>
            <Text style={styles.sensorDetail}>Firmware: {sensor.firmware}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {[
            { icon: "settings-outline", label: "Settings" },
            { icon: "notifications-outline", label: "Notifications" },
            { icon: "shield-outline", label: "Privacy" },
            { icon: "help-circle-outline", label: "Help & Support" },
          ].map((item, i) => (
            <View
              key={i}
              style={[styles.menuItem, i < 3 && styles.menuItemBorder]}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.tagBorder} />
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {showModeSelector && (
        <ModeSelector
          currentMode={state.settings.mode}
          onSelect={(mode) => dispatch({ type: "SET_MODE", mode })}
          onClose={() => setShowModeSelector(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
    borderRadius: 36,
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

  modeCurrentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EDE5",
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    gap: 12,
  },
  modeCurrentInfo: {
    flex: 1,
  },
  modeCurrentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5C6B52",
  },
  modeCurrentDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  sensorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.neumorphicLight,
  },
  sensorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sensorName: {
    fontSize: 14,
    color: COLORS.text,
  },
  sensorDetails: {
    flexDirection: "row",
    gap: 16,
    marginLeft: 28,
  },
  sensorDetail: {
    fontSize: 12,
    color: COLORS.tabInactive,
  },

  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    marginHorizontal: 16,
    ...SHADOWS.neumorphicLight,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tagBg,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 14,
  },

  // Mode selector modal
  modalSafe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.text,
  },
  modalContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 18,
    gap: 14,
    ...SHADOWS.neumorphicLight,
  },
  modeCardActive: {
    backgroundColor: "#E8EDE5",
    borderWidth: 1,
    borderColor: "#C5D4B8",
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  modeLabelActive: {
    color: "#5C6B52",
  },
  modeDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
});
