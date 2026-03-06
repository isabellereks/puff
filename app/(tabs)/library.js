import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS } from "../../components/theme";
import PerfumeBottle from "../../components/PerfumeBottle";
import PerfumeDetail from "../../components/PerfumeDetail";
import { useApp } from "../../context/AppContext";
import { searchPerfumes, getAllPerfumes } from "../../services/perfumeService";
import { getPerfumeFlags } from "../../data/ingredientFlags";

export default function LibraryScreen() {
  const { state, dispatch, getLibraryPerfumes } = useApp();
  const [query, setQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [browseAll, setBrowseAll] = useState(false);
  const libraryPerfumes = getLibraryPerfumes();
  const libraryIds = state.library.map((l) => l.perfumeId);

  const allPerfumes = browseAll ? getAllPerfumes() : null;
  const results = query.length >= 2 ? searchPerfumes(query) : [];
  const showSearch = query.length >= 2;

  const handleAddRemove = (perfume) => {
    if (libraryIds.includes(perfume.id)) {
      dispatch({ type: "REMOVE_FROM_LIBRARY", perfumeId: perfume.id });
    } else {
      dispatch({ type: "ADD_TO_LIBRARY", perfumeId: perfume.id });
    }
    setSelectedPerfume(null);
  };

  const displayList = showSearch ? results : browseAll ? allPerfumes : libraryPerfumes;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfume Library</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.tabInactive} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search perfumes..."
            placeholderTextColor={COLORS.tabInactive}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.tabInactive} />
            </Pressable>
          )}
        </View>

        {showSearch && (
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Text>
        )}

        {!showSearch && (
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>
              {browseAll ? `All perfumes (${allPerfumes.length})` : `Your collection (${libraryPerfumes.length})`}
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => setBrowseAll(!browseAll)}
            >
              <Text style={styles.browseButtonText}>
                {browseAll ? "My Library" : "Browse All"}
              </Text>
            </Pressable>
          </View>
        )}

        {displayList.map((perfume) => {
          const inLib = libraryIds.includes(perfume.id);
          const flags = getPerfumeFlags(perfume);
          return (
            <Pressable
              key={perfume.id}
              style={styles.card}
              onPress={() => setSelectedPerfume(perfume)}
            >
              <PerfumeBottle color={perfume.bottleColor || "#CCC"} />
              <View style={styles.cardContent}>
                <Text style={styles.brandName}>{perfume.brand}</Text>
                <Text style={styles.perfumeName}>{perfume.name}</Text>
                <View style={styles.tagsRow}>
                  {inLib && (
                    <View style={[styles.tag, { backgroundColor: "#E8EDE5" }]}>
                      <Text style={[styles.tagText, { color: "#5C6B52" }]}>in library</Text>
                    </View>
                  )}
                  {flags.length > 0 && (
                    <View style={[styles.tag, { backgroundColor: "#F2E5D8" }]}>
                      <Text style={[styles.tagText, { color: "#9E7C56" }]}>
                        {flags.length} alert{flags.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                  {perfume.longevity && (
                    <View style={[styles.tag, { backgroundColor: "#E8E6EC" }]}>
                      <Text style={[styles.tagText, { color: "#6B6878" }]}>{perfume.longevity}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable
                style={styles.heartButton}
                onPress={() => {
                  if (inLib) {
                    dispatch({ type: "REMOVE_FROM_LIBRARY", perfumeId: perfume.id });
                  } else {
                    dispatch({ type: "ADD_TO_LIBRARY", perfumeId: perfume.id });
                  }
                }}
                hitSlop={10}
              >
                <Ionicons
                  name={inLib ? "heart" : "heart-outline"}
                  size={20}
                  color={inLib ? COLORS.dustyRose : COLORS.tabInactive}
                />
              </Pressable>
            </Pressable>
          );
        })}

        {showSearch && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No perfumes found for "{query}"</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedPerfume && (
        <PerfumeDetail
          perfume={selectedPerfume}
          onClose={() => setSelectedPerfume(null)}
          onAdd={handleAddRemove}
          inLibrary={libraryIds.includes(selectedPerfume.id)}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    ...SHADOWS.neumorphicLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  browseButton: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    ...SHADOWS.neumorphicLight,
  },
  browseButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  resultCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 36,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    ...SHADOWS.neumorphicLight,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  cardContent: {
    flex: 1,
  },
  brandName: {
    fontSize: 11,
    color: COLORS.tabInactive,
    textTransform: "uppercase",
  },
  perfumeName: {
    fontSize: 17,
    color: COLORS.text,
    marginTop: 1,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "400",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
