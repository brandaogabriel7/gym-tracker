const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const exerciseController = require('../controllers/exerciseController');

const router = express.Router();

router.get('/', exerciseController.list);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('muscleGroup').notEmpty().withMessage('Muscle group is required').trim(),
  ],
  validateRequest,
  exerciseController.create
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  exerciseController.get
);

router.put(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  exerciseController.update
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  exerciseController.remove
);

router.get(
  '/:id/history',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  exerciseController.getHistory
);

module.exports = router;
