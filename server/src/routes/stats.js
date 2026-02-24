const express = require('express');
const { param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/overview', statsController.overview);

router.get(
  '/exercise/:id/progression',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  statsController.exerciseProgression
);

router.get('/volume-over-time', statsController.volumeOverTime);

router.get('/frequency', statsController.frequency);

router.get('/muscle-group-distribution', statsController.muscleGroupDistribution);

module.exports = router;
