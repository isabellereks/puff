// Mock BLE sensor service for prototype
// Simulates a keychain sensor that monitors ambient air

let listeners = [];
let intervalId = null;
let currentScore = 25;
let sprayDetectedCallback = null;

function generateReading() {
  // Slowly drift the score with small random changes
  const drift = (Math.random() - 0.5) * 4;
  currentScore = Math.max(5, Math.min(95, currentScore + drift));

  // Decay toward baseline over time
  if (currentScore > 30) {
    currentScore -= 0.3;
  }

  return {
    score: Math.round(currentScore),
    alcohol_ppm: Math.round(currentScore * 3.2),
    timestamp: Date.now(),
  };
}

export function simulateSpray(intensity = 65) {
  // Spike the score to simulate a spray event
  currentScore = Math.min(95, intensity + Math.random() * 15);

  const event = {
    type: "spray_detected",
    score: Math.round(currentScore),
    alcohol_ppm: Math.round(currentScore * 3.2),
    timestamp: Date.now(),
  };

  if (sprayDetectedCallback) {
    sprayDetectedCallback(event);
  }

  return event;
}

export function startSensor(onReading, onSprayDetected) {
  sprayDetectedCallback = onSprayDetected || null;

  if (intervalId) return;

  intervalId = setInterval(() => {
    const reading = generateReading();
    listeners.forEach((cb) => cb(reading));
    if (onReading) onReading(reading);
  }, 2000);
}

export function stopSensor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  sprayDetectedCallback = null;
}

export function getCurrentReading() {
  return {
    score: Math.round(currentScore),
    alcohol_ppm: Math.round(currentScore * 3.2),
    timestamp: Date.now(),
    connected: intervalId !== null,
  };
}

export function addListener(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function getSensorStatus() {
  return {
    connected: intervalId !== null,
    deviceName: "Puff Keychain v1 (Mock)",
    battery: 87,
    firmware: "0.1.0-prototype",
  };
}
