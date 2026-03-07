// Secondary pollutant detection service
// Detects when VOC levels stay elevated or rise AFTER the initial spray spike,
// indicating terpene-ozone reactions producing formaldehyde and secondary organic aerosols.
//
// Design: configurable thresholds for tuning as sensor accuracy improves.

import { getFlaggedChemicals } from "../data/chemicalDatabase";

// Detection parameters (tunable)
const CONFIG = {
  // Seconds after spray before we start checking for secondary rise
  postSprayWindowStart: 120,    // 2 minutes after spray
  // Maximum window to monitor for secondary effects
  postSprayWindowEnd: 1800,     // 30 minutes
  // Score must be above this after the initial decay to count as secondary
  secondaryThreshold: 35,
  // Score must have dropped at least this much from peak before a secondary rise counts
  minDecayFromPeak: 10,
  // Minimum score rise from post-decay trough to qualify as secondary
  minSecondaryRise: 8,
  // Minimum duration (ms) of elevated readings to trigger an event
  minElevatedDuration: 60000,   // 1 minute
};

export function getDetectionConfig() {
  return { ...CONFIG };
}

// State for tracking an active detection session
let activeSession = null;

export function startDetectionSession(perfumeId, sprayTimestamp, peakScore) {
  activeSession = {
    perfumeId,
    sprayTimestamp,
    peakScore,
    postPeakTrough: peakScore,
    readings: [],
    secondaryDetected: false,
    secondaryStartTime: null,
    secondaryPeakScore: 0,
  };
}

export function endDetectionSession() {
  const session = activeSession;
  activeSession = null;
  return session;
}

export function getActiveSession() {
  return activeSession;
}

// Feed a sensor reading into the detector. Returns a detection event or null.
export function processReading(reading) {
  if (!activeSession) return null;

  const elapsed = (reading.timestamp - activeSession.sprayTimestamp) / 1000;

  // Too early — still in initial spray spike
  if (elapsed < CONFIG.postSprayWindowStart) {
    // Track the decay
    if (reading.score < activeSession.postPeakTrough) {
      activeSession.postPeakTrough = reading.score;
    }
    return null;
  }

  // Past the monitoring window
  if (elapsed > CONFIG.postSprayWindowEnd) {
    if (activeSession.secondaryDetected) {
      return finalizeDetection();
    }
    endDetectionSession();
    return null;
  }

  // Within monitoring window: check for secondary rise
  activeSession.readings.push(reading);

  // Track lowest point after initial decay
  if (!activeSession.secondaryDetected && reading.score < activeSession.postPeakTrough) {
    activeSession.postPeakTrough = reading.score;
  }

  const decayFromPeak = activeSession.peakScore - activeSession.postPeakTrough;
  const riseFromTrough = reading.score - activeSession.postPeakTrough;

  if (
    !activeSession.secondaryDetected &&
    decayFromPeak >= CONFIG.minDecayFromPeak &&
    riseFromTrough >= CONFIG.minSecondaryRise &&
    reading.score >= CONFIG.secondaryThreshold
  ) {
    activeSession.secondaryDetected = true;
    activeSession.secondaryStartTime = reading.timestamp;
    activeSession.secondaryPeakScore = reading.score;
  }

  if (activeSession.secondaryDetected) {
    if (reading.score > activeSession.secondaryPeakScore) {
      activeSession.secondaryPeakScore = reading.score;
    }

    const secondaryDuration = reading.timestamp - activeSession.secondaryStartTime;
    if (secondaryDuration >= CONFIG.minElevatedDuration) {
      return {
        type: "secondary_exposure_alert",
        perfumeId: activeSession.perfumeId,
        durationMs: secondaryDuration,
        peakScore: activeSession.secondaryPeakScore,
        message:
          "Your scent may be reacting with indoor air to produce secondary pollutants like formaldehyde. Consider ventilating the room.",
      };
    }
  }

  return null;
}

function finalizeDetection() {
  if (!activeSession?.secondaryDetected) return null;

  const lastReading = activeSession.readings[activeSession.readings.length - 1];
  const durationMs = lastReading
    ? lastReading.timestamp - activeSession.secondaryStartTime
    : 0;

  const result = {
    type: "secondary_exposure_complete",
    perfumeId: activeSession.perfumeId,
    durationMs,
    peakScore: activeSession.secondaryPeakScore,
    terpenes: getReactiveTerpenes(activeSession.perfumeId),
  };

  endDetectionSession();
  return result;
}

// Check if a perfume contains reactive terpenes
export function hasReactiveTerpenes(perfume) {
  if (!perfume?.ingredients?.vocs) return false;
  const reactive = ["limonene", "alpha-pinene", "beta-pinene"];
  return perfume.ingredients.vocs.some((v) =>
    reactive.includes(v.toLowerCase())
  );
}

// Get list of reactive terpenes in a perfume
function getReactiveTerpenes(perfumeId) {
  // This is a lightweight check — caller can pass perfume directly for richer data
  return [];
}

export function getReactiveTerpenesFromPerfume(perfume) {
  if (!perfume?.ingredients?.vocs) return [];
  const reactive = ["limonene", "alpha-pinene", "beta-pinene"];
  return perfume.ingredients.vocs.filter((v) =>
    reactive.includes(v.toLowerCase())
  );
}
