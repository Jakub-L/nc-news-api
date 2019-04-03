const connection = require('../db/connection');

const updateComment = (comment_id, { inc_votes = 0 }) => {
  if (Number.isNaN(+comment_id)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. comment_id must be numeric' });
  }
  if (Number.isNaN(+inc_votes)) {
    return Promise.reject({ status: 400, msg: 'Invalid Request. inc_votes must be numeric' });
  }
  return connection('comments')
    .where({ comment_id })
    .increment('votes', inc_votes)
    .returning(['comment_id', 'votes', 'created_at', 'author', 'body']);
};

module.exports = { updateComment };
