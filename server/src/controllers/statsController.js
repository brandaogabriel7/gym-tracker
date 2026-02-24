const statsService = require('../services/statsService');

const statsController = {
  async overview(req, res, next) {
    try {
      const data = await statsService.getOverview();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async exerciseProgression(req, res, next) {
    try {
      const data = await statsService.getExerciseProgression(parseInt(req.params.id));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async volumeOverTime(req, res, next) {
    try {
      const data = await statsService.getVolumeOverTime();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async frequency(req, res, next) {
    try {
      const data = await statsService.getFrequency();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async muscleGroupDistribution(req, res, next) {
    try {
      const data = await statsService.getMuscleGroupDistribution();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = statsController;
