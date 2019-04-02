const express = require('express');
const apiRouter = require('./routes/api');
const {
  routeNotFound, handlePSQL, handle400, handle500,
} = require('./errors');

const app = express();

app.use(express.json());

// Routing
app.use('/api', apiRouter);
app.all('/*', routeNotFound);

// Error handling
app.use(handlePSQL);
app.use(handle400);
app.use(handle500);

module.exports = app;
