const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulates ~10 weeks of training, 3-4x per week
// Progressive overload: weights increase slightly over time

async function main() {
  const exercises = await prisma.exercise.findMany();
  const byGroup = {};
  for (const ex of exercises) {
    if (!byGroup[ex.muscleGroup]) byGroup[ex.muscleGroup] = [];
    byGroup[ex.muscleGroup].push(ex);
  }

  // Workout templates (which muscle groups per day)
  const splits = [
    { name: 'Peito e Tríceps', groups: ['Peito', 'Tríceps'], duration: 65 },
    { name: 'Costas e Bíceps', groups: ['Costas', 'Bíceps'], duration: 70 },
    { name: 'Pernas', groups: ['Pernas', 'Core'], duration: 75 },
    { name: 'Ombros e Braços', groups: ['Ombros', 'Bíceps', 'Tríceps'], duration: 60 },
  ];

  // Base weights per muscle group (starting point)
  const baseWeights = {
    'Peito': 40, 'Costas': 35, 'Pernas': 60, 'Ombros': 15,
    'Bíceps': 12, 'Tríceps': 18, 'Core': 20,
  };

  const now = new Date();
  const workouts = [];

  // Generate 10 weeks of workouts, 3-4 per week
  for (let week = 9; week >= 0; week--) {
    const daysThisWeek = week % 3 === 0 ? 3 : 4; // vary frequency
    const dayOffsets = [1, 3, 5, 6].slice(0, daysThisWeek);

    for (let d = 0; d < daysThisWeek; d++) {
      const split = splits[(week * 4 + d) % splits.length];
      const date = new Date(now);
      date.setDate(date.getDate() - (week * 7) + dayOffsets[d] - 7);
      date.setHours(7 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      // Pick 3-4 exercises from the split's muscle groups
      const selectedExercises = [];
      for (const group of split.groups) {
        const available = byGroup[group] || [];
        const count = Math.min(2, available.length);
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        selectedExercises.push(...shuffled.slice(0, count));
      }

      // Progressive overload factor (increases with weeks)
      const progression = 1 + (10 - week) * 0.03; // ~3% per week

      const exerciseData = selectedExercises.map((ex, idx) => {
        const base = baseWeights[ex.muscleGroup] || 20;
        const weight = Math.round(base * progression * (0.9 + Math.random() * 0.2));
        const numSets = 3 + (Math.random() > 0.6 ? 1 : 0);

        const sets = [];
        for (let s = 0; s < numSets; s++) {
          // Reps decrease slightly per set (fatigue), weight may drop on last set
          const setWeight = s === numSets - 1 && Math.random() > 0.5
            ? Math.round(weight * 0.9)
            : weight;
          const reps = Math.max(6, 12 - s - Math.floor(Math.random() * 2));

          sets.push({
            setNumber: s + 1,
            reps,
            weight: setWeight,
            restSeconds: 60 + Math.floor(Math.random() * 60),
            completed: true,
          });
        }

        return {
          exerciseId: ex.id,
          order: idx + 1,
          sets: { create: sets },
        };
      });

      workouts.push({
        name: split.name,
        notes: week === 0 && d === daysThisWeek - 1 ? 'Treino forte hoje!' : null,
        performedAt: date,
        durationMinutes: split.duration + Math.floor(Math.random() * 20) - 10,
        workoutExercises: { create: exerciseData },
      });
    }
  }

  console.log(`Creating ${workouts.length} fake workouts...`);

  for (const workout of workouts) {
    await prisma.workout.create({ data: workout });
  }

  console.log('Done! Fake data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
