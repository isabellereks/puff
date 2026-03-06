import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line, Rect } from "react-native-svg";
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

export default function CircularGauge({ value = 45, size = 330, preferredRange = [40, 50], sprayEvents = [] }) {
  const strokeWidth = 22;
  const radius = (size - strokeWidth - 30) / 2;
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

  // Spray event markers on the ring
  const eventMarkerRadius = radius + strokeWidth / 2 + 6;
  const eventMarkers = sprayEvents.map((evt) => {
    const angle = (Math.min(evt.score, 100) / 100) * 360;
    return toXYCustom(angle, eventMarkerRadius, center);
  });

  // Needle (wand — pointed tip, rounded base)
  const needleAngle = (value / 100) * 360;
  const nRad = ((needleAngle - 90) * Math.PI) / 180;
  const perpRad = nRad + Math.PI / 2;
  const tipR = radius + strokeWidth / 2 + 14;
  const baseR = radius - strokeWidth / 2 - 35;
  const baseWidth = 3;

  const tip = {
    x: center + tipR * Math.cos(nRad),
    y: center + tipR * Math.sin(nRad),
  };
  // Control point very close to tip for almost no taper until the end
  const cpR = baseR + (tipR - baseR) * 0.15;
  const cpWidth = baseWidth * 0.98;
  const cpL = {
    x: center + cpR * Math.cos(nRad) + cpWidth * Math.cos(perpRad),
    y: center + cpR * Math.sin(nRad) + cpWidth * Math.sin(perpRad),
  };
  const cpRt = {
    x: center + cpR * Math.cos(nRad) - cpWidth * Math.cos(perpRad),
    y: center + cpR * Math.sin(nRad) - cpWidth * Math.sin(perpRad),
  };
  const baseL = {
    x: center + baseR * Math.cos(nRad) + baseWidth * Math.cos(perpRad),
    y: center + baseR * Math.sin(nRad) + baseWidth * Math.sin(perpRad),
  };
  const baseRt = {
    x: center + baseR * Math.cos(nRad) - baseWidth * Math.cos(perpRad),
    y: center + baseR * Math.sin(nRad) - baseWidth * Math.sin(perpRad),
  };
  const needlePath = `M ${tip.x} ${tip.y} Q ${cpL.x} ${cpL.y} ${baseL.x} ${baseL.y} A ${baseWidth} ${baseWidth} 0 0 1 ${baseRt.x} ${baseRt.y} Q ${cpRt.x} ${cpRt.y} ${tip.x} ${tip.y} Z`;

  const inRange = value >= preferredRange[0] && value <= preferredRange[1];

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs}

        {/* Spray event markers */}
        {eventMarkers.map((pos, i) => (
          <Circle key={i} cx={pos.x} cy={pos.y} r={3} fill="#A08878" opacity={0.5} />
        ))}

        {/* Needle (wand) */}
        <Path d={needlePath} fill="#A08878" opacity={0.9} />
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    </View>
  );
}

function toXYCustom(angle, radius, center) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
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
