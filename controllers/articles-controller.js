const { selectArticles } = require('../models/articles-model');

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then((articles) => {
      res.status(200).json({ articles });
    })
    .catch(next);
};
