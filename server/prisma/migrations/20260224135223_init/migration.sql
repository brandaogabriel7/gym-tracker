-- CreateTable
CREATE TABLE "exercises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_minutes" INTEGER,
    "template_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" SERIAL NOT NULL,
    "workout_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" SERIAL NOT NULL,
    "workout_exercise_id" INTEGER NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "rest_seconds" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_exercises" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "default_sets" INTEGER NOT NULL DEFAULT 3,
    "default_reps" INTEGER NOT NULL DEFAULT 10,
    "default_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "template_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
