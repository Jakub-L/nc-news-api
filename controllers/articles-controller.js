const {
  selectArticles,
  updateArticle,
  deleteArticle,
  selectComments,
  insertComment,
} = require('../models/articles-model');

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(([articles, [total_count]]) => {
      res.status(200).json({ ...total_count, articles });
    })
    .catch(next);
};

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  selectArticles({ ...req.query, article_id })
    .then(([[article]]) => {
      if (!article) next({ status: 404 });
      else res.status(200).json({ article });
    })
    .catch(next);
};

exports.updateArticleByID = (req, res, next) => {
  updateArticle(req.params.article_id, req.body)
    .then(([[article]]) => {
      if (!article) next({ status: 404 });
      else res.status(200).json({ article });
    })
    .catch(next);
};

exports.removeArticleByID = (req, res, next) => {
  deleteArticle(req.params.article_id)
    .then((success) => {
      if (!success) next({ status: 404 });
      else res.status(204).send();
    })
    .catch(next);
};

exports.getCommentsByArticleID = (req, res, next) => {
  selectComments(req.params.article_id, req.query)
    .then(comments => res.status(200).json({ comments }))
    .catch(next);
};

exports.addCommentToArticle = (req, res, next) => {
  const { body } = req.body;
  if (!body) next({ status: 400 });
  else {
    insertComment(req.params.article_id, req.body)
      .then(([comment]) => {
        res.status(201).json({ comment });
      })
      .catch(next);
  }
};
