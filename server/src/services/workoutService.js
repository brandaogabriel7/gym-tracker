const prisma = require('../utils/prisma');

const workoutService = {
  async getAll() {
    const workouts = await prisma.workout.findMany({
      orderBy: { performedAt: 'desc' },
      include: {
        _count: {
          select: { workoutExercises: true },
        },
      },
    });

    return workouts.map((w) => ({
      ...w,
      exerciseCount: w._count.workoutExercises,
      _count: undefined,
    }));
  },

  async getById(id) {
    return prisma.workout.findUniqueOrThrow({
      where: { id },
      include: {
        workoutExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  },

  async create(data) {
    const { name, notes, performedAt, durationMinutes, templateId, exercises } = data;

    return prisma.workout.create({
      data: {
        name,
        notes,
        performedAt: performedAt ? new Date(performedAt) : undefined,
        durationMinutes,
        templateId,
        workoutExercises: {
          create: (exercises || []).map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: {
              create: (ex.sets || []).map((s) => ({
                setNumber: s.setNumber,
                reps: s.reps,
                weight: s.weight,
                restSeconds: s.restSeconds,
                completed: s.completed !== undefined ? s.completed : true,
              })),
            },
          })),
        },
      },
      include: {
        workoutExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  },

  async update(id, data) {
    const { name, notes, performedAt, durationMinutes, templateId, exercises } = data;

    return prisma.$transaction(async (tx) => {
      await tx.workoutExercise.deleteMany({
        where: { workoutId: id },
      });

      return tx.workout.update({
        where: { id },
        data: {
          name,
          notes,
          performedAt: performedAt ? new Date(performedAt) : undefined,
          durationMinutes,
          templateId,
          workoutExercises: {
            create: (exercises || []).map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              sets: {
                create: (ex.sets || []).map((s) => ({
                  setNumber: s.setNumber,
                  reps: s.reps,
                  weight: s.weight,
                  restSeconds: s.restSeconds,
                  completed: s.completed !== undefined ? s.completed : true,
                })),
              },
            })),
          },
        },
        include: {
          workoutExercises: {
            orderBy: { order: 'asc' },
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
          },
        },
      });
    });
  },

  async remove(id) {
    return prisma.workout.delete({
      where: { id },
    });
  },

  async createFromTemplate(templateId) {
    const template = await prisma.template.findUniqueOrThrow({
      where: { id: templateId },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });

    return prisma.workout.create({
      data: {
        name: template.name,
        templateId: template.id,
        workoutExercises: {
          create: template.templateExercises.map((te) => ({
            exerciseId: te.exerciseId,
            order: te.order,
            sets: {
              create: Array.from({ length: te.defaultSets }, (_, i) => ({
                setNumber: i + 1,
                reps: te.defaultReps,
                weight: te.defaultWeight,
                completed: false,
              })),
            },
          })),
        },
      },
      include: {
        workoutExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  },
};

module.exports = workoutService;
