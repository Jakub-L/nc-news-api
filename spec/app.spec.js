process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const supertest = require('supertest');

const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('NC-NEWS-API', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('/api', () => {
    describe('/topics', () => {
      describe('EXPECTED BEHAVIOUR', () => {
        it('Returns array of all topics', () => {
          expect(true).to.equal(false);
        });
      });
      describe('ERRORS', () => {});
    });
    describe('/*', () => {
      it('GET status:404 for invalid path', () => request
        .get('/api/invalid')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Route Not Found');
        }));
    });
  });
  describe('/*', () => {
    it('GET status:404 for invalid path', () => request
      .get('/invalid')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.equal('Route Not Found');
      }));
  });
});
