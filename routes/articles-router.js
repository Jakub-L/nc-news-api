const articlesRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const {
  getArticles,
  getArticleByID,
  updateArticleByID,
  removeArticleByID,
} = require('../controllers/articles-controller');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(methodNotAllowed);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .patch(updateArticleByID)
  .delete(removeArticleByID)
  .all(methodNotAllowed);

module.exports = articlesRouter;
