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
    describe('DEFAULT BEHAVIOUR', () => {
      it('GET status:200 returns object containing all api calls', () => {
        return request
          .get('/api')
          .expect(200)
          .then(({ body }) => {
            expect(body.endpoints).to.contain.keys('GET /api');
          });
      });
    });
    describe('ERRORS', () => {
      it('GET status:404 for invalid path', () => {
        return request.get('/api/invalid').expect(404);
      });
      it('ALL status:405 for invalid methods', () => {
        const invalid = ['post', 'put', 'delete', 'patch', 'options', 'trace'];
        return Promise.all(
          invalid.map((method) => {
            return request[method]('/api').expect(405);
          }),
        );
      });
    });
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
        it('POST status:201 creates new topic and returns it', () => {
          return request
            .post('/api/topics')
            .send({ slug: 'curling', description: 'skipping stones, but on ice' })
            .expect(201)
            .then(({ body }) => {
              expect(body.topic).to.contain.keys('slug', 'description');
            });
        });
      });
      describe('ERRORS', () => {
        it('GET status:404 for invalid path', () => {
          return request.get('/api/topics/invalid').expect(404);
        });
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/topics').expect(405);
            }),
          );
        });
        it('POST status:400 for missing slug key', () => {
          return request
            .post('/api/topics')
            .send({ description: 'skipping stones, but on ice' })
            .expect(400);
        });
        it('POST status:400 for missing description key', () => {
          return request
            .post('/api/topics')
            .send({ description: 'skipping stones, but on ice' })
            .expect(400);
        });
        it('POST status:400 for too many keys', () => {
          return request
            .post('/api/topics')
            .send({
              slug: 'curling',
              description: 'skipping stones, but on ice',
              location: 'scotland',
            })
            .expect(400);
        });
        it('POST status:422 for non-unique slug', () => {
          return request
            .post('/api/topics')
            .send({ slug: 'mitch', description: 'that guy' })
            .expect(422);
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
        it('GET status:200 returns 10 articles by default', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(10);
            });
        });
        it('GET status:200 returns first page by default', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
            });
        });
        it('GET status:200 returns total article count', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              expect(body.total_count).to.equal('12');
            });
        });
        it('POST status:201 creates new article and returns newly created article', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              title: 'This is a Title',
              topic: 'mitch',
              body: 'lorem ipsum',
            })
            .expect(201)
            .then(({ body }) => {
              expect(body.article).to.contain.keys(
                'author',
                'title',
                'article_id',
                'body',
                'topic',
                'created_at',
                'votes',
              );
              expect(body.article.votes).to.equal(0);
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
        it('GET status:200 returns total article count, filtered by query', () => {
          return request
            .get('/api/articles?author=icellusedkars')
            .expect(200)
            .then(({ body }) => {
              expect(body.total_count).to.equal('6');
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
        it('GET status:200 returns number of articles specified by query', () => {
          return request
            .get('/api/articles?limit=5')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(5);
            });
        });
        it('GET status:200 truncates limit query', () => {
          return request
            .get('/api/articles?limit=5.7')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(5);
            });
        });
        it('GET status:200 returns specified page of results', () => {
          return request
            .get('/api/articles?p=2')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].title).to.equal('Am I a cat?');
            });
        });
        it('GET status:200 truncates page query', () => {
          return request
            .get('/api/articles?p=2.3')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].title).to.equal('Am I a cat?');
            });
        });
        it('GET status:200 returns empty if page is past maximum page', () => {
          return request
            .get('/api/articles?p=100')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(0);
            });
        });
      });
      describe('ERRORS', () => {
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/articles').expect(405);
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
        it('GET status:200 defaults to 10 for invalid limit', () => {
          return request
            .get('/api/articles?limit=invalid')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(10);
            });
        });
        it('GET status:200 defaults to 10 for negative limit', () => {
          return request
            .get('/api/articles?limit=-2')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.lengthOf(10);
            });
        });
        it('GET status:200 defaults to 1 for invalid page', () => {
          return request
            .get('/api/articles?p=six')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
            });
        });
        it('GET status:200 defaults to 1 for negative page', () => {
          return request
            .get('/api/articles?p=-2')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
            });
        });
        it('POST status:400 for username missing from request body', () => {
          return request
            .post('/api/articles')
            .send({
              title: 'This is a Title',
              topic: 'mitch',
              body: 'lorem ipsum',
            })
            .expect(400);
        });
        it('POST status:400 for title missing from request body', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              topic: 'mitch',
              body: 'lorem ipsum',
            })
            .expect(400);
        });
        it('POST status:400 for topic missing from request body', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              title: 'This is a Title',
              body: 'lorem ipsum',
            })
            .expect(400);
        });
        it('POST status:400 for body missing from request body', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              title: 'This is a Title',
              topic: 'mitch',
            })
            .expect(400);
        });
        it('POST status:400 for too many keys request body', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              title: 'This is a Title',
              topic: 'mitch',
              body: 'icellusedkars',
              length: 5,
            })
            .expect(400);
        });
        it('POST status:422 for username not matching existing users', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'invalid',
              title: 'This is a Title',
              topic: 'mitch',
              body: 'lorem ipsum',
            })
            .expect(422);
        });
        it('POST status:422 for topic not matching existing topics', () => {
          return request
            .post('/api/articles')
            .send({
              username: 'icellusedkars',
              title: 'This is a Title',
              topic: 'invalid',
              body: 'lorem ipsum',
            })
            .expect(422);
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
                return request[method]('/api/articles/1').expect(405);
              }),
            );
          });
          it('GET status:404 for invalid path', () => {
            return request.get('/api/articles/3/invalid').expect(404);
          });
          it('GET status:404 for non-existent article_id', () => {
            return request.get('/api/articles/100').expect(404);
          });
          it('GET status:400 for non-numeric article_id', () => {
            return request.get('/api/articles/first').expect(400);
          });
          it('PATCH status:404 for non-existent article_id', () => {
            return request
              .patch('/api/articles/100')
              .send({ inc_votes: 10 })
              .expect(404);
          });
          it('PATCH status:400 for non-numeric article_id', () => {
            return request
              .patch('/api/articles/first')
              .send({ inc_votes: 10 })
              .expect(400);
          });
          it('PATCH status:400 for non-numeric inc_votes', () => {
            return request
              .patch('/api/articles/1')
              .send({ inc_votes: 'two' })
              .expect(400);
          });
          it('PATCH status:200 defaults to 0 for missing inc_votes', () => {
            return request
              .patch('/api/articles/1')
              .send({})
              .expect(200);
          });
          it('DELETE status:404 for non-existent article_id', () => {
            return request.delete('/api/articles/100').expect(404);
          });
          it('DELETE status:400 for non-numeric article_id', () => {
            return request.delete('/api/articles/first').expect(400);
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
            it('GET status:200 returns 10 comments by default', () => {
              return request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(10);
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
                    'article_id',
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
            it('GET status:200 returns number of comments specified by limit query', () => {
              return request
                .get('/api/articles/1/comments?limit=5')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(5);
                });
            });
            it('GET status:200 truncates limit query', () => {
              return request
                .get('/api/articles/1/comments?limit=5.6')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(5);
                });
            });
            it('GET status:200 returns page specified', () => {
              return request
                .get('/api/articles/1/comments?p=2')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[0].comment_id).to.equal(12);
                });
            });
            it('GET status:200 truncates page query', () => {
              return request
                .get('/api/articles/1/comments?p=2.3')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[0].comment_id).to.equal(12);
                });
            });
            it('GET status:200 returns empty array if page is beyond maximum comments', () => {
              return request
                .get('/api/articles/1/comments?p=100')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(0);
                });
            });
          });
          describe('ERRORS', () => {
            it('ALL status:405 for invalid methods', () => {
              const invalid = ['put', 'delete', 'trace', 'options', 'patch'];
              return Promise.all(
                invalid.map((method) => {
                  return request[method]('/api/articles/1/comments').expect(405);
                }),
              );
            });
            it('GET status:404 for invalid path', () => {
              return request.get('/api/articles/3/comments/invalid').expect(404);
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
            it('GET status:200 defaults to 10 for invalid limit query', () => {
              return request
                .get('/api/articles/1/comments?limit=invalid')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(10);
                });
            });
            it('GET status:200 defaults to 10 for negative limit query', () => {
              return request
                .get('/api/articles/1/comments?limit=-3')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.lengthOf(10);
                });
            });
            it('GET status:200 defaults to 1 for invalid page query', () => {
              return request
                .get('/api/articles/1/comments?p=invalid')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[0].comment_id).to.equal(2);
                });
            });
            it('GET status:200 defaults to 1 for negative page query', () => {
              return request
                .get('/api/articles/1/comments?p=-2')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[0].comment_id).to.equal(2);
                });
            });
            it('GET status:404 for non-existent article_id', () => {
              return request.get('/api/articles/100/comments').expect(404);
            });
            it('GET status:400 for non-numeric article_id', () => {
              return request.get('/api/articles/first/comments').expect(400);
            });
            it('POST status:404 for non-existent article_id', () => {
              return request
                .post('/api/articles/100/comments')
                .send({ username: 'icellusedkars', body: 'lorem' })
                .expect(404);
            });
            it('POST status:400 for non-numeric article_id', () => {
              return request
                .post('/api/articles/first/comments')
                .send({ username: 'icellusedkars', body: 'lorem' })
                .expect(400);
            });
            it('POST status:422 for non-existent username', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'geoff', body: 'lorem' })
                .expect(422);
            });
            it('POST status:400 for empty body', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'icellusedkars', body: '' })
                .expect(400);
            });
            it('POST status:400 for body containing too many keys', () => {
              return request
                .post('/api/articles/1/comments')
                .send({ username: 'icellusedkars', body: 'included', length: 20 })
                .expect(400);
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
          it('DELETE status:204 removes a comment', () => {
            return request
              .delete('/api/comments/1')
              .expect(204)
              .then(() => {
                return request
                  .patch('/api/comments/1')
                  .send({ inc_votes: 1 })
                  .expect(404);
              });
          });
        });
        describe('ERRORS', () => {
          it('GET status:404 for invalid path', () => {
            return request.get('/api/comments/1/invalid').expect(404);
          });
          it('ALL status:405 for invalid methods', () => {
            const invalid = ['get', 'post', 'put', 'options', 'trace'];
            return Promise.all(
              invalid.map((method) => {
                return request[method]('/api/comments/1').expect(405);
              }),
            );
          });
          it('PATCH status:404 for non-existent comment_id', () => {
            return request
              .patch('/api/comments/100')
              .send({ inc_votes: 1 })
              .expect(404);
          });
          it('PATCH status:400 for non-numeric comment_id', () => {
            return request
              .patch('/api/comments/first')
              .send({ inc_votes: 1 })
              .expect(400);
          });
          it('PATCH status:400 for non-numeric inc_votes', () => {
            return request
              .patch('/api/comments/1')
              .send({ inc_votes: 'apple' })
              .expect(400);
          });
          it('PATCH status:200 defaults to 0 for missing inc_votes', () => {
            return request
              .patch('/api/comments/1')
              .send({})
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(16);
              });
          });
          it('DELETE status:404 for non-existent comment_id', () => {
            return request.delete('/api/comments/100').expect(404);
          });
          it('DELETE status:400 for non-numeric comment_id', () => {
            return request.delete('/api/comments/first').expect(400);
          });
        });
      });
    });
    describe('/users', () => {
      describe('DEFAULT BEHAVIOUR', () => {
        it('GET status:200 returns array of user objects', () => {
          return request
            .get('/api/users')
            .expect(200)
            .then(({ body }) => {
              body.users.forEach((user) => {
                expect(user).to.contain.keys('username', 'avatar_url', 'name');
              });
            });
        });
        it('POST status:201 adds user and returns added user', () => {
          return request
            .post('/api/users')
            .send({ username: 'geoff', name: 'andy', avatar_url: 'http://www.avatars.com/1.jpg' })
            .expect(201)
            .then(({ body }) => {
              expect(body.user).to.contain.keys('name', 'username', 'avatar_url');
            });
        });
      });
      describe('ERRORS', () => {
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/users/icellusedkars').expect(405);
            }),
          );
        });
        it('POST status:400 for missing username key', () => {
          return request
            .post('/api/users')
            .send({ name: 'andy', avatar_url: 'http://www.avatars.com/1.jpg' })
            .expect(400);
        });
        it('POST status:400 for missing name key', () => {
          return request
            .post('/api/users')
            .send({ username: 'geoff', avatar_url: 'http://www.avatars.com/1.jpg' })
            .expect(400);
        });
        it('POST status:422 for username already in use', () => {
          return request.post('/api/users')
            .send({ username: 'icellusedkars', name: 'andy', avatar_url: 'http://www.avatars.com/1.jpg' })
            .expect(422);
        });
      });
      describe('/:username', () => {
        describe('DEFAULT BEHAVIOUR', () => {
          it('GET status:200 returns correct user object', () => {
            return request
              .get('/api/users/icellusedkars')
              .expect(200)
              .then(({ body }) => {
                expect(body.user).to.contain.keys('username', 'avatar_url', 'name');
                expect(body.user.name).to.equal('sam');
              });
          });
        });
        describe('ERRORS', () => {
          it('GET status:404 for invalid path', () => {
            return request.get('/api/users/icellusedkars/invalid').expect(404);
          });
          it('ALL status:405 for invalid methods', () => {
            const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
            return Promise.all(
              invalid.map((method) => {
                return request[method]('/api/users/icellusedkars').expect(405);
              }),
            );
          });
          it('GET status:404 for non-existent username', () => {
            return request.get('/api/users/adam').expect(404);
          });
        });
      });
    });
  });
  describe('/*', () => {
    describe('ERRORS', () => {
      it('GET status:404 for invalid path', () => {
        return request.get('/invalid').expect(404);
      });
    });
  });
});
