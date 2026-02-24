const workoutService = require('../services/workoutService');

const workoutController = {
  async list(req, res, next) {
    try {
      const workouts = await workoutService.getAll();
      res.json(workouts);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const workout = await workoutService.getById(parseInt(req.params.id));
      res.json(workout);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const workout = await workoutService.create(req.body);
      res.status(201).json(workout);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const workout = await workoutService.update(parseInt(req.params.id), req.body);
      res.json(workout);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await workoutService.remove(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async createFromTemplate(req, res, next) {
    try {
      const workout = await workoutService.createFromTemplate(parseInt(req.params.templateId));
      res.status(201).json(workout);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = workoutController;
