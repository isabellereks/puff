import React from "react";
import { View, StyleSheet } from "react-native";

export default function PerfumeBottle({ color }) {
  return (
    <View style={[styles.bottle, { backgroundColor: color + "20" }]}>
      <View style={[styles.bottleCap, { backgroundColor: color }]} />
      <View style={[styles.bottleBody, { backgroundColor: color + "40" }]}>
        <View style={[styles.bottleLabel, { backgroundColor: color + "60" }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottle: {
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
});
