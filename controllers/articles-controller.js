const {
  selectArticles,
  updateArticle,
  deleteArticle,
  selectComments,
  insertComment,
} = require('../models/articles-model');

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then((articles) => {
      res.status(200).json({ articles });
    })
    .catch(next);
};

exports.getArticleByID = (req, res, next) => {
  selectArticles(req.query, req.params.article_id)
    .then((articles) => {
      if (articles.length === 0) {
        next({ status: 404, msg: 'article_id Not Found' });
      } else {
        res.status(200).json({ article: articles[0] });
      }
    })
    .catch(next);
};

exports.updateArticleByID = (req, res, next) => {
  updateArticle(req.params.article_id, req.body)
    .then((updatedArticles) => {
      if (updatedArticles.length === 0) {
        next({ status: 404, msg: 'article_id Not Found' });
      } else {
        res.status(200).json({ article: updatedArticles[0] });
      }
    })
    .catch(next);
};

exports.removeArticleByID = (req, res, next) => {
  deleteArticle(req.params.article_id)
    .then(() => res.status(204).send())
    .catch(next);
};

exports.getCommentsByArticleID = (req, res, next) => {
  selectComments(req.params.article_id, req.query)
    .then(comments => res.status(200).json({ comments }))
    .catch(next);
};

exports.addCommentToArticle = (req, res, next) => {
  insertComment(req.params.article_id, req.body)
    .then((comments) => {
      res.status(201).json({ comment: comments[0] });
    })
    .catch(next);
};
