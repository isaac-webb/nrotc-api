/**
 * Import controller dependencies.
 */
const ValidationError = require('mongoose').Error.ValidationError;
const debug = require('debug')('nrotc-api:user-controller');
const User = require('../models/user.model');

/**
 * Creates a new user in the database. Responds with the created user if
 * successful, and the error message otherwise.
 *
 * @param {Request} req - The client request object. Should contain, at a
 * minimum, a `username` parameter in the body. Can also contain an `isAdmin`
 * boolean indicating whether or not the created user should be an admin.
 * @param {Response} res - The server response object.
 */
async function createUser(req, res) {
  // Extract relevant parameters from the body.
  let params = {};
  if (req.body.username) params.username = req.body.username;
  if (req.body.isAdmin) params.isAdmin = req.body.isAdmin;
  debug(`Creating user ${JSON.stringify(params)}`);

  // Attempt to create the user and deal with the result.
  let user = new User(params);
  try {
    let dbUser = await user.save();
    debug(`Created user ${dbUser.username}`);
    res.status(201).send(user);
  } catch(err) {
    // Log the error.
    debug(`Error while creating user ${params.username}`);
    debug(err);

    // Determine the type of error and return it.
    if (err instanceof ValidationError) {
      res.status(400).send(err.errors);
    } else if (err.message.indexOf('duplicate key error') !== -1) {
      res.status(400).send('Duplicate username detected');
    } else {
      res.status(500).send(err.message);
    }
  }
}

/**
 * Export the defined functions.
 */
module.exports = {
  createUser: createUser
};