# Facility Management

Expo Router application for resident facility services and worker maintenance
workflows. The app supports English and Arabic, LTR and RTL layouts, NativeWind,
TanStack Query, Expo Secure Store, push notifications, and Legend List.

## Requirements

- Node.js 22
- npm
- Expo-compatible Android/iOS development environment

## Setup

```bash
npm ci
cp .env.example .env.local
npm start
```

Set `EXPO_PUBLIC_API_BASE_URL` to the JSON-RPC mobile API root. The application
intentionally has no fallback URL, preventing production builds from silently
connecting to a test backend.

## Quality checks

```bash
npm run check
```

This runs ESLint, strict TypeScript, and the Node regression tests. Pull requests
and pushes to `main` run the same checks in GitHub Actions.

## EAS environments

- Development and preview currently use the test Odoo environment in `eas.json`.
- Production reads `EXPO_PUBLIC_API_BASE_URL` from the EAS `production`
  environment. Configure that variable before creating a production build.

## Architecture

- `src/app`: Expo Router screens and route layouts
- `src/components`: reusable UI
- `src/hooks`: reusable React hooks
- `src/lib`: framework-independent helpers and API infrastructure
- `src/providers`: application providers
- `src/stores`: TanStack Query data hooks and small Zustand client stores
- `src/constants`: translations, navigation, theme, and static configuration

See `BACKEND_API_REQUIREMENTS.md` for the detail endpoints and stable
authentication error contract required by notifications and direct links.
