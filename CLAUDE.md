# Gym Workout Tracker

## Overview
Personal gym workout tracker to register exercises, weights, reps, and track progression over time with dashboard charts.

## Tech Stack
- **Frontend**: Vue.js 3 (Composition API + `<script setup>`) + Vite + PrimeVue 4 (Aura theme, light mode)
- **Backend**: Node.js + Express (CommonJS)
- **Database**: PostgreSQL 16 (Docker Compose) + Prisma ORM
- **Charts**: Chart.js + vue-chartjs
- **Structure**: Monorepo with npm workspaces (`client/` and `server/`)

## Running the project
```bash
docker compose up -d          # Start PostgreSQL
npm install                   # Install all dependencies
npm run db:migrate             # Run Prisma migrations (from root)
npm run db:seed                # Seed exercises (from root)
npm run dev:server             # Start Express API on :3000
npm run dev:client             # Start Vite dev server on :5173
```

## Project Structure
```
client/src/
  api/          # Axios API modules (exercises, workouts, templates, stats)
  router/       # Vue Router config
  views/        # Page components (Dashboard, Workouts, Exercises, Templates)
  App.vue       # Layout with Menubar, Toast, ConfirmDialog
  main.js       # App entry point with PrimeVue config

server/src/
  routes/       # Express routers with express-validator
  controllers/  # Thin request/response handlers
  services/     # Business logic + Prisma queries
  middleware/   # errorHandler, validateRequest
  utils/        # Prisma singleton client

server/prisma/
  schema.prisma # Database schema
  seed.js       # Seeds ~32 common exercises
  seed-fake.js  # Generates ~36 fake workouts for testing
```

## Database Schema
- **exercises**: name (unique), muscleGroup, trackingType ("weight" | "bodyweight" | "timed")
- **workouts**: name, notes, performedAt, durationMinutes, templateId?
- **workout_exercises**: workoutId, exerciseId, order
- **sets**: workoutExerciseId, setNumber, reps, weight, restSeconds?, completed
- **templates**: name, description
- **template_exercises**: templateId, exerciseId, order, defaultSets, defaultReps, defaultWeight

## Key Conventions
- Backend uses CommonJS (`require`/`module.exports`)
- Frontend uses ES modules with Vue Composition API `<script setup>`
- PrimeVue 4: use `Select` (not Dropdown), import components directly from `primevue/componentname`
- Prisma model IDs are `id` (integer auto-increment), NOT `_id`
- API response field names match Prisma model fields (camelCase): `performedAt`, `durationMinutes`, `workoutExercises`, `templateExercises`
- Nested create/update for workouts and templates use Prisma transactions
- Exercise trackingType determines chart behavior:
  - `weight`: charts show max weight, form shows reps + weight columns
  - `bodyweight`: charts show max reps, weight column hidden in form
  - `timed`: charts show max duration (seconds), reps column relabeled as "Tempo (s)"

## API Routes
- `GET/POST /api/exercises`, `GET/PUT/DELETE /api/exercises/:id`, `GET /api/exercises/:id/history`
- `GET/POST /api/workouts`, `GET/PUT/DELETE /api/workouts/:id`, `POST /api/workouts/from-template/:templateId`
- `GET/POST /api/templates`, `GET/PUT/DELETE /api/templates/:id`, `POST /api/templates/from-workout/:workoutId`
- `GET /api/stats/overview|volume-over-time|frequency|muscle-group-distribution`
- `GET /api/stats/exercise/:id/progression`
