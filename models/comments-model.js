const connection = require('../db/connection');

const updateComment = (comment_id, { inc_votes = 0 }) => {
  return connection('comments')
    .where({ comment_id })
    .increment('votes', inc_votes)
    .returning(['comment_id', 'votes', 'created_at', 'author', 'body']);
};

module.exports = { updateComment };
