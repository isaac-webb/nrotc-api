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
   * Test the user inspection admin route.
   */
  describe('GET /api/admin/users', function() {
    // Reset the database contents before each test.
    beforeEach(async function() {
      await User.remove({}).exec();
      const a = new User({
        username: 'a',
        isAdmin: false
      });
      const b = new User({
        username: 'b',
        isAdmin: true
      });
      await Promise.all([a.save(), b.save()]);
    });

    /**
     * Test getting all users.
     */
    it('should return the testing users', async function() {
      const res = await request(app).get('/api/admin/users').expect(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.have.property('username');
      expect(res.body[1]).to.have.property('isAdmin');
      expect(res.body[0]).to.not.have.property('_id');
      expect(res.body[1]).to.not.have.property('__v');
    });

    /**
     * Test getting a specific user.
     */
    it('should return specific users', async function() {
      const res = await request(app).get('/api/admin/users/a').expect(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('username');
      expect(res.body.username).to.equal('a');
      expect(res.body).to.have.property('isAdmin');
      expect(res.body.isAdmin).to.be.false;
      expect(res.body).to.not.have.property('_id');
      expect(res.body).to.not.have.property('__v');
    });

    /**
     * Test a nonexistent user.
     */
    it('should return 404 for nonexistent user', async function() {
      await request(app).get('/api/admin/users/d').expect(404);
    });
  });

  /**
   * Test the user creation admin route.
   */
  describe('POST /api/admin/users', function() {
    // Clean the database before each test.
    beforeEach(async function() {
      await User.remove({}).exec();
    });

    /**
     * Test with username only.
     */
    it('should create a user, defaulting to no-admin', async function() {
      const username = 'a';
      const response = await request(app).post('/api/admin/users').send({
        username: username
      }).expect(201).expect('Location', `/users/${username}`);
      expect(response.body).to.not.have.property('_id');
      expect(response.body).to.not.have.property('__v');
      expect(response.body).to.have.property('username');
      expect(response.body.username).to.equal(username);
      expect(response.body).to.have.property('isAdmin');
      expect(response.body.isAdmin).to.be.false;
    });

    /**
     * Test with username and isAdmin.
     */
    it('should create an admin user', async function() {
      const username = 'b';
      const response = await request(app).post('/api/admin/users').send({
        username: username,
        isAdmin: true
      }).expect(201).expect('Location', `/users/${username}`);
      expect(response.body).to.not.have.property('_id');
      expect(response.body).to.not.have.property('__v');
      expect(response.body).to.have.property('username');
      expect(response.body.username).to.equal(username);
      expect(response.body).to.have.property('isAdmin');
      expect(response.body.isAdmin).to.be.true;
    });

    /**
     * Test without any parameters.
     */
    it('should require a username', async function() {
      const response = await request(app).post('/api/admin/users').send({}).expect(400);
      expect(response.body).to.have.property('username');
      expect(response.body.username).to.have.property('path');
      expect(response.body.username.path).to.equal('username');
      expect(response.body.username).to.have.property('message');
    });

    /**
     * Test with a duplicate username.
     */
    it('should reject duplicates', async function() {
      const username = 'c';
      await request(app).post('/api/admin/users').send({
        username: username
      }).expect(201);
      const response = await request(app).post('/api/admin/users').send({
        username: username
      }).expect(409);
      expect(response.text).to.be.a.string;
      expect(response.text).to.equal('Duplicate username detected');
    });
  });

  /**
   * Test the user deletion admin route.
   */
  describe('DELETE /api/admin/users', function() {
    // Reset the database contents before each test.
    beforeEach(async function() {
      await User.remove({}).exec();
      const a = new User({
        username: 'a',
        isAdmin: false
      });
      await a.save();
    });

    /**
     * Test deleting a user.
     */
    it('should delete a user', async function() {
      const res = await request(app).delete('/api/admin/users/a').expect(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.not.have.property('_id');
      expect(res.body).to.not.have.property('__v');
      expect(res.body).to.have.property('username');
      expect(res.body.username).to.equal('a');
      expect(res.body).to.have.property('isAdmin');
      expect(res.body.isAdmin).to.be.false;
    });

    /**
     * Test deleting a nonexistent user.
     */
    it('should return 404 for a nonexistent user', async function() {
      await request(app).delete('/api/admin/users/b').expect(404);
    });

    /**
     * Test an empty URL parameter.
     */
    it('should require a user to delete', async function() {
      await request(app).delete('/api/admin/users/').expect(404);
    });
  });

  /**
   * Test the user patching admin route.
   */
  describe('PATCH /api/admin/users', function() {
    // Reset the database contents before each test.
    beforeEach(async function() {
      await User.remove({}).exec();
      const a = new User({
        username: 'a',
        isAdmin: false
      });
      await a.save();
    });

    /**
     * Test patching a user.
     */
    it('should patch a user', async function() {
      const res = await request(app).patch('/api/admin/users/a').send({
        isAdmin: true
      }).expect(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.not.have.property('_id');
      expect(res.body).to.not.have.property('__v');
      expect(res.body).to.have.property('username');
      expect(res.body.username).to.equal('a');
      expect(res.body).to.have.property('isAdmin');
      expect(res.body.isAdmin).to.be.true;
    });

    /**
     * Test patching a nonexistent user.
     */
    it('should return 404 for a nonexistent user', async function() {
      await request(app).patch('/api/admin/users/b').expect(404);
    });
  });
});