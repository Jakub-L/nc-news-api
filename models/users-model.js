const connection = require('../db/connection');

const selectUsers = (username) => {
  return connection
    .select('username', 'avatar_url', 'name')
    .from('users')
    .where({ username });
};

module.exports = { selectUsers };
