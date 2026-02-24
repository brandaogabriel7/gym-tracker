<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getWorkouts, deleteWorkout } from '../api/workouts';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const workouts = ref([]);
const loading = ref(false);

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
}

function formatDuration(minutes) {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

async function fetchWorkouts() {
  loading.value = true;
  try {
    const { data } = await getWorkouts();
    workouts.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar treinos', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function onRowClick(event) {
  router.push(`/workouts/${event.data.id}`);
}

function confirmDelete(workout) {
  confirm.require({
    message: `Deseja excluir o treino "${workout.name}"?`,
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteWorkout(workout.id);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Treino excluído', life: 3000 });
        await fetchWorkouts();
      } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir treino', life: 3000 });
      }
    },
  });
}

onMounted(fetchWorkouts);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Treinos</h1>
      <Button label="Novo Treino" icon="pi pi-plus" @click="router.push('/workouts/new')" />
    </div>

    <DataTable
      :value="workouts"
      :loading="loading"
      stripedRows
      selectionMode="single"
      @row-click="onRowClick"
      class="cursor-pointer"
    >
      <Column header="Nome" field="name" />
      <Column header="Data">
        <template #body="{ data }">{{ formatDate(data.performedAt) }}</template>
      </Column>
      <Column header="Duração">
        <template #body="{ data }">{{ formatDuration(data.durationMinutes) }}</template>
      </Column>
      <Column header="Exercícios">
        <template #body="{ data }">{{ data._count?.workoutExercises ?? data.workoutExercises?.length ?? 0 }}</template>
      </Column>
      <Column header="Ações" style="width: 100px">
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            outlined
            @click.stop="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <p v-if="!loading && !workouts.length" class="text-center text-gray-500 mt-8">Nenhum treino registrado.</p>
  </div>
</template>
