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
            .then(({ body }) => {
              expect(body.msg).to.equal('Route Not Found');
            });
        });
        it('ALL status:405 for invalid methods', () => {
          const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
          return Promise.all(
            invalid.map((method) => {
              return request[method]('/api/topics')
                .expect(405)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Method Not Allowed');
                });
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
                .then(({ body }) => {
                  expect(body.msg).to.equal('Method Not Allowed');
                });
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
        });
        describe('ERRORS', () => {
          it('ALL status:405 for invalid methods', () => {
            const invalid = ['post', 'put', 'delete', 'options', 'trace', 'patch'];
            return Promise.all(
              invalid.map((method) => {
                return request[method]('/api/articles/1')
                  .expect(405)
                  .then(({ body }) => {
                    expect(body.msg).to.equal('Method Not Allowed');
                  });
              }),
            );
          });
          it('GET status:404 for invalid path', () => {
            return request
              .get('/api/articles/3/invalid')
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal('Route Not Found');
              });
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
            .then(({ body }) => {
              expect(body.msg).to.equal('Route Not Found');
            });
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
          .then(({ body }) => {
            expect(body.msg).to.equal('Route Not Found');
          });
      });
    });
  });
});
