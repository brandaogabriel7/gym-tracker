<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Select from 'primevue/select';
import { Line, Bar, Doughnut } from 'vue-chartjs';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

import { getOverview, getVolumeOverTime, getFrequency, getMuscleGroupDistribution, getExerciseProgression } from '../api/stats';
import { getExercises } from '../api/exercises';

const toast = useToast();

const loading = ref(false);
const overview = ref({ totalWorkouts: 0, workoutsThisWeek: 0, workoutsThisMonth: 0, streak: 0 });
const exerciseOptions = ref([]);
const selectedExercise = ref(null);

const volumeChartData = ref({ labels: [], datasets: [] });
const frequencyChartData = ref({ labels: [], datasets: [] });
const muscleGroupChartData = ref({ labels: [], datasets: [] });
const progressionChartData = ref({ labels: [], datasets: [] });

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
  },
};

const barOptions = {
  ...chartDefaults,
  plugins: { legend: { display: false } },
  scales: {
    ...chartDefaults.scales,
    y: { ...chartDefaults.scales.y, beginAtZero: true },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#334155', padding: 16, usePointStyle: true } } },
};

const progressionLabel = ref('Peso (kg)');

const lineOptions = computed(() => ({
  ...chartDefaults,
  plugins: { legend: { display: false } },
  scales: {
    ...chartDefaults.scales,
    y: { ...chartDefaults.scales.y, title: { display: true, text: progressionLabel.value, color: '#64748b' } },
  },
}));

async function fetchDashboard() {
  loading.value = true;
  try {
    const [overviewRes, volumeRes, frequencyRes, muscleRes, exercisesRes] = await Promise.all([
      getOverview(),
      getVolumeOverTime(),
      getFrequency(),
      getMuscleGroupDistribution(),
      getExercises(),
    ]);

    overview.value = overviewRes.data;

    const volumeData = volumeRes.data;
    volumeChartData.value = {
      labels: volumeData.map((d) => d.week || d.label),
      datasets: [
        {
          label: 'Volume',
          data: volumeData.map((d) => d.totalVolume || d.volume || d.value),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
      ],
    };

    const freqData = frequencyRes.data;
    frequencyChartData.value = {
      labels: freqData.map((d) => d.week || d.label),
      datasets: [
        {
          label: 'Treinos',
          data: freqData.map((d) => d.count || d.workouts || d.value),
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
      ],
    };

    const muscleData = muscleRes.data;
    const colors = [
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316',
    ];
    muscleGroupChartData.value = {
      labels: muscleData.map((d) => d.muscleGroup || d.name || d.label),
      datasets: [
        {
          data: muscleData.map((d) => d.totalSets || d.sets || d.count || d.value),
          backgroundColor: colors.slice(0, muscleData.length),
        },
      ],
    };

    exerciseOptions.value = exercisesRes.data.map((e) => ({ label: e.name, value: e.id }));
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dashboard', life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function fetchProgression() {
  if (!selectedExercise.value) {
    progressionChartData.value = { labels: [], datasets: [] };
    return;
  }
  try {
    const res = await getExerciseProgression(selectedExercise.value);
    const tt = res.data.trackingType;
    const points = res.data.data;

    const labels = { weight: 'Peso (kg)', bodyweight: 'Reps', timed: 'Tempo (s)' };
    const datasetLabels = { weight: 'Peso Maximo', bodyweight: 'Reps Maximas', timed: 'Duracao Maxima' };
    progressionLabel.value = labels[tt] || 'Peso (kg)';

    progressionChartData.value = {
      labels: points.map((d) => d.date ? format(new Date(d.date), 'dd/MM/yyyy') : d.label),
      datasets: [
        {
          label: datasetLabels[tt] || 'Peso Maximo',
          data: points.map((d) => tt === 'weight' ? d.maxWeight : d.maxReps),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          pointBackgroundColor: '#7c3aed',
          pointRadius: 5,
          borderWidth: 2.5,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar progressao', life: 3000 });
  }
}

onMounted(fetchDashboard);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

    <div v-if="loading" class="text-center py-8">Carregando...</div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card class="stat-card">
          <template #title>Total Treinos</template>
          <template #content>
            <p class="stat-value">{{ overview.totalWorkouts }}</p>
          </template>
        </Card>
        <Card class="stat-card">
          <template #title>Treinos esta Semana</template>
          <template #content>
            <p class="stat-value">{{ overview.workoutsThisWeek }}</p>
          </template>
        </Card>
        <Card class="stat-card">
          <template #title>Treinos este Mes</template>
          <template #content>
            <p class="stat-value">{{ overview.workoutsThisMonth }}</p>
          </template>
        </Card>
        <Card class="stat-card">
          <template #title>Streak</template>
          <template #content>
            <p class="stat-value">{{ overview.currentStreak }} <span>dias</span></p>
          </template>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="chart-card">
          <h2>Volume Semanal</h2>
          <div style="height: 300px">
            <Bar :data="volumeChartData" :options="barOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h2>Frequencia Semanal</h2>
          <div style="height: 300px">
            <Bar :data="frequencyChartData" :options="barOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h2>Distribuicao Muscular</h2>
          <div style="height: 300px">
            <Doughnut :data="muscleGroupChartData" :options="doughnutOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h2>Progressao de Exercicio</h2>
          <div class="mb-3">
            <Select
              v-model="selectedExercise"
              :options="exerciseOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um exercicio"
              class="w-full"
              @change="fetchProgression"
            />
          </div>
          <div style="height: 250px">
            <Line v-if="progressionChartData.labels.length" :data="progressionChartData" :options="lineOptions" />
            <p v-else style="color: #94a3b8; text-align: center; padding: 2rem 0;">Selecione um exercicio para ver a progressao.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
