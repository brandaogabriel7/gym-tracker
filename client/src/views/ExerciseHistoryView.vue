<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getExercise, getExerciseHistory } from '../api/exercises';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const route = useRoute();
const toast = useToast();

const exercise = ref(null);
const history = ref([]);
const trackingType = ref('weight');
const loading = ref(false);

const metricLabel = computed(() => {
  const labels = { weight: 'Peso Máximo (kg)', bodyweight: 'Reps Máximas', timed: 'Duração Máxima (s)' };
  return labels[trackingType.value] || labels.weight;
});

const yAxisLabel = computed(() => {
  const labels = { weight: 'Peso (kg)', bodyweight: 'Reps', timed: 'Tempo (s)' };
  return labels[trackingType.value] || labels.weight;
});

const chartData = computed(() => {
  const sorted = [...history.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  return {
    labels: sorted.map((entry) => formatDate(entry.date)),
    datasets: [
      {
        label: metricLabel.value,
        data: sorted.map((entry) => trackingType.value === 'weight' ? entry.maxWeight : entry.maxReps),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        pointBackgroundColor: '#3b82f6',
        pointRadius: 5,
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: true, labels: { color: '#334155' } },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: { display: true, text: yAxisLabel.value, color: '#64748b' },
      grid: { color: '#f1f5f9' },
      ticks: { color: '#64748b' },
    },
    x: {
      title: { display: true, text: 'Data', color: '#64748b' },
      grid: { color: '#f1f5f9' },
      ticks: { color: '#64748b' },
    },
  },
}));

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
}

async function fetchData() {
  loading.value = true;
  try {
    const [exerciseRes, historyRes] = await Promise.all([
      getExercise(route.params.id),
      getExerciseHistory(route.params.id),
    ]);
    exercise.value = exerciseRes.data;
    trackingType.value = historyRes.data.trackingType || 'weight';
    history.value = historyRes.data.data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar histórico', life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">{{ exercise?.name || 'Carregando...' }}</h1>

    <div v-if="history.length" class="chart-card mb-6" style="max-height: 400px;">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <DataTable :value="history" :loading="loading" stripedRows>
      <Column header="Data">
        <template #body="{ data }">{{ formatDate(data.date) }}</template>
      </Column>
      <Column v-if="trackingType === 'weight'" header="Peso Máx">
        <template #body="{ data }">{{ data.maxWeight }} kg</template>
      </Column>
      <Column v-if="trackingType === 'bodyweight'" header="Reps Máx">
        <template #body="{ data }">{{ data.maxReps }}</template>
      </Column>
      <Column v-if="trackingType === 'timed'" header="Duração Máx">
        <template #body="{ data }">{{ data.maxReps }}s</template>
      </Column>
      <Column :header="trackingType === 'weight' ? 'Volume Total' : trackingType === 'timed' ? 'Tempo Total' : 'Total Reps'">
        <template #body="{ data }">{{ data.totalVolume }}{{ trackingType === 'weight' ? ' kg' : trackingType === 'timed' ? 's' : '' }}</template>
      </Column>
      <Column header="Sets">
        <template #body="{ data }">{{ data.sets }}</template>
      </Column>
    </DataTable>

    <p v-if="!loading && !history.length" style="color: #94a3b8; text-align: center; margin-top: 2rem;">Nenhum histórico encontrado.</p>
  </div>
</template>
