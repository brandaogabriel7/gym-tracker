<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

import { getExercises, createExercise, updateExercise, deleteExercise } from '../api/exercises';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const exercises = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editingExercise = ref(null);

const muscleGroupOptions = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Core',
];

const trackingTypeOptions = [
  { label: 'Peso (carga externa)', value: 'weight' },
  { label: 'Peso corporal (reps)', value: 'bodyweight' },
  { label: 'Tempo (segundos)', value: 'timed' },
];

const form = ref({
  name: '',
  muscleGroup: null,
  trackingType: 'weight',
});

const groupedExercises = computed(() => {
  const groups = {};
  for (const exercise of exercises.value) {
    const group = exercise.muscleGroup || 'Outros';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
  }
  return groups;
});

async function fetchExercises() {
  loading.value = true;
  try {
    const { data } = await getExercises();
    exercises.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar exercícios', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function openNewDialog() {
  editingExercise.value = null;
  form.value = { name: '', muscleGroup: null, trackingType: 'weight' };
  dialogVisible.value = true;
}

function openEditDialog(exercise) {
  editingExercise.value = exercise;
  form.value = { name: exercise.name, muscleGroup: exercise.muscleGroup, trackingType: exercise.trackingType || 'weight' };
  dialogVisible.value = true;
}

async function saveExercise() {
  try {
    if (editingExercise.value) {
      await updateExercise(editingExercise.value.id, form.value);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Exercício atualizado', life: 3000 });
    } else {
      await createExercise(form.value);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Exercício criado', life: 3000 });
    }
    dialogVisible.value = false;
    await fetchExercises();
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar exercício', life: 3000 });
  }
}

function confirmDelete(exercise) {
  confirm.require({
    message: `Deseja excluir o exercício "${exercise.name}"?`,
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteExercise(exercise.id);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Exercício excluído', life: 3000 });
        await fetchExercises();
      } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir exercício', life: 3000 });
      }
    },
  });
}

function goToHistory(exercise) {
  router.push(`/exercises/${exercise.id}/history`);
}

onMounted(fetchExercises);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Exercícios</h1>
      <Button label="Novo Exercício" icon="pi pi-plus" @click="openNewDialog" />
    </div>

    <Accordion v-if="Object.keys(groupedExercises).length" multiple>
      <AccordionPanel v-for="(items, group) in groupedExercises" :key="group" :value="group">
        <AccordionHeader>{{ group }} ({{ items.length }})</AccordionHeader>
        <AccordionContent>
          <div v-for="exercise in items" :key="exercise.id" class="flex justify-between items-center py-2 border-b">
            <span class="font-medium">{{ exercise.name }} <span v-if="exercise.trackingType !== 'weight'" style="color: #64748b; font-size: 0.8rem; font-weight: 400;">{{ exercise.trackingType === 'bodyweight' ? '(peso corporal)' : '(tempo)' }}</span></span>
            <div class="flex gap-2">
              <Button label="Histórico" icon="pi pi-chart-line" severity="info" size="small" outlined @click="goToHistory(exercise)" />
              <Button label="Editar" icon="pi pi-pencil" severity="secondary" size="small" outlined @click="openEditDialog(exercise)" />
              <Button label="Excluir" icon="pi pi-trash" severity="danger" size="small" outlined @click="confirmDelete(exercise)" />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <p v-else-if="!loading" class="text-center text-gray-500 mt-8">Nenhum exercício cadastrado.</p>

    <Dialog v-model:visible="dialogVisible" :header="editingExercise ? 'Editar Exercício' : 'Novo Exercício'" modal :style="{ width: '450px' }">
      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <label for="name" class="font-medium">Nome</label>
          <InputText id="name" v-model="form.name" placeholder="Nome do exercício" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <label for="muscleGroup" class="font-medium">Grupo Muscular</label>
          <Select id="muscleGroup" v-model="form.muscleGroup" :options="muscleGroupOptions" placeholder="Selecione" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <label for="trackingType" class="font-medium">Tipo de Medição</label>
          <Select id="trackingType" v-model="form.trackingType" :options="trackingTypeOptions" optionLabel="label" optionValue="value" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button label="Salvar" icon="pi pi-check" @click="saveExercise" :disabled="!form.name || !form.muscleGroup" />
      </template>
    </Dialog>
  </div>
</template>
