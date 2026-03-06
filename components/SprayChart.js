import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import Svg, { Path, Circle, Line, Rect, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./theme";

const ICONS = [
  { name: "sunny-outline", fallback: "Morning" },
  { name: "partly-sunny-outline", fallback: "Noon" },
  { name: "moon-outline", fallback: "Evening" },
  { name: "cloudy-night-outline", fallback: "Night" },
];

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function SprayChart({ data }) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = data || [
    { label: "Morning", icon: "sunny-outline", value: 2, timestamp: null },
    { label: "Noon", icon: "partly-sunny-outline", value: 1, timestamp: null },
    { label: "Evening", icon: "moon-outline", value: 3, timestamp: null },
    { label: "Night", icon: "cloudy-night-outline", value: 0, timestamp: null },
  ];

  const width = layoutWidth || 280;
  const height = 140;
  const padding = { left: 32, right: 16, top: 20, bottom: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Labeled ticks at 0, 5, 10 with minor lines at 1,2,3,4,6,7,8,9
  const yTicksLabeled = [0, 5, 10];
  const yTicksMinor = [1, 2, 3, 4, 6, 7, 8, 9];
  const maxVal = 10;
  const minVal = 0;

  const points = chartData.map((d, i) => ({
    x: padding.left + (i / (chartData.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
    const cp1y = points[i].y;
    const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
    const cp2y = points[i + 1].y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const handlePress = (i) => {
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
    >
      {layoutWidth > 0 && (
        <>
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Minor grid lines */}
            {yTicksMinor.map((tick) => {
              const y = padding.top + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
              return (
                <Line
                  key={`minor-${tick}`}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#C8C2B8"
                  strokeWidth={0.3}
                />
              );
            })}

            {/* Labeled grid lines */}
            {yTicksLabeled.map((tick) => {
              const y = padding.top + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
              return (
                <React.Fragment key={`major-${tick}`}>
                  <Line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#B5AFA6"
                    strokeWidth={0.7}
                  />
                  <SvgText
                    x={padding.left - 8}
                    y={y + 4}
                    fontSize={9}
                    fill={COLORS.tabInactive}
                    textAnchor="end"
                  >
                    {tick}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Curve */}
            <Path
              d={pathD}
              fill="none"
              stroke={COLORS.warmBrown}
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <React.Fragment key={i}>
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={activeIndex === i ? 5 : 3.5}
                  fill={activeIndex === i ? COLORS.warmBrown : COLORS.card}
                  stroke={COLORS.warmBrown}
                  strokeWidth={1.5}
                />
                {/* Timestamp tooltip */}
                {activeIndex === i && chartData[i].timestamp && (
                  <>
                    <Rect
                      x={p.x - 30}
                      y={p.y - 24}
                      width={60}
                      height={18}
                      rx={9}
                      fill={COLORS.text}
                      opacity={0.85}
                    />
                    <SvgText
                      x={p.x}
                      y={p.y - 12}
                      fontSize={10}
                      fill="#FFFFFF"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {formatTime(chartData[i].timestamp)}
                    </SvgText>
                  </>
                )}
              </React.Fragment>
            ))}
          </Svg>

          {/* Touchable hit areas over each point */}
          {points.map((p, i) => (
            <Pressable
              key={`hit-${i}`}
              onPress={() => handlePress(i)}
              style={[
                styles.hitArea,
                { left: p.x - 20, top: p.y - 20 },
              ]}
            />
          ))}

          {/* Icon row */}
          <View style={styles.iconRow}>
            {chartData.map((d, i) => {
              const iconName = d.icon || ICONS[i]?.name || "ellipse-outline";
              return (
                <View
                  key={i}
                  style={[styles.iconItem, { left: points[i].x - 10, position: "absolute" }]}
                >
                  <Ionicons
                    name={iconName}
                    size={14}
                    color={activeIndex === i ? COLORS.warmBrown : COLORS.tabInactive}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 5,
  },
  hitArea: {
    position: "absolute",
    width: 40,
    height: 40,
  },
  iconRow: {
    height: 20,
    position: "relative",
  },
  iconItem: {
    width: 20,
    alignItems: "center",
  },
});
