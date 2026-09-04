# NGHU Timetable App & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a full-stack mobile solution for NGHU college timetable: a Node.js scraper/parser backend that extracts timetable data from `nghu.ru` PDF files, and a native Android application (Kotlin + Jetpack Compose) styled after the "Campus" (Кампус) app with group filtering, classroom occupancy view, teacher search, and offline support.

**Architecture:** A lightweight Node.js Express service scrapes `nghu.ru/students/timetable/`, parses PDF schedule matrices via `pdfjs-dist` into a structured JSON API. The native Android client (Kotlin + Jetpack Compose + Material 3 + Room DB + Retrofit) consumes the API with an offline-first strategy, rendering a polished modern timetable interface.

**Tech Stack:**
- Backend: Node.js, TypeScript, Express, `pdfjs-dist`, `cheerio`
- Android: Kotlin 2.0, Jetpack Compose, Material 3, AndroidX Room, Retrofit 2, Kotlinx Serialization, Coroutines, StateFlow
- Spec: `docs/superpowers/specs/2026-09-04-nghu-timetable-design.md`

## Global Constraints
- All backend code must run on Node 20+ (Node 24 installed).
- PDF coordinate parsing must handle multi-page schedules (Course 1-2 on Page 1, Course 3-4 on Page 2).
- Classrooms must distinguish Main Campus (Красный пр-т, 9) and Spartaka Campus (ул. Спартака, 12).
- Android app must compile with modern Android Studio / Gradle wrapper and support Android 8.0+ (API 26+).
- Offline-first: schedule must be accessible with zero internet once cached in Room.

---

### Task 1: Backend Scaffolding & Dependencies

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/types/index.ts`

**Interfaces:**
- Produces: TypeScript interfaces `TimetableMeta`, `Lesson`, `ScheduleDay`, `GroupInfo`, `RoomOccupancy`, `TeacherSchedule`

- [ ] **Step 1: Create server directory and package.json**
- [ ] **Step 2: Install dependencies (express, cors, pdfjs-dist, cheerio, typescript, ts-node, @types/node, @types/express, @types/cors)**
- [ ] **Step 3: Define TypeScript domain models in `server/src/types/index.ts`**
- [ ] **Step 4: Verify tsconfig compiles cleanly with `tsc --noEmit`**
- [ ] **Step 5: Commit scaffolding**

---

### Task 2: PDF Parser & Scraper Implementation

**Files:**
- Create: `server/src/parser/pdfParser.ts`
- Create: `server/src/parser/scraper.ts`
- Test: `server/tests/parser.test.ts`

**Interfaces:**
- Consumes: `schedule_sample.pdf`, `server/src/types/index.ts`
- Produces: `parsePdfBuffer(buffer: Buffer): Promise<ParsedSchedule>`, `fetchLatestSchedule(): Promise<ParsedSchedule>`

- [ ] **Step 1: Write test against real `schedule_sample.pdf` verifying extraction of groups (Ж-11..Д-43) and lessons**
- [ ] **Step 2: Run test and observe expected behavior**
- [ ] **Step 3: Implement `pdfParser.ts` with column-X group detection, row-Y time slot / day detection, and cell content normalization**
- [ ] **Step 4: Implement `scraper.ts` using `cheerio` to extract the latest timetable PDF URL from `https://nghu.ru/students/timetable/`**
- [ ] **Step 5: Run tests to verify full parser pass on both pages**
- [ ] **Step 6: Commit parser module**

---

### Task 3: REST API Server & Data Aggregators

**Files:**
- Create: `server/src/services/scheduleService.ts`
- Create: `server/src/routes/api.ts`
- Create: `server/src/index.ts`
- Test: `server/tests/api.test.ts`

**Interfaces:**
- Consumes: `fetchLatestSchedule`, `parsePdfBuffer`
- Produces: REST endpoints `/api/schedule`, `/api/groups`, `/api/rooms`, `/api/teachers`, `/api/refresh`

- [ ] **Step 1: Write integration tests for API endpoints**
- [ ] **Step 2: Implement `scheduleService.ts` with in-memory caching, room occupancy aggregator, and teacher schedule aggregator**
- [ ] **Step 3: Implement Express router in `server/src/routes/api.ts`**
- [ ] **Step 4: Implement entry point `server/src/index.ts` with periodic background refresh (every 30 mins)**
- [ ] **Step 5: Run integration tests and verify responses**
- [ ] **Step 6: Commit backend service**

---

### Task 4: Android Project Structure & Gradle Configuration

