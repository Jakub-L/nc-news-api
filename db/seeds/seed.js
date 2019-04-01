const {
  topicsData, usersData, articlesData, commentsData,
} = require('../data');
const {
  jsToPsqlTimestamp,
  renameKeysOfObjects,
  getKeyToKeyPairing,
  replaceKeysOfObject,
} = require('../../utils/data-normalisation');

exports.seed = (knex, Promise) => knex.migrate
  .rollback()
  .then(() => knex.migrate.latest())
  .then(() => knex.insert(topicsData).into('topics'))
  .then(() => knex.insert(usersData).into('users'))
  .then(() => {
    const articleDataISOTimestamp = jsToPsqlTimestamp(articlesData);
    return knex
      .insert(articleDataISOTimestamp)
      .into('articles')
      .returning('*');
  })
  .then((articles) => {
    // Convert from "belongs_to" (article title) to "article_id"
    const articleTitleIDPairs = getKeyToKeyPairing(articles, 'title', 'article_id');
    const commentsDataArticleID = replaceKeysOfObject(
      commentsData,
      'belongs_to',
      'article_id',
      articleTitleIDPairs,
    );
      // Convert timestamp to ISO (PostgreSQL accepted)
    const commentsDataISOTimestamp = jsToPsqlTimestamp(commentsDataArticleID);
    // Rename "created_by" field to "author"
    const renamedBelongToComments = renameKeysOfObjects(
      commentsDataISOTimestamp,
      'created_by',
      'author',
    );
    return knex.insert(renamedBelongToComments).into('comments');
  });
