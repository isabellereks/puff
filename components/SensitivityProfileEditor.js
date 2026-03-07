import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "./theme";
import {
  HEALTH_SENSITIVITIES,
  LIFE_STAGES,
  AGE_BRACKETS,
} from "../data/sensitivityProfile";
import { HEALTH_DISCLAIMER } from "../data/chemicalDatabase";

export default function SensitivityProfileEditor({ profile, onSave, onClose }) {
  const [sensitivities, setSensitivities] = useState(profile?.sensitivities || []);
  const [lifeStage, setLifeStage] = useState(profile?.lifeStage || "neither");
  const [ageBracket, setAgeBracket] = useState(profile?.ageBracket || "adult");

  const toggleSensitivity = (id) => {
    setSensitivities((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave({ sensitivities, lifeStage, ageBracket });
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Profile</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            This optional profile personalizes your health alerts and risk highlights.
            Your data stays on this device.
          </Text>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.tabInactive} />
            <Text style={styles.disclaimerText}>{HEALTH_DISCLAIMER}</Text>
          </View>

          {/* Health Sensitivities */}
          <Text style={styles.sectionLabel}>Health sensitivities</Text>
          <Text style={styles.sectionHint}>Select any that apply to you</Text>
          <View style={styles.optionsGrid}>
            {HEALTH_SENSITIVITIES.map((sens) => {
              const selected = sensitivities.includes(sens.id);
              return (
                <Pressable
                  key={sens.id}
                  style={[styles.optionChip, selected && styles.optionChipSelected]}
                  onPress={() => toggleSensitivity(sens.id)}
                >
                  <Ionicons
                    name={sens.icon}
                    size={16}
                    color={selected ? "#5C6B52" : COLORS.textSecondary}
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {sens.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="#5C6B52" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Life Stage */}
          <Text style={styles.sectionLabel}>Life stage</Text>
          <Text style={styles.sectionHint}>
            Research flags specific risks during pregnancy and breastfeeding
          </Text>
          <View style={styles.optionsList}>
            {LIFE_STAGES.map((stage) => (
              <Pressable
                key={stage.id}
                style={[styles.radioRow, lifeStage === stage.id && styles.radioRowSelected]}
                onPress={() => setLifeStage(stage.id)}
              >
                <View style={[styles.radio, lifeStage === stage.id && styles.radioActive]}>
                  {lifeStage === stage.id && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.radioLabel, lifeStage === stage.id && styles.radioLabelSelected]}>
                  {stage.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Age Bracket */}
          <Text style={styles.sectionLabel}>Age bracket</Text>
          <Text style={styles.sectionHint}>
            Children and elderly individuals are more vulnerable to chemical exposure
          </Text>
          <View style={styles.optionsList}>
            {AGE_BRACKETS.map((age) => (
              <Pressable
                key={age.id}
                style={[styles.radioRow, ageBracket === age.id && styles.radioRowSelected]}
                onPress={() => setAgeBracket(age.id)}
              >
                <View style={[styles.radio, ageBracket === age.id && styles.radioActive]}>
                  {ageBracket === age.id && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.radioLabel, ageBracket === age.id && styles.radioLabelSelected]}>
                  {age.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save profile</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 12,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  intro: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0EDE8",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.tabInactive,
    lineHeight: 16,
    fontStyle: "italic",
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  optionsGrid: {
    gap: 8,
    marginBottom: 24,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
    ...SHADOWS.neumorphicLight,
  },
  optionChipSelected: {
    backgroundColor: "#E8EDE5",
    borderWidth: 1,
    borderColor: "#C5D4B8",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: "#5C6B52",
    fontWeight: "500",
  },
  optionsList: {
    gap: 8,
    marginBottom: 24,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    ...SHADOWS.neumorphicLight,
  },
  radioRowSelected: {
    backgroundColor: "#E8EDE5",
    borderWidth: 1,
    borderColor: "#C5D4B8",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.tagBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#5C6B52",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5C6B52",
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  radioLabelSelected: {
    color: "#5C6B52",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: COLORS.mutedGreen,
    borderRadius: 36,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
