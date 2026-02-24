const prisma = require('../utils/prisma');

const statsService = {
  async getOverview() {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalWorkouts, workoutsThisWeek, workoutsThisMonth, allWorkoutDates] =
      await Promise.all([
        prisma.workout.count(),
        prisma.workout.count({
          where: { performedAt: { gte: startOfWeek } },
        }),
        prisma.workout.count({
          where: { performedAt: { gte: startOfMonth } },
        }),
        prisma.workout.findMany({
          select: { performedAt: true },
          orderBy: { performedAt: 'desc' },
        }),
      ]);

    const streak = calculateStreak(allWorkoutDates.map((w) => w.performedAt));

    return {
      totalWorkouts,
      workoutsThisWeek,
      workoutsThisMonth,
      currentStreak: streak,
    };
  },

  async getExerciseProgression(exerciseId) {
    const exercise = await prisma.exercise.findUniqueOrThrow({
      where: { id: exerciseId },
      select: { trackingType: true },
    });

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { exerciseId },
      include: {
        sets: true,
        workout: {
          select: { performedAt: true },
        },
      },
      orderBy: {
        workout: { performedAt: 'asc' },
      },
    });

    const tt = exercise.trackingType;

    return {
      trackingType: tt,
      data: workoutExercises.map((we) => {
        const sets = we.sets;
        const maxWeight = sets.length > 0 ? Math.max(...sets.map((s) => s.weight)) : 0;
        const maxReps = sets.length > 0 ? Math.max(...sets.map((s) => s.reps)) : 0;
        const totalVolume = tt === 'weight'
          ? sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
          : sets.reduce((sum, s) => sum + s.reps, 0);

        return {
          date: we.workout.performedAt,
          maxWeight,
          maxReps,
          totalVolume,
        };
      }),
    };
  },

  async getVolumeOverTime() {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const sets = await prisma.set.findMany({
      where: {
        workoutExercise: {
          workout: {
            performedAt: { gte: twelveWeeksAgo },
          },
        },
      },
      include: {
        workoutExercise: {
          include: {
            workout: {
              select: { performedAt: true },
            },
          },
        },
      },
    });

    const weeklyVolume = {};
    for (const set of sets) {
      const date = set.workoutExercise.workout.performedAt;
      const weekStart = getWeekStart(date);
      const key = weekStart.toISOString().split('T')[0];
      weeklyVolume[key] = (weeklyVolume[key] || 0) + set.reps * set.weight;
    }

    return Object.entries(weeklyVolume)
      .map(([week, volume]) => ({ week, volume }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },

  async getFrequency() {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const workouts = await prisma.workout.findMany({
      where: { performedAt: { gte: twelveWeeksAgo } },
      select: { performedAt: true },
      orderBy: { performedAt: 'asc' },
    });

    const weeklyCount = {};
    for (const w of workouts) {
      const weekStart = getWeekStart(w.performedAt);
      const key = weekStart.toISOString().split('T')[0];
      weeklyCount[key] = (weeklyCount[key] || 0) + 1;
    }

    return Object.entries(weeklyCount)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },

  async getMuscleGroupDistribution() {
    const workoutExercises = await prisma.workoutExercise.findMany({
      include: {
        exercise: {
          select: { muscleGroup: true },
        },
        _count: {
          select: { sets: true },
        },
      },
    });

    const distribution = {};
    for (const we of workoutExercises) {
      const group = we.exercise.muscleGroup;
      distribution[group] = (distribution[group] || 0) + we._count.sets;
    }

    return Object.entries(distribution)
      .map(([muscleGroup, totalSets]) => ({ muscleGroup, totalSets }))
      .sort((a, b) => b.totalSets - a.totalSets);
  },
};

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(dates) {
  if (dates.length === 0) return 0;

  const uniqueDays = new Set(
    dates.map((d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    })
  );

  const sortedDays = [...uniqueDays]
    .map((key) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = (sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  // Check if streak includes today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = sortedDays[0];
  const daysSinceLast = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

  if (daysSinceLast > 1) return 0;

  return streak;
}

module.exports = statsService;
