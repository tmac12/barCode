# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20.2 barcode scanning application that uses the browser's native camera API and the Barcode Detector API (with ponyfill) to scan and detect barcodes in real-time.

## Key Architecture Decisions

**Zoneless Change Detection**: The application uses Angular's zoneless change detection (`provideZonelessChangeDetection()`), which means:
- All reactive state must use signals instead of traditional properties
- Manual change detection triggers are not needed
- Component updates are driven by signal changes

**Standalone Components**: The project uses Angular's standalone component architecture (no NgModule):
- Components declare their own imports via the `imports` array
- Application bootstrap is done via `bootstrapApplication()` in `src/main.ts`
- Configuration is centralized in `src/app/app.config.ts`

**Camera & Barcode Detection**: The main app component handles:
- Browser environment checks (HTTPS requirement, MediaDevices API availability)
- Camera stream management using `getUserMedia()` API
- Barcode detection using BarcodeDetector API with ponyfill fallback
- Frame-by-frame canvas-based scanning using `requestAnimationFrame()`

## Development Commands

```bash
# Start development server (http://localhost:4200)
npm start
# or
ng serve

# Build for production (outputs to dist/)
ng build

# Build in watch mode for development
npm run watch

# Run unit tests with Karma
npm test
# or
ng test

# Generate new components/services/etc
ng generate component component-name
ng generate service service-name
```

## TypeScript Configuration

The project uses **strict TypeScript settings**:
- Strict mode enabled with all strict checks
- `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` enabled
- Angular compiler strict settings: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`

When writing code, ensure all types are explicit and follow these strict rules.

## Prettier Configuration

Prettier is configured in `package.json`:
- Print width: 100 characters
- Single quotes for JavaScript/TypeScript
- HTML files use Angular parser

Format code before committing to maintain consistency.

## Testing Framework

- **Test Runner**: Karma with Jasmine
- **Test Configuration**: `tsconfig.spec.json`
- Tests are located alongside source files with `.spec.ts` extension

## Important Technical Constraints

**HTTPS Requirement**: Camera access via `getUserMedia()` requires:
- HTTPS connection in production
- OR localhost for development/testing

The app includes environment checks in `app.ts:29-46` that validate the protocol and provide user-friendly error messages.

**Browser API Support**: The app gracefully handles:
- Missing MediaDevices API
- Missing native BarcodeDetector (uses ponyfill from `barcode-detector` package)
- Various camera permission/access errors

## Component Structure

The application is intentionally minimal with a single component:
- `App` component (`src/app/app.ts`) handles all barcode scanning logic
- Uses `@ViewChild` to access video and canvas elements
- Manages camera stream lifecycle (start/stop/cleanup)
- Signal-based reactive state for all UI updates
