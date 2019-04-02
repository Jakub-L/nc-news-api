const connection = require('../db/connection');

exports.selectArticles = () => connection
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
  .groupBy(
    'articles.author',
    'title',
    'articles.article_id',
    'topic',
    'articles.created_at',
    'articles.votes',
  )
  .orderBy('articles.created_at', 'desc');
