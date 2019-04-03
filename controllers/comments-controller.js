const { updateComment, deleteComment } = require('../models/comments-model');

exports.updateCommentByID = (req, res, next) => {
  updateComment(req.params.comment_id, req.body)
    .then(([comment]) => {
      if (!comment) next({ status: 404 });
      else res.status(200).json({ comment });
    })
    .catch(next);
};

exports.removeCommentByID = (req, res, next) => {
  deleteComment(req.params.comment_id)
    .then((success) => {
      if (!success) next({ status: 404 });
      else res.status(204).send();
    })
    .catch(next);
};
