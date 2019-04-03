const commentsRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { updateCommentByID, removeCommentByID } = require('../controllers/comments-controller');

commentsRouter
  .route('/:comment_id')
  .patch(updateCommentByID)
  .delete(removeCommentByID)
  .all(methodNotAllowed);

module.exports = commentsRouter;
