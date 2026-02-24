import client from './client';

export const getExercises = () => client.get('/exercises');
export const getExercise = (id) => client.get(`/exercises/${id}`);
export const createExercise = (data) => client.post('/exercises', data);
export const updateExercise = (id, data) => client.put(`/exercises/${id}`, data);
export const deleteExercise = (id) => client.delete(`/exercises/${id}`);
export const getExerciseHistory = (id) => client.get(`/exercises/${id}/history`);
