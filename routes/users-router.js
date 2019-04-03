const usersRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getUserByID } = require('../controllers/users-controller');

usersRouter
  .route('/:username')
  .get(getUserByID)
  .all(methodNotAllowed);

module.exports = usersRouter;
