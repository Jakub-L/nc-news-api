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
  return connection('articles')
    .where({ article_id })
    .increment('votes', inc_votes)
    .then(() => {
      return selectArticles({ article_id });
    });
};

const deleteArticle = (article_id) => {
  return selectArticles({ article_id }).then(([article]) => {
    if (!article) return Promise.reject({ status: 404 });
    return connection('articles')
      .where('article_id', article_id)
      .del();
  });
};

const selectComments = (article_id, { sort_by = 'created_at', order = 'desc' }) => {
  // Defaults checking
  const allowedSortingCriteria = ['comment_id', 'votes', 'created_at', 'author', 'body'];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['asc', 'desc'].includes(order)) order = 'desc';

  return selectArticles({ article_id }).then(([article]) => {
    if (!article) return Promise.reject({ status: 404 });
    return connection
      .select('comment_id', 'votes', 'created_at', 'author', 'body')
      .from('comments')
      .where({ article_id })
      .orderBy(sort_by, order);
  });
};

const insertComment = (article_id, { username: author, body }) => {
  return selectArticles({ article_id }).then(([article]) => {
    if (!article) return Promise.reject({ status: 404 });
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
