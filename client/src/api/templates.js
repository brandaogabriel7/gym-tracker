import client from './client';

export const getTemplates = () => client.get('/templates');
export const getTemplate = (id) => client.get(`/templates/${id}`);
export const createTemplate = (data) => client.post('/templates', data);
export const updateTemplate = (id, data) => client.put(`/templates/${id}`, data);
export const deleteTemplate = (id) => client.delete(`/templates/${id}`);
export const createTemplateFromWorkout = (workoutId) => client.post(`/templates/from-workout/${workoutId}`);
