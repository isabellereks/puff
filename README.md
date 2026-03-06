# Puff

A personal fragrance tracker with a BLE keychain sensor prototype. Track your perfumes, monitor scent intensity in real time, and stay aware of overexposure.

## Features

- **Scent Score** — live gauge powered by a Puff sensor that measures ambient fragrance concentration (0–100)
- **Spray Logging** — record spritzes with time, perfume, and spray count
- **Perfume Library** — browse, add, and annotate perfumes with ideal spray counts and personal notes
- **Ingredient Alerts** — flags for VOCs, phthalates, parabens, and synthetic musks with cleaner alternatives
- **Sustainability Scores** — eco ratings based on ingredient transparency
- **Scent Timeline** — daily spray chart broken down by time of day
- **Olfactory Fatigue Warnings** — alerts when your score enters overexposure territory

## Tech Stack

- React Native (Expo SDK 55)
- Expo Router (file-based tabs)
- React Context + useReducer with AsyncStorage persistence
- react-native-svg for gauges and charts
- react-native-gesture-handler for swipe interactions

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
app/(tabs)/       — tab screens (home, library, profile)
components/       — shared UI (CircularGauge, SprayChart, PerfumeBottle, PerfumeDetail)
context/          — app state (AppContext with reducer + persistence)
data/             — perfume database + ingredient flags
services/         — perfume lookup + mock BLE sensor
```
