exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (topicsTable) => {
    topicsTable.text('slug').primary();
    topicsTable.text('description');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
