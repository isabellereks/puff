import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import { COLORS, FONTS, NUMBER_STYLE } from "./theme";

function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr},${rg},${rb})`;
}

export default function CircularGauge({ value = 45, size = 330 }) {
  const strokeWidth = 22;
  const radius = (size - strokeWidth - 20) / 2;
  const center = size / 2;

  const toXY = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  // Full circle gradient using many small segments
  const numSegs = 90;
  const segAngle = 360 / numSegs;

  const colorStops = [
    { t: 0, color: "#D6BCB4" },
    { t: 0.15, color: "#9AAC86" },
    { t: 0.35, color: "#A8AD8A" },
    { t: 0.50, color: "#BBAA92" },
    { t: 0.65, color: "#CBB0A0" },
    { t: 0.80, color: "#D8BAB0" },
    { t: 0.95, color: "#DEC0B8" },
    { t: 1, color: "#D6BCB4" },
  ];

  const getColor = (t) => {
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (t >= colorStops[i].t && t <= colorStops[i + 1].t) {
        const local = (t - colorStops[i].t) / (colorStops[i + 1].t - colorStops[i].t);
        return lerpColor(colorStops[i].color, colorStops[i + 1].color, local);
      }
    }
    return colorStops[colorStops.length - 1].color;
  };

  const arcs = [];
  for (let i = 0; i < numSegs; i++) {
    const a1 = i * segAngle;
    const a2 = (i + 1) * segAngle + 0.8;
    const p1 = toXY(a1);
    const p2 = toXY(Math.min(a2, 360));
    arcs.push(
      <Path
        key={i}
        d={`M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`}
        fill="none"
        stroke={getColor(i / numSegs)}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Needle
  const needleAngle = (value / 100) * 360;
  const nRad = ((needleAngle - 90) * Math.PI) / 180;
  const nFrom = {
    x: center + (radius - strokeWidth / 2 + 2) * Math.cos(nRad),
    y: center + (radius - strokeWidth / 2 + 2) * Math.sin(nRad),
  };
  const nTo = {
    x: center + (radius + strokeWidth / 2 + 16) * Math.cos(nRad),
    y: center + (radius + strokeWidth / 2 + 16) * Math.sin(nRad),
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs}

        {/* Needle */}
        <Line
          x1={nFrom.x}
          y1={nFrom.y}
          x2={nTo.x}
          y2={nTo.y}
          stroke="#C0A590"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Circle cx={nTo.x} cy={nTo.y} r={2.5} fill="#C0A590" />
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.rangeText}>
          Your ideal range for this{"\n"}perfume: 40–50.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 56,
    color: COLORS.text,
    ...NUMBER_STYLE,
  },
  rangeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});
