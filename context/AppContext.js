import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PERFUME_DATABASE from "../data/perfumeDatabase";
import { getSustainabilityScore } from "../data/ingredientFlags";

const AppContext = createContext();

const STORAGE_KEY = "@puff_state";

const USER_MODES = {
  enthusiast: "enthusiast",
  health: "health",
  general: "general",
};

const DEFAULT_STATE = {
  // User's personal perfume library (subset they own/track)
  library: [
    { perfumeId: "p001", addedAt: Date.now() - 86400000 * 30, preferredRange: [40, 50] },
    { perfumeId: "p002", addedAt: Date.now() - 86400000 * 20, preferredRange: [55, 65] },
    { perfumeId: "p003", addedAt: Date.now() - 86400000 * 15, preferredRange: [50, 60] },
    { perfumeId: "p004", addedAt: Date.now() - 86400000 * 10, preferredRange: [35, 45] },
  ],

  // Spray event log
  sprayEvents: generateMockSprayHistory(),

  // Sensor readings over time
  sensorHistory: [],

  // Per-perfume journal entries
  journal: [],

  // Profile
  profileImage: null,

  // User settings
  settings: {
    mode: USER_MODES.general,
    notifications: true,
    sensorConnected: false,
  },

  // Live sensor state
  liveScore: 25,
  sensorConnected: false,
};

function generateMockSprayHistory() {
  const now = Date.now();
  const day = 86400000;
  const perfumeIds = ["p001", "p002", "p003", "p004"];
  const events = [];

  for (let d = 29; d >= 0; d--) {
    const spraysToday = 1 + Math.floor(Math.random() * 4);
    for (let s = 0; s < spraysToday; s++) {
      const hour = 7 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      events.push({
        id: `spray_${d}_${s}`,
        perfumeId: perfumeIds[Math.floor(Math.random() * perfumeIds.length)],
        timestamp: now - d * day + hour * 3600000 + minute * 60000,
        score: 40 + Math.floor(Math.random() * 40),
        confirmed: true,
        notes: null,
      });
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

function appReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };

    case "SET_LIVE_SCORE":
      return { ...state, liveScore: action.score };

    case "SET_SENSOR_CONNECTED":
      return { ...state, sensorConnected: action.connected };

    case "ADD_TO_LIBRARY": {
      if (state.library.find((l) => l.perfumeId === action.perfumeId)) return state;
      return {
        ...state,
        library: [
          ...state.library,
          {
            perfumeId: action.perfumeId,
            addedAt: Date.now(),
            preferredRange: action.preferredRange || [40, 60],
          },
        ],
      };
    }

    case "REMOVE_FROM_LIBRARY":
      return {
        ...state,
        library: state.library.filter((l) => l.perfumeId !== action.perfumeId),
      };

    case "UPDATE_PREFERRED_RANGE":
      return {
        ...state,
        library: state.library.map((l) =>
          l.perfumeId === action.perfumeId
            ? { ...l, preferredRange: action.range }
            : l
        ),
      };

    case "LOG_SPRAY": {
      const event = {
        id: `spray_${Date.now()}`,
        perfumeId: action.perfumeId,
        timestamp: Date.now(),
        score: action.score || state.liveScore,
        confirmed: action.confirmed ?? true,
        notes: action.notes || null,
      };
      return {
        ...state,
        sprayEvents: [...state.sprayEvents, event],
      };
    }

    case "ADD_JOURNAL_ENTRY":
      return {
        ...state,
        journal: [
          ...state.journal,
          {
            id: `journal_${Date.now()}`,
            perfumeId: action.perfumeId,
            text: action.text,
            timestamp: Date.now(),
          },
        ],
      };

    case "ADD_SENSOR_READING":
      return {
        ...state,
        sensorHistory: [
          ...state.sensorHistory.slice(-500),
          action.reading,
        ],
      };

    case "SET_PROFILE_IMAGE":
      return { ...state, profileImage: action.uri };

    case "SET_MODE":
      return {
        ...state,
        settings: { ...state.settings, mode: action.mode },
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, DEFAULT_STATE);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          dispatch({ type: "HYDRATE", payload: parsed });
        } catch {}
      }
    });
  }, []);

  // Persist on meaningful changes
  useEffect(() => {
    const { liveScore, sensorConnected, sensorHistory, ...persistable } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)).catch(() => {});
  }, [state.library, state.sprayEvents, state.journal, state.settings, state.profileImage]);

  // Derived data helpers
  const getLibraryPerfumes = () => {
    return state.library.map((entry) => {
      const perfume = PERFUME_DATABASE.find((p) => p.id === entry.perfumeId);
      return perfume ? { ...perfume, ...entry } : null;
    }).filter(Boolean);
  };

  const getSprayEventsToday = () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return state.sprayEvents.filter((e) => e.timestamp >= startOfDay.getTime());
  };

  const getSprayEventsForMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return state.sprayEvents.filter((e) => e.timestamp >= startOfMonth);
  };

  const getTotalSpraysThisMonth = () => getSprayEventsForMonth().length;

  const getAverageDailySprays = () => {
    const events = getSprayEventsForMonth();
    const dayOfMonth = new Date().getDate();
    return dayOfMonth > 0 ? (events.length / dayOfMonth).toFixed(1) : "0";
  };

  const getOverallSustainabilityScore = () => {
    const perfumes = getLibraryPerfumes();
    if (perfumes.length === 0) return 50;
    const total = perfumes.reduce((sum, p) => sum + getSustainabilityScore(p), 0);
    return Math.round(total / perfumes.length);
  };

  const getPerfumeSprayCount = (perfumeId) => {
    return state.sprayEvents.filter((e) => e.perfumeId === perfumeId).length;
  };

  const value = {
    state,
    dispatch,
    getLibraryPerfumes,
    getSprayEventsToday,
    getSprayEventsForMonth,
    getTotalSpraysThisMonth,
    getAverageDailySprays,
    getOverallSustainabilityScore,
    getPerfumeSprayCount,
    USER_MODES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
