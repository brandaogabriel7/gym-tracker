<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { format } from 'date-fns';

import { getWorkout, createWorkout, updateWorkout } from '../api/workouts';
import { getExercises } from '../api/exercises';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const exerciseOptions = ref([]);
const selectedExercise = ref(null);

const isEdit = computed(() => route.name === 'workout-edit' && !!route.params.id);

const form = ref({
  name: '',
  performedAt: '',
  durationMinutes: null,
  notes: '',
  exercises: [],
});

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

async function fetchExercises() {
  try {
    const { data } = await getExercises();
    exerciseOptions.value = data.map((e) => ({ label: e.name, value: e.id, trackingType: e.trackingType || 'weight' }));
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar exercicios', life: 3000 });
  }
}

async function fetchWorkout() {
  if (!isEdit.value) return;
  loading.value = true;
  try {
    const { data } = await getWorkout(route.params.id);
    form.value.name = data.name || '';
    form.value.performedAt = formatDateForInput(data.performedAt);
    form.value.durationMinutes = data.durationMinutes || null;
    form.value.notes = data.notes || '';
    form.value.exercises = (data.workoutExercises || []).map((ex, idx) => ({
      exerciseId: ex.exercise?.id || ex.exerciseId,
      exerciseName: ex.exercise?.name || exerciseOptions.value.find((o) => o.value === ex.exerciseId)?.label || 'Exercicio',
      order: ex.order ?? idx + 1,
      sets: (ex.sets || []).map((s, sIdx) => ({
        setNumber: s.setNumber ?? sIdx + 1,
        reps: s.reps ?? null,
        weight: s.weight ?? null,
        restSeconds: s.restSeconds ?? null,
        completed: s.completed ?? false,
      })),
    }));
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar treino', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function addExercise() {
  if (!selectedExercise.value) return;
  const option = exerciseOptions.value.find((o) => o.value === selectedExercise.value);
  if (!option) return;
  form.value.exercises.push({
    exerciseId: option.value,
    exerciseName: option.label,
    trackingType: option.trackingType || 'weight',
    order: form.value.exercises.length + 1,
    sets: [{ setNumber: 1, reps: null, weight: null, restSeconds: null, completed: false }],
  });
  selectedExercise.value = null;
}

function removeExercise(index) {
  form.value.exercises.splice(index, 1);
  form.value.exercises.forEach((ex, i) => {
    ex.order = i + 1;
  });
}

function addSet(exerciseIndex) {
  const sets = form.value.exercises[exerciseIndex].sets;
  sets.push({
    setNumber: sets.length + 1,
    reps: null,
    weight: null,
    restSeconds: null,
    completed: false,
  });
}

function removeSet(exerciseIndex, setIndex) {
  const sets = form.value.exercises[exerciseIndex].sets;
  sets.splice(setIndex, 1);
  sets.forEach((s, i) => {
    s.setNumber = i + 1;
  });
}

async function handleSubmit() {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      notes: form.value.notes,
      performedAt: form.value.performedAt || undefined,
      durationMinutes: form.value.durationMinutes,
      exercises: form.value.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        order: ex.order,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          restSeconds: s.restSeconds,
          completed: s.completed,
        })),
      })),
    };

    let savedId;
    if (isEdit.value) {
      await updateWorkout(route.params.id, payload);
      savedId = route.params.id;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Treino atualizado', life: 3000 });
    } else {
      const { data } = await createWorkout(payload);
      savedId = data.id;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Treino criado', life: 3000 });
    }
    router.push(`/workouts/${savedId}`);
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar treino', life: 3000 });
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await fetchExercises();
  await fetchWorkout();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ isEdit ? 'Editar Treino' : 'Novo Treino' }}</h1>
      <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="router.back()" />
    </div>

    <div v-if="loading" class="text-center py-8">Carregando...</div>

    <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="name">Nome</label>
        <InputText id="name" v-model="form.name" placeholder="Nome do treino" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="performedAt">Data/Hora</label>
        <InputText id="performedAt" v-model="form.performedAt" type="datetime-local" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="duration">Duracao (minutos)</label>
        <InputNumber id="duration" v-model="form.durationMinutes" placeholder="Ex: 60" :min="0" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="notes">Notas</label>
        <Textarea id="notes" v-model="form.notes" rows="3" placeholder="Observacoes sobre o treino" />
      </div>

      <div class="border-t pt-4 mt-2">
        <h2 class="text-xl font-semibold mb-3">Exercicios</h2>

        <div class="flex gap-2 mb-4">
          <Select
            v-model="selectedExercise"
            :options="exerciseOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione um exercicio"
            class="flex-1"
          />
          <Button label="Adicionar" icon="pi pi-plus" @click="addExercise" :disabled="!selectedExercise" />
        </div>

        <div v-if="!form.exercises.length" class="text-gray-500 text-center py-4">
          Nenhum exercicio adicionado.
        </div>

        <div v-for="(exercise, exIdx) in form.exercises" :key="exIdx" class="border rounded-lg p-4 mb-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">
              {{ exercise.order }}. {{ exercise.exerciseName }}
            </h3>
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              @click="removeExercise(exIdx)"
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left">
                  <th class="px-2 py-1">Serie</th>
                  <th class="px-2 py-1">{{ exercise.trackingType === 'timed' ? 'Tempo (s)' : 'Reps' }}</th>
                  <th v-if="exercise.trackingType === 'weight'" class="px-2 py-1">Peso (kg)</th>
                  <th class="px-2 py-1">Descanso (s)</th>
                  <th class="px-2 py-1">Feito</th>
                  <th class="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(set, setIdx) in exercise.sets" :key="setIdx">
                  <td class="px-2 py-1 font-medium">{{ set.setNumber }}</td>
                  <td class="px-2 py-1">
                    <InputNumber v-model="set.reps" :min="0" :placeholder="exercise.trackingType === 'timed' ? 'seg' : '0'" class="w-20" />
                  </td>
                  <td v-if="exercise.trackingType === 'weight'" class="px-2 py-1">
                    <InputNumber v-model="set.weight" :min="0" :minFractionDigits="0" :maxFractionDigits="2" placeholder="0" class="w-24" />
                  </td>
                  <td class="px-2 py-1">
                    <InputNumber v-model="set.restSeconds" :min="0" placeholder="0" class="w-20" />
                  </td>
                  <td class="px-2 py-1">
                    <Checkbox v-model="set.completed" :binary="true" />
                  </td>
                  <td class="px-2 py-1">
                    <Button
                      icon="pi pi-times"
                      severity="danger"
                      size="small"
                      text
                      @click="removeSet(exIdx, setIdx)"
                      :disabled="exercise.sets.length <= 1"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Button
            label="Adicionar Serie"
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            outlined
            class="mt-2"
            @click="addSet(exIdx)"
          />
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-4">
        <Button label="Cancelar" severity="secondary" @click="router.back()" />
        <Button
          :label="isEdit ? 'Salvar Alteracoes' : 'Criar Treino'"
          icon="pi pi-check"
          type="submit"
          :loading="saving"
          :disabled="!form.name"
        />
      </div>
    </form>
  </div>
</template>
