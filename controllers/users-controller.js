const { selectUsers } = require('../models/users-model');

exports.getUserByID = (req, res, next) => {
  selectUsers(req.params.username)
    .then(([user]) => {
      if (!user) next({ status: 404 });
      else res.status(200).json({ user });
    })
    .catch(next);
};
