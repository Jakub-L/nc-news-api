const { topicsData, usersData } = require('../data');

exports.seed = (knex, Promise) => knex.migrate
  .rollback()
  .then(() => knex.migrate.latest())
  .then(() => knex.insert(topicsData).into('topics'))
  .then(() => knex.insert(usersData).into('users'));
