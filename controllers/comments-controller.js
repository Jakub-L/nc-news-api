const { updateComment } = require('../models/comments-model');

exports.updateCommentByID = (req, res, next) => {
  updateComment(req.params.comment_id, req.body)
    .then((updatedComments) => {
      if (updatedComments.length === 0) {
        next({ status: 404 });
      } else {
        res.status(200).json({ comment: updatedComments[0] });
      }
    })
    .catch(next);
};