**Files:**
- Create: `android/settings.gradle.kts`
- Create: `android/build.gradle.kts`
- Create: `android/app/build.gradle.kts`
- Create: `android/app/src/main/AndroidManifest.xml`
- Create: `android/gradle/wrapper/gradle-wrapper.properties`

**Interfaces:**
- Produces: Complete Gradle project compilable by Android Studio / Gradle wrapper with dependencies for Jetpack Compose, Material 3, Room, Retrofit, Kotlinx Serialization.

- [ ] **Step 1: Setup root Gradle and wrapper configuration**
- [ ] **Step 2: Configure `app/build.gradle.kts` with Compose 1.7+, Material 3, Room 2.6+, Retrofit 2.11+, Navigation Compose**
- [ ] **Step 3: Configure `AndroidManifest.xml` with Internet permission and application entry point**
- [ ] **Step 4: Verify project configuration files**
- [ ] **Step 5: Commit Android scaffolding**

---

### Task 5: Android Domain & Data Layer (Room + Retrofit + Offline-First)

**Files:**
- Create: `android/app/src/main/java/ru/nghu/timetable/data/remote/ScheduleApi.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/data/remote/dto/ScheduleDto.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/data/local/TimetableDatabase.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/data/local/LessonEntity.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/data/local/ScheduleDao.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/data/repository/ScheduleRepository.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/domain/model/ScheduleModels.kt`

**Interfaces:**
- Consumes: Backend REST API
- Produces: `ScheduleRepository.getScheduleForGroup(group: String): Flow<Result<List<DaySchedule>>>`, `ScheduleRepository.getAllRooms(): Flow<List<RoomItem>>`, `ScheduleRepository.getAllTeachers(): Flow<List<TeacherItem>>`

- [ ] **Step 1: Define domain models in `ScheduleModels.kt`**
- [ ] **Step 2: Implement Retrofit interface & DTO mappings**
- [ ] **Step 3: Implement Room Entity, DAO with queries by group, room, and teacher**
- [ ] **Step 4: Implement `ScheduleRepository` with offline-first synchronization logic**
- [ ] **Step 5: Commit data layer**

---

### Task 6: Android Material 3 Theme & Campus-style Components

**Files:**
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/theme/Color.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/theme/Theme.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/components/LessonCard.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/components/LiveIndicator.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/components/DaySelector.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/components/GroupPickerBottomSheet.kt`

**Interfaces:**
- Produces: Reusable UI components matching Campus aesthetics (lesson cards with status dots, building badges, live timer bar, group selector bottom sheet).

- [ ] **Step 1: Create Campus color palette with subject category accent tags and light/dark theme support**
- [ ] **Step 2: Implement `LessonCard` with pair time, status badge, teacher avatar, and distinct Spartaka vs Main building badges**
- [ ] **Step 3: Implement `LiveIndicator` showing currently active lesson or break progress**
- [ ] **Step 4: Implement `DaySelector` horizontal day strip with "Today" marker**
- [ ] **Step 5: Implement `GroupPickerBottomSheet` for fast search and switching between courses and groups**
- [ ] **Step 6: Commit UI components**

---

### Task 7: Android Screens & Navigation

**Files:**
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/schedule/ScheduleScreen.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/schedule/ScheduleViewModel.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/rooms/RoomsScreen.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/rooms/RoomsViewModel.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/teachers/TeachersScreen.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/screens/teachers/TeachersViewModel.kt`
- Create: `android/app/src/main/java/ru/nghu/timetable/ui/MainActivity.kt`

**Interfaces:**
- Produces: 3 main navigation screens + Bottom Navigation Bar

- [ ] **Step 1: Implement `ScheduleViewModel` and `ScheduleScreen` (group timetable, pull-to-refresh, day tabs, lesson list)**
- [ ] **Step 2: Implement `RoomsViewModel` and `RoomsScreen` (building filter tabs, search, room cards with real-time occupancy status)**
- [ ] **Step 3: Implement `TeachersViewModel` and `TeachersScreen` (teacher search, alphabet grouping, teacher timetable view)**
- [ ] **Step 4: Implement `MainActivity` with Material 3 `Scaffold` and `NavigationBar`**
- [ ] **Step 5: Commit Android screens and navigation**

---

### Task 8: Verification & Run Documentation

**Files:**
- Create: `README.md` (instructions for opening in Android Studio, running the backend, configuring local IP/emulator)
- Test: Verify backend tests and end-to-end flow

- [ ] **Step 1: Run backend tests and verify all API endpoints return expected data**
- [ ] **Step 2: Document local network configuration for Android emulator (10.0.2.2) and physical devices**
- [ ] **Step 3: Final commit and walkthrough artifact generation**
