const prisma = require('../utils/prisma');

const templateService = {
  async getAll() {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { templateExercises: true },
        },
      },
    });

    return templates.map((t) => ({
      ...t,
      exerciseCount: t._count.templateExercises,
      _count: undefined,
    }));
  },

  async getById(id) {
    return prisma.template.findUniqueOrThrow({
      where: { id },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  },

  async create(data) {
    const { name, description, exercises } = data;

    return prisma.template.create({
      data: {
        name,
        description,
        templateExercises: {
          create: (exercises || []).map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            defaultSets: ex.defaultSets || 3,
            defaultReps: ex.defaultReps || 10,
            defaultWeight: ex.defaultWeight || 0,
          })),
        },
      },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  },

  async update(id, data) {
    const { name, description, exercises } = data;

    return prisma.$transaction(async (tx) => {
      await tx.templateExercise.deleteMany({
        where: { templateId: id },
      });

      return tx.template.update({
        where: { id },
        data: {
          name,
          description,
          templateExercises: {
            create: (exercises || []).map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              defaultSets: ex.defaultSets || 3,
              defaultReps: ex.defaultReps || 10,
              defaultWeight: ex.defaultWeight || 0,
            })),
          },
        },
        include: {
          templateExercises: {
            orderBy: { order: 'asc' },
            include: { exercise: true },
          },
        },
      });
    });
  },

  async remove(id) {
    return prisma.template.delete({
      where: { id },
    });
  },

  async createFromWorkout(workoutId) {
    const workout = await prisma.workout.findUniqueOrThrow({
      where: { id: workoutId },
      include: {
        workoutExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return prisma.template.create({
      data: {
        name: `${workout.name} Template`,
        description: `Created from workout on ${workout.performedAt.toISOString().split('T')[0]}`,
        templateExercises: {
          create: workout.workoutExercises.map((we) => {
            const sets = we.sets;
            const defaultReps = sets.length > 0
              ? sets[0].reps || 10
              : 10;
            const maxWeight = sets.length > 0
              ? Math.max(...sets.map((s) => s.weight))
              : 0;

            return {
              exerciseId: we.exerciseId,
              order: we.order,
              defaultSets: sets.length || 3,
              defaultReps,
              defaultWeight: maxWeight,
            };
          }),
        },
      },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  },
};

module.exports = templateService;
