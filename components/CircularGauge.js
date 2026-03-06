import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Path,
} from "react-native-svg";
import { COLORS, FONTS } from "./theme";

export default function CircularGauge({ value = 45, size = 220 }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc from ~210° to ~330° (bottom-left to bottom-right, going through top)
  const startAngle = 220;
  const endAngle = 320;
  const sweepAngle = 360 - startAngle + endAngle;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx, cy, r, start, end) => {
    const startPt = polarToCartesian(cx, cy, r, start);
    const endPt = polarToCartesian(cx, cy, r, end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`;
  };

  // Background arc
  const bgArcPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);

  // Filled arc based on value (0-100)
  const fillSweep = (value / 100) * sweepAngle;
  const fillArcPath = describeArc(center, center, radius, startAngle, startAngle + fillSweep);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.mutedGreen} />
            <Stop offset="50%" stopColor={COLORS.warmBrown} />
            <Stop offset="100%" stopColor={COLORS.rose} />
          </LinearGradient>
        </Defs>

        {/* Background arc */}
        <Path
          d={bgArcPath}
          fill="none"
          stroke={COLORS.progressBg}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Gradient filled arc */}
        <Path
          d={fillArcPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Needle indicator dot */}
        {(() => {
          const needleAngle = startAngle + fillSweep;
          const needlePt = polarToCartesian(center, center, radius, needleAngle);
          return (
            <Circle
              cx={needlePt.x}
              cy={needlePt.y}
              r={6}
              fill={COLORS.card}
              stroke={COLORS.warmBrown}
              strokeWidth={2}
            />
          );
        })()}
      </Svg>

      {/* Center text */}
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
    paddingTop: 10,
  },
  valueText: {
    fontSize: 64,
    fontWeight: "300",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  rangeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});
