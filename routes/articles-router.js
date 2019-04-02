const articlesRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getArticles, getArticleByID } = require('../controllers/articles-controller');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(methodNotAllowed);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .all(methodNotAllowed);

module.exports = articlesRouter;
