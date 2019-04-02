const { selectArticles } = require('../models/articles-model');

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).json({ articles });
    })
    .catch(next);
};
