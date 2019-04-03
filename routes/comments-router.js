const commentsRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { updateCommentByID } = require('../controllers/comments-controller');

commentsRouter
  .route('/:comment_id')
  .patch(updateCommentByID)
  .all(methodNotAllowed);

module.exports = commentsRouter;
