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
        it('GET status:200 sorts comments descendingly by date', () => {
          return request
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.descendingBy('created_at');
            });
        });
      });
      describe('QUERIES', () => {});
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
      });
    });
    describe('/*', () => {
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
  describe('/*', () => {
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
