exports.methodNotAllowed = (req, res) => {
  res.status(405).send({ msg: 'Method Not Allowed' });
};

exports.handle400 = (err, req, res, next) => {
  const codes = ['22P02', '23502', '23503', '42703'];
  if (err.status === 400 || (codes.includes(err.code) && !err.constraint)) {
    res.status(400).send({ msg: 'Bad Request' });
  } else next(err);
};
exports.handle404 = (err, req, res, next) => {
  const codes = ['23503'];
  const constraints = ['comments_article_id_foreign'];
  if (err.status === 404 || (codes.includes(err.code) && constraints.includes(err.constraint))) {
    res.status(404).send({ msg: 'Resource Not Found' });
  } else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = ['23503', '23505'];
  const constraints = [
    'comments_author_foreign',
    'articles_topic_foreign',
    'articles_author_foreign',
    'topics_pkey',
  ];
  if (err.status === 422 || (codes.includes(err.code) && constraints.includes(err.constraint))) {
    res.status(422).send({ msg: 'Unprocessable Entity' });
  } else next(err);
};

exports.handle500 = (err, req, res, next) => {
  res.status(500).send({ msg: 'Internal Server Error' });
};
