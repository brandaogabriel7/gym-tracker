import client from './client';

export const getOverview = () => client.get('/stats/overview');
export const getExerciseProgression = (id) => client.get(`/stats/exercise/${id}/progression`);
export const getVolumeOverTime = () => client.get('/stats/volume-over-time');
export const getFrequency = () => client.get('/stats/frequency');
export const getMuscleGroupDistribution = () => client.get('/stats/muscle-group-distribution');
