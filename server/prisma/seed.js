const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exercises = [
  // Peito
  { name: 'Supino Reto', muscleGroup: 'Peito' },
  { name: 'Supino Inclinado', muscleGroup: 'Peito' },
  { name: 'Supino Declinado', muscleGroup: 'Peito' },
  { name: 'Crucifixo', muscleGroup: 'Peito' },
  { name: 'Crossover', muscleGroup: 'Peito' },
  // Costas
  { name: 'Puxada Frontal', muscleGroup: 'Costas' },
  { name: 'Remada Curvada', muscleGroup: 'Costas' },
  { name: 'Remada Baixa', muscleGroup: 'Costas' },
  { name: 'Pulldown', muscleGroup: 'Costas' },
  { name: 'Barra Fixa', muscleGroup: 'Costas' },
  // Pernas
  { name: 'Agachamento Livre', muscleGroup: 'Pernas' },
  { name: 'Leg Press', muscleGroup: 'Pernas' },
  { name: 'Cadeira Extensora', muscleGroup: 'Pernas' },
  { name: 'Mesa Flexora', muscleGroup: 'Pernas' },
  { name: 'Stiff', muscleGroup: 'Pernas' },
  { name: 'Panturrilha em Pé', muscleGroup: 'Pernas' },
  { name: 'Hack Squat', muscleGroup: 'Pernas' },
  // Ombros
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros' },
  { name: 'Elevação Lateral', muscleGroup: 'Ombros' },
  { name: 'Elevação Frontal', muscleGroup: 'Ombros' },
  { name: 'Encolhimento', muscleGroup: 'Ombros' },
  // Bíceps
  { name: 'Rosca Direta', muscleGroup: 'Bíceps' },
  { name: 'Rosca Alternada', muscleGroup: 'Bíceps' },
  { name: 'Rosca Martelo', muscleGroup: 'Bíceps' },
  { name: 'Rosca Scott', muscleGroup: 'Bíceps' },
  // Tríceps
  { name: 'Tríceps Pulley', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Testa', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Francês', muscleGroup: 'Tríceps' },
  { name: 'Mergulho', muscleGroup: 'Tríceps' },
  // Core
  { name: 'Abdominal Crunch', muscleGroup: 'Core' },
  { name: 'Prancha', muscleGroup: 'Core' },
  { name: 'Levantamento Terra', muscleGroup: 'Core' },
];

async function main() {
  console.log('Seeding exercises...');
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }
  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
