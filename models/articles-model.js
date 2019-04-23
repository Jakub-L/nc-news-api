const connection = require('../db/connection');

const selectArticles = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic,
  article_id,
  limit: maxArticles = 10,
  p: page = 1,
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
    'comment_count'
  ];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['desc', 'asc'].includes(order)) order = 'desc';
  if (Number.isNaN(+maxArticles) || maxArticles < 0) maxArticles = 10;
  if (Number.isNaN(+page) || page < 0) page = 1;

  return Promise.all([
    connection
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
      })
      .offset((Math.trunc(page) - 1) * Math.trunc(maxArticles))
      .limit(Math.trunc(maxArticles)),
    connection('articles')
      .modify((query) => {
        if (author) query.where({ 'articles.author': author });
        if (topic) query.where({ topic });
        if (article_id) query.where({ 'articles.article_id': article_id });
      })
      .count('article_id AS total_count'),
  ]);
};

const insertArticle = ({ username: author, ...articleRest }) => {
  return connection
    .insert({ author, ...articleRest })
    .into('articles')
    .returning(['author', 'title', 'article_id', 'body', 'topic', 'created_at', 'votes']);
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
  return connection('articles')
    .where('article_id', article_id)
    .del();
};

const selectComments = (
  article_id,
  {
    sort_by = 'created_at', order = 'desc', limit: maxComments = 10, p: page = 1,
  },
) => {
  // Defaults checking
  const allowedSortingCriteria = ['comment_id', 'votes', 'created_at', 'author', 'body'];
  if (!allowedSortingCriteria.includes(sort_by)) sort_by = 'created_at';
  if (!['asc', 'desc'].includes(order)) order = 'desc';
  if (Number.isNaN(+maxComments) || maxComments < 0) maxComments = 10;
  if (Number.isNaN(+page) || page < 1) page = 1;

  return selectArticles({ article_id }).then(([[article]]) => {
    if (!article) return Promise.reject({ status: 404 });
    return connection
      .select('comment_id', 'votes', 'created_at', 'author', 'body')
      .from('comments')
      .where({ article_id })
      .offset((Math.trunc(page) - 1) * Math.trunc(maxComments))
      .limit(Math.trunc(maxComments))
      .orderBy(sort_by, order);
  });
};

const insertComment = (article_id, { username: author, ...commentRemainder }) => {
  return connection
    .insert({ article_id, author, ...commentRemainder })
    .into('comments')
    .returning(['article_id', 'comment_id', 'votes', 'created_at', 'author', 'body']);
};
module.exports = {
  selectArticles,
  insertArticle,
  updateArticle,
  deleteArticle,
  selectComments,
  insertComment,
};
