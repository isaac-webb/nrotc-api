/**
 * Import testing dependencies.
 */
const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const debug = require('debug')('nrotc-api:user-test');
const app = require('../app');
const User = require('../models/user.model');

/**
 * Connect to MongoDB.
 */
var db;
before(async function() {
  // Extract database configuration and connect.
  const host = process.env.DB_HOST || 'nrotc_api_db';
  const port = process.env.DB_PORT || 27017;
  const name = process.env.DB_NAME || 'nrotc_api_test';
  await mongoose.connect(`mongodb://${host}:${port}/${name}`, { useNewUrlParser: true });
  debug('Connected to testing database');
});

/**
 * Test the Users API routes and model.
 */
describe('Users API', function() {

  /**
   * Test the user creation admin route.
   */
  describe('POST /api/admin/users', function () {
    // Clean the database before each test.
    beforeEach(function(done) {
      User.remove({}).then(() => {
        done();
      });
    });

    /**
     * Test with username only.
     */
    it('should create a user, defaulting to no-admin', async function() {
      let username = 'a';
      let response = await request(app).post('/api/admin/users').send({
        username: username
      }).expect(201);
      expect(response.body).to.have.property('_id');
      expect(response.body.username).to.equal(username);
      expect(response.body.isAdmin).to.be.false;
    });

    /**
     * Test with username and isAdmin.
     */
    it('should create an admin user', async function() {
      let username = 'b';
      let response = await request(app).post('/api/admin/users').send({
        username: username,
        isAdmin: true
      }).expect(201);
      expect(response.body).to.have.property('_id');
      expect(response.body.username).to.equal(username);
      expect(response.body.isAdmin).to.be.true;
    });

    /**
     * Test without any parameters.
     */
    it('should require a username', async function() {
      let response = await request(app).post('/api/admin/users').send({}).expect(400);
      expect(response.body).to.have.property('username');
      expect(response.body.username).to.have.property('path');
      expect(response.body.username.path).to.equal('username');
      expect(response.body.username).to.have.property('message');
    });

    /**
     * Test with a duplicate username.
     */
    it('should reject duplicates', async function() {
      let username = 'c';
      let _ = await request(app).post('/api/admin/users').send({
        username: username
      }).expect(201);
      let response = await request(app).post('/api/admin/users').send({
        username: username
      }).expect(400);
      expect(response.text).to.be.a.string;
      expect(response.text).to.equal('Duplicate username detected');
    });
  });
});