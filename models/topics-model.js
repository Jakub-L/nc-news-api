const connection = require('../db/connection');

exports.selectTopics = () => connection.select('description', 'slug').from('topics');
