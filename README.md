# Gym Tracker

Personal gym workout tracker to log exercises, weights, reps, and visualize progression over time. Installable as a PWA on mobile and desktop.

## Tech Stack

- **Frontend**: Vue.js 3 + Vite + PrimeVue 4 (Aura theme)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 16 (Docker) + Prisma ORM
- **Charts**: Chart.js + vue-chartjs
- **PWA**: vite-plugin-pwa (offline support, installable)

## Features

- Log workouts with exercises, sets, reps, and weights
- Track three exercise types: weighted, bodyweight, and timed
- Dashboard with volume, frequency, muscle group distribution, and progression charts
- Workout templates — create from scratch or from a previous workout
- Start a workout from a template with pre-filled exercises and defaults
- Exercise progression history with charts and data tables
- Installable PWA with offline caching

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Setup

```bash
docker compose up -d          # Start PostgreSQL
npm install                   # Install all dependencies
npm run db:migrate            # Run Prisma migrations
npm run db:seed               # Seed ~32 common exercises
```

### Run

```bash
npm run dev:server            # Express API on http://localhost:3000
npm run dev:client            # Vite dev server on http://localhost:5173
```

### Seed fake data (optional)

```bash
npm run db:seed-fake          # Generate ~36 fake workouts for testing
```

## Project Structure

```
client/src/
  api/          # Axios API modules
  router/       # Vue Router config
  views/        # Page components (Dashboard, Workouts, Exercises, Templates)
  App.vue       # Layout with Menubar
  main.js       # Entry point with PrimeVue config

server/src/
  routes/       # Express routers with validation
  controllers/  # Request/response handlers
  services/     # Business logic + Prisma queries
  middleware/   # Error handler, request validation

server/prisma/
  schema.prisma # Database schema
  seed.js       # Exercise seed data
  seed-fake.js  # Fake workout generator
```

## API

| Resource | Endpoints |
|----------|-----------|
| Exercises | `GET/POST /api/exercises`, `GET/PUT/DELETE /api/exercises/:id`, `GET /api/exercises/:id/history` |
| Workouts | `GET/POST /api/workouts`, `GET/PUT/DELETE /api/workouts/:id`, `POST /api/workouts/from-template/:templateId` |
| Templates | `GET/POST /api/templates`, `GET/PUT/DELETE /api/templates/:id`, `POST /api/templates/from-workout/:workoutId` |
| Stats | `GET /api/stats/overview\|volume-over-time\|frequency\|muscle-group-distribution`, `GET /api/stats/exercise/:id/progression` |
