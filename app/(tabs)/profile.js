import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONTS, SHADOWS, NUMBER_STYLE } from "../../components/theme";
import { useApp } from "../../context/AppContext";
import { getSensorStatus } from "../../services/sensorService";

const MODE_INFO = {
  enthusiast: {
    label: "Perfume Enthusiast",
    description: "Optimize for intensity and longevity tracking",
    icon: "sparkles-outline",
    color: "#C4A860",
  },
  health: {
    label: "Health-Conscious",
    description: "Focus on exposure levels and sensitivity alerts",
    icon: "heart-outline",
    color: "#7A8E6A",
  },
  general: {
    label: "General Consumer",
    description: "Simple view focused on how long perfume lasts",
    icon: "person-outline",
    color: "#A67B5B",
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      dispatch({ type: "SET_PROFILE_IMAGE", uri: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Profile</Text>
          <Pressable onPress={() => setShowModeSelector(true)} hitSlop={12}>
            <Ionicons name={currentMode.icon} size={22} color={currentMode.color} />
          </Pressable>
        </View>

        <View style={styles.avatarContainer}>
          <Pressable style={styles.avatarWrapper} onPress={pickImage}>
            <View style={[styles.avatarRim, { borderColor: currentMode.color }]}>
              <View style={styles.avatar}>
                {state.profileImage ? (
                  <Image source={{ uri: state.profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={48} color={COLORS.tabInactive} />
                )}
              </View>
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={12} color="#FFFFFF" />
            </View>
          </Pressable>
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
            { icon: "flask-outline", label: "Request a Perfume" },
            { icon: "help-circle-outline", label: "Help & Support" },
          ].map((item, i, arr) => (
            <View
              key={i}
              style={[styles.menuItem, i < arr.length - 1 && styles.menuItemBorder]}
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 30,
    color: COLORS.text,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: {
    width: 98,
    height: 98,
    marginBottom: 14,
  },
  avatarRim: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.progressBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...SHADOWS.neumorphicLight,
  },
  avatarImage: {
    width: 90,
    height: 90,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.tabActive,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
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
    ...SHADOWS.neumorphicLight,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
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
