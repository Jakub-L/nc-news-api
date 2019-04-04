const topicsRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getTopics, addTopic } = require('../controllers/topics-controller');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(addTopic)
  .all(methodNotAllowed);

module.exports = topicsRouter;
