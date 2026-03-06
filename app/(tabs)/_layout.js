import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../components/theme";

function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { icon: "flower-outline", iconActive: "flower", label: "Home" },
    { icon: "search-outline", iconActive: "search", label: "Library" },
    { icon: "leaf-outline", iconActive: "leaf", label: "Wellness" },
    { icon: "person-outline", iconActive: "person", label: "Profile" },
  ];

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = tabs[index];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons
                  name={isFocused ? tab.iconActive : tab.icon}
                  size={20}
                  color={isFocused ? "#6B5D4F" : "#B5AFA6"}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="wellness" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(166,123,91,0.1)",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#B5AFA6",
  },
  labelActive: {
    color: "#6B5D4F",
    fontWeight: "600",
  },
});
