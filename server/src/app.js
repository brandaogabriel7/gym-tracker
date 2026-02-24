const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const exerciseRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workouts');
const templateRoutes = require('./routes/templates');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

module.exports = app;
