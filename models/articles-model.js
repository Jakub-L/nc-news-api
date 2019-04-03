const connection = require('../db/connection');

const selectArticles = ({
  sort_by = 'created_at', order = 'desc', author, topic, article_id,
}) => {
  // Defaults checking
  const allowedSortingCriteria = [
    'author',
    'title',
    'article_id',
    'body',
    'topic',
    'created_at',
    'votes',
  ];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['desc', 'asc'].includes(order)) order = 'desc';
  if (article_id !== undefined && Number.isNaN(+article_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. article_id must be numeric' });
  }

  return connection
    .select(
      'articles.author',
      'title',
      'articles.article_id',
      'articles.body',
      'topic',
      'articles.created_at',
      'articles.votes',
    )
    .from('articles')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .modify((query) => {
      if (author) query.where({ 'articles.author': author });
      if (topic) query.where({ topic });
      if (article_id) query.where({ 'articles.article_id': article_id });
    });
};

const updateArticle = (article_id, { inc_votes = 0 }) => {
  // Error checking
  if (Number.isNaN(+article_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. article_id must be numeric' });
  }
  if (Number.isNaN(+inc_votes)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. inc_votes must be numeric' });
  }

  return connection('articles')
    .where({ article_id })
    .increment('votes', inc_votes)
    .then(() => {
      return selectArticles({ article_id });
    });
};

const deleteArticle = (article_id) => {
  // Error checking
  if (Number.isNaN(+article_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. article_id must be numeric' });
  }
  return connection
    .from('articles')
    .select('article_id')
    .where({ article_id })
    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'article_id Not Found' });
      }
      return connection('articles')
        .where('article_id', article_id)
        .del();
    });
};

const selectComments = (article_id, { sort_by = 'created_at', order = 'desc' }) => {
  // Defaults & error checking
  if (Number.isNaN(+article_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. article_id must be numeric' });
  }
  const allowedSortingCriteria = ['comment_id', 'votes', 'created_at', 'author', 'body'];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['asc', 'desc'].includes(order)) order = 'desc';

  return connection
    .select('article_id')
    .from('articles')
    .where({ article_id })
    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'article_id Not Found' });
      }
      return connection
        .select('comment_id', 'votes', 'created_at', 'author', 'body')
        .from('comments')
        .where({ article_id })
        .orderBy(sort_by, order);
    });
};

const insertComment = (article_id, { username: author, body }) => {
  // Error checking
  if (Number.isNaN(+article_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. article_id must be numeric' });
  }
  if (body.length === 0) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. body must not be empty' });
  }
  return connection
    .select('article_id')
    .from('articles')
    .where({ article_id })
    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404 });
      }
    })
    .then(() => {
      return connection
        .select('username')
        .from('users')
        .where({ username: author });
    })
    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 400 });
      }
    })
    .then(() => {
      return connection
        .insert({ article_id, author, body })
        .into('comments')
        .returning(['comment_id', 'votes', 'created_at', 'author', 'body']);
    });
};
module.exports = {
  selectArticles,
  updateArticle,
  deleteArticle,
  selectComments,
  insertComment,
};
