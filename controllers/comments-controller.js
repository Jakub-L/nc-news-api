const { updateComment } = require('../models/comments-model');

exports.updateCommentByID = (req, res, next) => {
  updateComment(req.params.comment_id, req.body)
    .then(([comment]) => {
      if (!comment) next({ status: 404 });
      else res.status(200).json({ comment });
    })
    .catch(next);
};
