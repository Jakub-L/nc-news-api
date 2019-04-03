const apiRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getAllEndpoints } = require('../controllers/api-controller');
const topicsRouter = require('./topics-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const usersRouter = require('./users-router');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

apiRouter
  .route('/')
  .get(getAllEndpoints)
  .all(methodNotAllowed);

module.exports = apiRouter;
