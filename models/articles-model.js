const connection = require('../db/connection');

exports.selectArticles = (
  {
    sort_by = 'created_at', order = 'desc', author, topic,
  },
  article_id,
) => {
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

