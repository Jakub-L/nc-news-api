const { selectArticles } = require('../models/articles-model');

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
      res.status(200).json({ article: articles[0] });
    })
    .catch(next);
};
