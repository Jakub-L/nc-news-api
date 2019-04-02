const topicsRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getTopics } = require('../controllers/topics-controller');

topicsRouter
  .route('/')
  .get(getTopics)
  .all(methodNotAllowed);

module.exports = topicsRouter;
