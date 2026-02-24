<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';

import { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } from '../api/templates';
import { createWorkoutFromTemplate } from '../api/workouts';
import { getExercises } from '../api/exercises';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const templates = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const saving = ref(false);
const editingTemplate = ref(null);
const exerciseOptions = ref([]);
const selectedExercise = ref(null);

const form = ref({
  name: '',
  description: '',
  exercises: [],
});

async function fetchTemplates() {
  loading.value = true;
  try {
    const { data } = await getTemplates();
    templates.value = data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar templates', life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function fetchExercises() {
  try {
    const { data } = await getExercises();
    exerciseOptions.value = data.map((e) => ({ label: e.name, value: e.id }));
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar exercicios', life: 3000 });
  }
}

function openNewDialog() {
  editingTemplate.value = null;
  form.value = { name: '', description: '', exercises: [] };
  selectedExercise.value = null;
  dialogVisible.value = true;
}

async function openEditDialog(template) {
  try {
    const { data } = await getTemplate(template.id);
    editingTemplate.value = data;
    form.value = {
      name: data.name || '',
      description: data.description || '',
      exercises: (data.templateExercises || []).map((ex, idx) => ({
        exerciseId: ex.exercise?.id || ex.exerciseId,
        exerciseName: ex.exercise?.name || exerciseOptions.value.find((o) => o.value === ex.exerciseId)?.label || 'Exercicio',
        order: ex.order ?? idx + 1,
        defaultSets: ex.defaultSets ?? null,
        defaultReps: ex.defaultReps ?? null,
        defaultWeight: ex.defaultWeight ?? null,
      })),
    };
    selectedExercise.value = null;
    dialogVisible.value = true;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar template', life: 3000 });
  }
}

function addExercise() {
  if (!selectedExercise.value) return;
  const option = exerciseOptions.value.find((o) => o.value === selectedExercise.value);
  if (!option) return;
  form.value.exercises.push({
    exerciseId: option.value,
    exerciseName: option.label,
    order: form.value.exercises.length + 1,
    defaultSets: null,
    defaultReps: null,
    defaultWeight: null,
  });
  selectedExercise.value = null;
}

function removeExercise(index) {
  form.value.exercises.splice(index, 1);
  form.value.exercises.forEach((ex, i) => {
    ex.order = i + 1;
  });
}

async function saveTemplate() {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      exercises: form.value.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        order: ex.order,
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        defaultWeight: ex.defaultWeight,
      })),
    };

    if (editingTemplate.value) {
      await updateTemplate(editingTemplate.value.id, payload);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Template atualizado', life: 3000 });
    } else {
      await createTemplate(payload);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Template criado', life: 3000 });
    }
    dialogVisible.value = false;
    await fetchTemplates();
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar template', life: 3000 });
  } finally {
    saving.value = false;
  }
}

async function startWorkout(template) {
  try {
    const { data } = await createWorkoutFromTemplate(template.id);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Treino criado a partir do template', life: 3000 });
    router.push(`/workouts/${data.id}/edit`);
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao iniciar treino', life: 3000 });
  }
}

function confirmDelete(template) {
  confirm.require({
    message: `Deseja excluir o template "${template.name}"?`,
    header: 'Confirmar Exclusao',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteTemplate(template.id);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Template excluido', life: 3000 });
        await fetchTemplates();
      } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir template', life: 3000 });
      }
    },
  });
}

onMounted(async () => {
  await fetchExercises();
  await fetchTemplates();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Templates</h1>
      <Button label="Novo Template" icon="pi pi-plus" @click="openNewDialog" />
    </div>

    <DataTable :value="templates" :loading="loading" stripedRows>
      <Column header="Nome" field="name" />
      <Column header="Descricao" field="description" />
      <Column header="Exercicios">
        <template #body="{ data }">{{ data._count?.templateExercises ?? data.templateExercises?.length ?? 0 }}</template>
      </Column>
      <Column header="Acoes" style="width: 250px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              label="Iniciar Treino"
              icon="pi pi-play"
              severity="success"
              size="small"
              @click="startWorkout(data)"
            />
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              size="small"
              outlined
              @click="openEditDialog(data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <p v-if="!loading && !templates.length" class="text-center text-gray-500 mt-8">Nenhum template cadastrado.</p>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingTemplate ? 'Editar Template' : 'Novo Template'"
      modal
      :style="{ width: '650px' }"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="tpl-name">Nome</label>
          <InputText id="tpl-name" v-model="form.name" placeholder="Nome do template" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="tpl-desc">Descricao</label>
          <Textarea id="tpl-desc" v-model="form.description" rows="3" placeholder="Descricao do template" />
        </div>

        <div class="border-t pt-4">
          <h3 class="text-lg font-semibold mb-3">Exercicios</h3>

          <div class="flex gap-2 mb-4">
            <Select
              v-model="selectedExercise"
              :options="exerciseOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um exercicio"
              class="flex-1"
            />
            <Button label="Adicionar" icon="pi pi-plus" size="small" @click="addExercise" :disabled="!selectedExercise" />
          </div>

          <div v-if="!form.exercises.length" class="text-gray-500 text-center py-2">
            Nenhum exercicio adicionado.
          </div>

          <div v-for="(exercise, idx) in form.exercises" :key="idx" class="border rounded p-3 mb-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">{{ exercise.order }}. {{ exercise.exerciseName }}</span>
              <Button icon="pi pi-trash" severity="danger" size="small" text @click="removeExercise(idx)" />
            </div>
            <div class="flex gap-3 flex-wrap">
              <div class="flex flex-col gap-1">
                <label class="text-sm">Series</label>
                <InputNumber v-model="exercise.defaultSets" :min="0" placeholder="0" class="w-24" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm">Reps</label>
                <InputNumber v-model="exercise.defaultReps" :min="0" placeholder="0" class="w-24" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm">Peso (kg)</label>
                <InputNumber v-model="exercise.defaultWeight" :min="0" :minFractionDigits="0" :maxFractionDigits="2" placeholder="0" class="w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button
          label="Salvar"
          icon="pi pi-check"
          @click="saveTemplate"
          :loading="saving"
          :disabled="!form.name"
        />
      </template>
    </Dialog>
  </div>
</template>
