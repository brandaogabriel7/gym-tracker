const prisma = require('../utils/prisma');

const exerciseService = {
  async getAll() {
    return prisma.exercise.findMany({
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });
  },

  async getById(id) {
    return prisma.exercise.findUniqueOrThrow({
      where: { id },
    });
  },

  async create({ name, muscleGroup }) {
    return prisma.exercise.create({
      data: { name, muscleGroup },
    });
  },

  async update(id, data) {
    return prisma.exercise.update({
      where: { id },
      data,
    });
  },

  async remove(id) {
    return prisma.exercise.delete({
      where: { id },
    });
  },

  async getHistory(id) {
    const exercise = await prisma.exercise.findUniqueOrThrow({
      where: { id },
      select: { trackingType: true },
    });

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { exerciseId: id },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
        workout: {
          select: {
            id: true,
            name: true,
            performedAt: true,
          },
        },
      },
      orderBy: {
        workout: { performedAt: 'desc' },
      },
    });

    const tt = exercise.trackingType;

    const data = workoutExercises.map((we) => {
      const sets = we.sets;
      return {
        workoutId: we.workout.id,
        workoutName: we.workout.name,
        date: we.workout.performedAt,
        sets: sets.length,
        maxWeight: Math.max(0, ...sets.map((s) => s.weight)),
        maxReps: Math.max(0, ...sets.map((s) => s.reps)),
        totalVolume: tt === 'weight'
          ? sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
          : sets.reduce((sum, s) => sum + s.reps, 0),
      };
    });

    return { trackingType: tt, data };
  },
};

module.exports = exerciseService;
