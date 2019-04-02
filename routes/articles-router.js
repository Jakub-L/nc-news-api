const articlesRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const {
  getArticles,
  getArticleByID,
  updateArticleByID,
  removeArticleByID,
  getCommentsByArticleID,
  addCommentToArticle,
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

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleID)
  .post(addCommentToArticle)
  .all(methodNotAllowed);

module.exports = articlesRouter;
