const connection = require('../db/connection');

exports.selectArticles = ({
  sort_by = 'created_at', order = 'desc', author, topic,
}) => {
  // Defaults checking
  const allowedSortingCriteria = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes'];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['desc', 'asc'].includes(order)) order = 'desc';

  return connection
    .select(
      'articles.author',
      'title',
      'articles.article_id',
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
    });
};
