const exerciseService = require('../services/exerciseService');

const exerciseController = {
  async list(req, res, next) {
    try {
      const exercises = await exerciseService.getAll();
      res.json(exercises);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const exercise = await exerciseService.getById(parseInt(req.params.id));
      res.json(exercise);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const exercise = await exerciseService.create(req.body);
      res.status(201).json(exercise);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const exercise = await exerciseService.update(parseInt(req.params.id), req.body);
      res.json(exercise);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await exerciseService.remove(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const history = await exerciseService.getHistory(parseInt(req.params.id));
      res.json(history);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = exerciseController;
