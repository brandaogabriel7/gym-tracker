import client from './client';

export const getWorkouts = () => client.get('/workouts');
export const getWorkout = (id) => client.get(`/workouts/${id}`);
export const createWorkout = (data) => client.post('/workouts', data);
export const updateWorkout = (id, data) => client.put(`/workouts/${id}`, data);
export const deleteWorkout = (id) => client.delete(`/workouts/${id}`);
export const createWorkoutFromTemplate = (templateId) => client.post(`/workouts/from-template/${templateId}`);
