const templateService = require('../services/templateService');

const templateController = {
  async list(req, res, next) {
    try {
      const templates = await templateService.getAll();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const template = await templateService.getById(parseInt(req.params.id));
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const template = await templateService.create(req.body);
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const template = await templateService.update(parseInt(req.params.id), req.body);
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await templateService.remove(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async createFromWorkout(req, res, next) {
    try {
      const template = await templateService.createFromWorkout(parseInt(req.params.workoutId));
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = templateController;
