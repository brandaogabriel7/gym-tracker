const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const templateController = require('../controllers/templateController');

const router = express.Router();

router.get('/', templateController.list);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('exercises').optional().isArray().withMessage('Exercises must be an array'),
    body('exercises.*.exerciseId').optional().isInt().withMessage('Exercise ID must be an integer'),
    body('exercises.*.order').optional().isInt().withMessage('Order must be an integer'),
  ],
  validateRequest,
  templateController.create
);

router.post(
  '/from-workout/:workoutId',
  [param('workoutId').isInt().withMessage('Workout ID must be an integer')],
  validateRequest,
  templateController.createFromWorkout
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  templateController.get
);

router.put(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  templateController.update
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  templateController.remove
);

module.exports = router;
