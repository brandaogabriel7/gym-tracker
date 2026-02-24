<script setup>
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

const router = useRouter();

const items = [
  { label: 'Dashboard', icon: 'pi pi-chart-bar', command: () => router.push('/') },
  { label: 'Treinos', icon: 'pi pi-calendar', command: () => router.push('/workouts') },
  { label: 'Exercícios', icon: 'pi pi-list', command: () => router.push('/exercises') },
  { label: 'Templates', icon: 'pi pi-copy', command: () => router.push('/templates') },
];
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <div class="layout">
    <Menubar :model="items">
      <template #start>
        <span class="font-bold text-xl mr-4" style="cursor: pointer" @click="router.push('/')">
          <i class="pi pi-bolt mr-2"></i>Gym Tracker
        </span>
      </template>
    </Menubar>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background: #f5f7fa;
  color: #1e293b;
}

.layout {
  min-height: 100vh;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.p-menubar {
  background: #1e293b !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0.5rem 1.5rem !important;
}

.p-menubar .p-menubar-item-link {
  color: #e2e8f0 !important;
}

.p-menubar .p-menubar-item-link:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.p-menubar .p-menubar-item-icon {
  color: #94a3b8 !important;
}

.p-menubar .p-menubar-item-link:hover .p-menubar-item-icon {
  color: #fff !important;
}

.p-card {
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid #e2e8f0 !important;
}

.p-datatable .p-datatable-thead > tr > th {
  background: #f8fafc !important;
  color: #475569 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.p-datatable .p-datatable-tbody > tr {
  border-bottom: 1px solid #f1f5f9 !important;
}

.p-datatable .p-datatable-tbody > tr:hover {
  background: #f0f9ff !important;
}

.chart-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-card h2 {
  color: #334155;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stat-card .p-card-title {
  font-size: 0.85rem !important;
  color: #64748b !important;
  font-weight: 500 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card .p-card-body {
  padding: 1.25rem !important;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stat-value span {
  font-size: 0.875rem;
  font-weight: 400;
  color: #64748b;
}
</style>
