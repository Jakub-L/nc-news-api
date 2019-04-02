const articlesRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const {
  getArticles,
  getArticleByID,
  updateArticleByID,
} = require('../controllers/articles-controller');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(methodNotAllowed);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .patch(updateArticleByID)
  .all(methodNotAllowed);

module.exports = articlesRouter;
