const { selectTopics, insertTopic } = require('../models/topics-model');

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).json({ topics });
    })
    .catch(next);
};

exports.addTopic = (req, res, next) => {
  insertTopic(req.body)
    .then(([topic]) => res.status(201).json({ topic }))
    .catch(next);
};
