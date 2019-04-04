const connection = require('../db/connection');

exports.selectTopics = () => connection.select('description', 'slug').from('topics');

exports.insertTopic = (topic) => {
  return connection
    .insert(topic)
    .into('topics')
    .returning(['slug', 'description']);
};
