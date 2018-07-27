/**
 * Import the required model
 */
const User = require('../models/user.model');
const debug = require('debug')('nrotc-api:user-controller');

/**
 * Creates a new user in the database. Responds with the created user if
 * successful, and the error message otherwise.
 *
 * @param {Request} req - The client request object. Should contain, at a
 * minimum, a `username` parameter in the body. Can also contain an `isAdmin`
 * boolean indicating whether or not the created user should be an admin.
 * @param {Response} res - The server response object.
 */
function createUser(req, res) {
  // Extract relevant parameters from the body.
  let params = {};
  if (req.body.username) params.username = req.body.username;
  if (req.body.isAdmin) params.isAdmin = req.body.isAdmin;
  debug(`Creating user ${JSON.stringify(params)}`);

  // Attempt to create the user and deal with the result.
  let user = new User(params);
  user.save().then((user) => {
    // Return the successfully created user.
    debug(`Created user ${user.username}`);
    res.status(201).send(user);
  }).catch((err) => {
    // Return the database error.
    debug(`Error while creating user ${params.username}`);
    res.status(400).send(err.message);
  });
}

/**
 * Export the defined functions.
 */
module.exports = {
  createUser: createUser
};