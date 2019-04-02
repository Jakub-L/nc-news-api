const { selectArticles, updateArticle } = require('../models/articles-model');

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

