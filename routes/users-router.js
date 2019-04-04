const usersRouter = require('express').Router();
const { methodNotAllowed } = require('../errors');
const { getUsers, getUserByID, addUser } = require('../controllers/users-controller');

usersRouter
  .route('/')
  .get(getUsers)
  .post(addUser)
  .all(methodNotAllowed);

usersRouter
  .route('/:username')
  .get(getUserByID)
  .all(methodNotAllowed);

module.exports = usersRouter;
