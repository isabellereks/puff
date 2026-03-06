import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";
import { COLORS } from "./theme";

export default function SprayChart({ data }) {
  const chartData = data || [
    { label: "Morning", value: 30 },
    { label: "Noon", value: 45 },
    { label: "Evening", value: 35 },
    { label: "Night", value: 50 },
  ];

  const width = 300;
  const height = 120;
  const padding = { left: 35, right: 35, top: 15, bottom: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = 60;
  const minVal = 0;

  const points = chartData.map((d, i) => ({
    x: padding.left + (i / (chartData.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
  }));

  // Create smooth curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
    const cp1y = points[i].y;
    const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
    const cp2y = points[i + 1].y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 1, 2].map((i) => (
          <Line
            key={i}
            x1={padding.left}
            y1={padding.top + (i / 2) * chartH}
            x2={width - padding.right}
            y2={padding.top + (i / 2) * chartH}
            stroke={COLORS.progressBg}
            strokeWidth={0.5}
          />
        ))}

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={COLORS.warmBrown}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill={COLORS.card}
            stroke={COLORS.warmBrown}
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {chartData.map((d, i) => (
          <SvgText
            key={i}
            x={points[i].x}
            y={height - 8}
            fontSize={11}
            fill={COLORS.textSecondary}
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 5,
  },
});
