const { selectUsers, insertUser } = require('../models/users-model');

exports.getUserByID = (req, res, next) => {
  selectUsers(req.params.username)
    .then(([user]) => {
      if (!user) next({ status: 404 });
      else res.status(200).json({ user });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then(users => res.status(200).json({ users }))
    .catch(next);
};

exports.addUser = (req, res, next) => {
  insertUser(req.body)
    .then(([user]) => res.status(201).json({ user }))
    .catch(next);
};
