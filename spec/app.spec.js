process.env.NODE_ENV = 'test';

const chai = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

chai.use(require('chai-sorted'));

const request = supertest(app);
const { expect } = chai;

describe('NC-NEWS-API', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('/api', () => {
    describe('/topics', () => {
      describe('DEFAULT BEHAVIOUR', () => {
        it('GET status:200 returns array of all topics', () => {
          return request
            .get('/api/topics')
            .expect(200)
            .then(({ body }) => {
              body.topics.forEach((topic) => {
                expect(topic).to.contain.keys('description', 'slug');
              });
            });
        });
      });
      describe('ERRORS', () => {
        it('GET status:404 for invalid path', () => {
          return request
            .get('/api/topics/invalid')
            .expect(404)
        });
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/topics')
                .expect(405)
            }),
          );
        });
      });
    });
    describe('/articles', () => {
      describe('DEFAULT BEHAVIOUR', () => {
        it('GET status:200 returns array of article objects', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => expect(article).to.contain.keys(
                'author',
                'title',
                'article_id',
                'topic',
                'body',
                'created_at',
                'votes',
              ));
            });
        });
        it('GET status:200 returns comment count for each article', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => expect(article).to.contain.keys('comment_count'));
              expect(body.articles[0].comment_count).to.equal('13');
            });
        });
        it('GET status:200 sorts articles descending by date', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.descendingBy('created_at');
            });
        });
      });
      describe('QUERIES', () => {
        it('GET status:200 returns articles filtered by author query', () => {
          return request
            .get('/api/articles?author=icellusedkars')
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => expect(article.author).to.equal('icellusedkars'));
            });
        });
        it('GET status:200 returns articles filtered by topic query', () => {
          return request
            .get('/api/articles?topic=mitch')
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => expect(article.topic).to.equal('mitch'));
            });
        });
        it('GET status:200 returns articles filtered by topic and author queries', () => {
          return request
            .get('/api/articles?topic=mitch&author=icellusedkars')
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach((article) => {
                expect(article.topic).to.equal('mitch');
                expect(article.author).to.equal('icellusedkars');
              });
            });
        });
        it('GET status:200 sorts articles by provided query', () => {
          return request
            .get('/api/articles?sort_by=author')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.descendingBy('author');
            });
        });
        it('GET status:200 sorts ascending or descending by provided query', () => {
          return request
            .get('/api/articles?order=asc')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.ascendingBy('created_at');
            });
        });
      });
      describe('ERRORS', () => {
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/articles')
                .expect(405)
            }),
          );
        });
        it('GET status:200 defaults to created_at for invalid sorting key', () => {
          return request
            .get('/api/articles?sort_by=invalid')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.descendingBy('created_at');
            });
        });
        it('GET status:200 defaults to descending for invalid sorting order', () => {
          return request
            .get('/api/articles?order=up')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.descendingBy('created_at');
            });
        });
        it('GET status:200 ignores invalid queries', () => {
          return request.get('/api/articles?invalid=foobar').expect(200);
        });
      });
      describe('/:article_id', () => {
        describe('DEFAULT BEHAVIOUR', () => {
          it('GET status:200 returns single article object', () => {
            return request
              .get('/api/articles/1')
              .expect(200)
              .then(({ body }) => expect(body.article).to.contain.keys(
                'author',
                'title',
                'article_id',
                'body',
                'topic',
                'created_at',
                'votes',
              ));
          });
          it('GET status:200 returns comment_count for article', () => {
            return request
              .get('/api/articles/1')
              .expect(200)
              .then(({ body }) => {
                expect(body.article).to.contain.keys('comment_count');
                expect(body.article.comment_count).to.equal('13');
              });
          });
          it('PATCH status:200 updates vote count and returns updated article', () => {
            return request
              .patch('/api/articles/1')
              .send({ inc_votes: 10 })
              .then(({ body }) => {
                expect(body.article.votes).to.equal(110);
                expect(body.article).to.contain.keys(
                  'author',
                  'title',
                  'article_id',
                  'body',
                  'topic',
                  'created_at',
                  'votes',
                  'comment_count',
                );
              });
          });
          it('PATCH status:200 accepts negative vote increments', () => {
            return request
              .patch('/api/articles/1')
              .send({ inc_votes: -10 })
              .then(({ body }) => {
                expect(body.article.votes).to.equal(90);
              });
          });
          it('DELETE status:204 removes article', () => {
            return request
              .delete('/api/articles/1')
              .expect(204)
              .then(() => {
                return request.get('/api/articles/1').expect(404);
              });
          });
        });
        describe('ERRORS', () => {
          it('ALL status:405 for invalid methods', () => {
            const invalid = ['post', 'put', 'options', 'trace'];
            return Promise.all(
              invalid.map((method) => {
                return request[method]('/api/articles/1')
                  .expect(405)
              }),
            );
          });
          it('GET status:404 for invalid path', () => {
            return request
              .get('/api/articles/3/invalid')
              .expect(404)
          });
          it('GET status:404 for non-existent article_id', () => {
            return request
              .get('/api/articles/100')
              .expect(404)
          });
          it('GET status:400 for non-numeric article_id', () => {
            return request
              .get('/api/articles/first')
              .expect(400)
          });
          it('PATCH status:404 for non-existent article_id', () => {
            return request
              .patch('/api/articles/100')
              .send({ inc_votes: 10 })
              .expect(404)
          });
          it('PATCH status:400 for non-numeric article_id', () => {
            return request
              .patch('/api/articles/first')
              .send({ inc_votes: 10 })
              .expect(400)
          });
          it('PATCH status:400 for non-numeric inc_votes', () => {
            return request
              .patch('/api/articles/1')
              .send({ inc_votes: 'two' })
              .expect(400)
          });
          it('PATCH status:200 defaults to 0 for missing inc_votes', () => {
            return request
              .patch('/api/articles/1')
              .send({})
              .expect(200);
          });
          it('DELETE status:404 for non-existent article_id', () => {
            return request
              .delete('/api/articles/100')
              .expect(404)
          });
          it('DELETE status:400 for non-numeric article_id', () => {
            return request
              .delete('/api/articles/first')
              .expect(400)
          });
        });
        describe('/comments', () => {
          describe('DEFAULT BEHAVIOUR', () => {
            it('GET status:200 returns array of comments', () => {
              return request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  body.comments.forEach((comment) => {
                    expect(comment).to.contain.keys(
                      'comment_id',
                      'votes',
                      'created_at',
                      'author',
                      'body',
                    );
                  });
                });
            });
            it('GET status:200 sorts results by descending created_at by default', () => {
              return request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.be.descendingBy('created_at');
                });
            });
            it('POST status:201 adds comment to article', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'icellusedkars', body: 'Lorem Ipsum' })
                .expect(201)
                .then(({ body }) => {
                  expect(body.comment).to.contain.keys(
                    'comment_id',
                    'votes',
                    'created_at',
                    'author',
                    'body',
                  );
                  return request
                    .get('/api/articles/1')
                    .expect(200)
                    .then(({ body: { article } }) => expect(article.comment_count).to.equal('14'));
                });
            });
          });
          describe('QUERIES', () => {
            it('GET status:200 returns comments sorted by specified key', () => {
              return request
                .get('/api/articles/1/comments?sort_by=author')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.be.descendingBy('author');
                });
            });
            it('GET status:200 returns comments sorted in specified order', () => {
              return request
                .get('/api/articles/1/comments?order=asc')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.be.ascendingBy('created_at');
                });
            });
          });
          describe('ERRORS', () => {
            it('ALL status:405 for invalid methods', () => {
              const invalid = ['put', 'delete', 'trace', 'options', 'patch'];
              return Promise.all(
                invalid.map((method) => {
                  return request[method]('/api/articles/1/comments')
                    .expect(405)
                }),
              );
            });
            it('GET status:404 for invalid path', () => {
              return request
                .get('/api/articles/3/comments/invalid')
                .expect(404)
            });
            it('GET status:200 defaults to created_at for invalid sorting key', () => {
              return request
                .get('/api/articles/1/comments?sort_by=invalid')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.be.descendingBy('created_at');
                });
            });
            it('GET status:200 defaults to descending for invalid sorting order', () => {
              return request
                .get('/api/articles/1/comments?order=up')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.be.descendingBy('created_at');
                });
            });
            it('GET status:200 ignores invalid queries', () => {
              return request.get('/api/articles/1/comments?upvoted=true').expect(200);
            });
            it('GET status:404 for non-existent article_id', () => {
              return request
                .get('/api/articles/100/comments')
                .expect(404)
            });
            it('GET status:400 for non-numeric article_id', () => {
              return request
                .get('/api/articles/first/comments')
                .expect(400)
            });
            it('POST status:404 for non-existent article_id', () => {
              return request
                .post('/api/articles/100/comments')
                .send({ username: 'icellusedkars', body: 'lorem' })
                .expect(404)
            });
            it('POST status:400 for non-numeric article_id', () => {
              return request
                .post('/api/articles/first/comments')
                .send({ username: 'icellusedkars', body: 'lorem' })
                .expect(400)
            });
            it('POST status:400 for non-existent username', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'geoff', body: 'lorem' })
                .expect(400)
            });
            it('POST status:400 for empty body', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'geoff', body: '' })
                .expect(400)
            });
          });
        });
      });
    });
    describe('/comments', () => {
      describe('/:comment_id', () => {
        describe('DEFAULT BEHAVIOUR', () => {
          it('PATCH status:200 returns updated comment', () => {
            return request
              .patch('/api/comments/1')
              .send({ inc_votes: 1 })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment).to.contain.keys(
                  'comment_id',
                  'votes',
                  'created_at',
                  'author',
                  'body',
                );
              });
          });
          it('PATCH status:200 updates comment votes', () => {
            return request
              .patch('/api/comments/1')
              .send({ inc_votes: 1 })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(17);
              });
          });
          it('PATCH status:200 accepts negative inc_votes', () => {
            return request
              .patch('/api/comments/1')
              .send({ inc_votes: -1 })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(15);
              });
          });
        });
        describe('ERRORS', () => {
          it('GET status:404 for invalid path', () => {
            return request
              .get('/api/comments/1/invalid')
              .expect(404)
          });
          it('ALL status:405 for invalid methods', () => {
            const invalid = ['get', 'post', 'put', 'delete', 'options', 'trace'];
            return Promise.all(
              invalid.map((method) => {
                return request[method]('/api/comments/1')
                  .expect(405)
              }),
            );
          });
          it('PATCH status:404 for non-existent comment_id', () => {
            return request
              .patch('/api/comments/100')
              .send({ inc_votes: 1 })
              .expect(404)
          });
          it('PATCH status:400 for non-numeric comment_id', () => {
            return request
              .patch('/api/comments/first')
              .send({ inc_votes: 1 })
              .expect(400)
          });
          it('PATCH status:400 for non-numeric inc_votes', () => {
            return request
              .patch('/api/comments/1')
              .send({ inc_votes: 'apple' })
              .expect(400)
          });
          it('PATCH status:200 defaults to 0 for missing inc_votes', () => {
            return request
              .patch('/api/comments/1')
              .send({ })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(16);
              });
          });
        });
      });
      describe('/*', () => {
        describe('ERRORS', () => {
          it('GET status:404 for invalid path', () => {
            return request
              .get('/api/comments/1/invalid')
              .expect(404)
          });
        });
      });
    });
    describe('/*', () => {
      describe('ERRORS', () => {
        it('GET status:404 for invalid path', () => {
          return request
            .get('/api/invalid')
            .expect(404)
        });
      });
    });
  });
  describe('/*', () => {
    describe('ERRORS', () => {
      it('GET status:404 for invalid path', () => {
        return request
          .get('/invalid')
          .expect(404)
      });
    });
  });
});
