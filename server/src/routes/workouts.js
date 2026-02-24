const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const workoutController = require('../controllers/workoutController');

const router = express.Router();

router.get('/', workoutController.list);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('exercises').optional().isArray().withMessage('Exercises must be an array'),
    body('exercises.*.exerciseId').optional().isInt().withMessage('Exercise ID must be an integer'),
    body('exercises.*.order').optional().isInt().withMessage('Order must be an integer'),
  ],
  validateRequest,
  workoutController.create
);

router.post(
  '/from-template/:templateId',
  [param('templateId').isInt().withMessage('Template ID must be an integer')],
  validateRequest,
  workoutController.createFromTemplate
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  workoutController.get
);

router.put(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  workoutController.update
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  workoutController.remove
);

module.exports = router;
