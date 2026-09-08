# ADR 001: Cross-Platform Expo & Modular Node.js Architecture

## Status
Accepted (2026-09-07)

## Context
We need to build a cross-platform (iOS, Android, Web) executive coaching and AI roleplay application that allows prompt-to-scenario generation, real-time counterpart dialogue, substance-based rubric scoring, and daily retention mechanics within a rapid Shipaton timeline.

## Decision
1. **Frontend**: Expo React Native with Web SPA output (`single`) and React Navigation. Avoid heavy local native emulators by leveraging Expo Web during dev and Expo Go / EAS Cloud builds for mobile.
2. **Backend**: Node.js + Express + TypeScript with clean domain-modular organization, multi-provider LLM support, and hybrid persistence.
3. **Monetization**: 5-day trial, $9/mo & $90/yr annual default with RevenueCat entitlement integration.

## Consequences
- Single codebase for Web and Mobile.
- Zero local Android Studio dependency required.
- Easy to test with automated Jest suites.
