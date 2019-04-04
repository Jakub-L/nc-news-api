const connection = require('../db/connection');

const selectUsers = (username) => {
  return connection
    .select('username', 'avatar_url', 'name')
    .from('users')
    .modify((query) => {
      if (username) query.where({ username });
    });
};

const insertUser = (user) => {
  return connection
    .insert(user)
    .into('users')
    .returning(['username', 'avatar_url', 'name']);
};

module.exports = { selectUsers, insertUser };
