const apiRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const topicsRouter = require('./topics-router');
const articlesRouter = require('./articles-router');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.route('/').all(methodNotAllowed);

module.exports = apiRouter;
