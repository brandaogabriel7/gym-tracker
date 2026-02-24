import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/workouts', name: 'workouts', component: () => import('../views/WorkoutsView.vue') },
  { path: '/workouts/new', name: 'workout-new', component: () => import('../views/WorkoutFormView.vue') },
  { path: '/workouts/:id', name: 'workout-detail', component: () => import('../views/WorkoutDetailView.vue') },
  { path: '/workouts/:id/edit', name: 'workout-edit', component: () => import('../views/WorkoutFormView.vue') },
  { path: '/exercises', name: 'exercises', component: () => import('../views/ExercisesView.vue') },
  { path: '/exercises/:id/history', name: 'exercise-history', component: () => import('../views/ExerciseHistoryView.vue') },
  { path: '/templates', name: 'templates', component: () => import('../views/TemplatesView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
