exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', (usersTable) => {
    usersTable.text('username').primary();
    usersTable.text('name').notNullable();
    usersTable.text('avatar_url');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
