<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getWorkout, deleteWorkout } from '../api/workouts';
import { createTemplateFromWorkout } from '../api/templates';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const workout = ref(null);
const loading = ref(false);

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function formatDuration(minutes) {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

async function fetchWorkout() {
  loading.value = true;
  try {
    const { data } = await getWorkout(route.params.id);
    workout.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar treino', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function confirmDeleteWorkout() {
  confirm.require({
    message: `Deseja excluir o treino "${workout.value?.name}"?`,
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteWorkout(route.params.id);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Treino excluído', life: 3000 });
        router.push('/workouts');
      } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir treino', life: 3000 });
      }
    },
  });
}

async function saveAsTemplate() {
  try {
    await createTemplateFromWorkout(route.params.id);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Template criado a partir do treino', life: 3000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar template', life: 3000 });
  }
}

onMounted(fetchWorkout);
</script>

<template>
  <div v-if="workout">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ workout.name }}</h1>
      <div class="flex gap-2">
        <Button label="Editar" icon="pi pi-pencil" severity="secondary" @click="router.push(`/workouts/${route.params.id}/edit`)" />
        <Button label="Salvar como Template" icon="pi pi-copy" severity="info" outlined @click="saveAsTemplate" />
        <Button label="Excluir" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteWorkout" />
      </div>
    </div>

    <div class="flex gap-4 mb-6 text-sm text-gray-600">
      <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(workout.date) }}</span>
      <span><i class="pi pi-clock mr-1"></i>{{ formatDuration(workout.duration) }}</span>
    </div>

    <p v-if="workout.notes" class="mb-6 p-3 bg-gray-50 rounded border">
      <strong>Notas:</strong> {{ workout.notes }}
    </p>

    <div class="flex flex-col gap-4">
      <Card v-for="(we, index) in workout.exercises" :key="index">
        <template #title>
          {{ we.exercise?.name || we.exerciseName || `Exercício ${index + 1}` }}
        </template>
        <template #content>
          <DataTable :value="we.sets" size="small" stripedRows>
            <Column header="Set" field="setNumber">
              <template #body="{ data }">{{ data.setNumber }}</template>
            </Column>
            <Column header="Reps" field="reps">
              <template #body="{ data }">{{ data.reps }}</template>
            </Column>
            <Column header="Peso" field="weight">
              <template #body="{ data }">{{ data.weight }} kg</template>
            </Column>
            <Column header="Status">
              <template #body="{ data }">
                <Tag :value="data.completed ? 'Completo' : 'Pendente'" :severity="data.completed ? 'success' : 'warn'" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <p v-if="!workout.exercises?.length" class="text-center text-gray-500 mt-8">Nenhum exercício neste treino.</p>
  </div>

  <div v-else-if="loading" class="text-center mt-8">
    <i class="pi pi-spin pi-spinner text-4xl"></i>
  </div>
</template>
