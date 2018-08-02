/**
 * Import controller dependencies.
 */
const ValidationError = require('mongoose').Error.ValidationError;
const debug = require('debug')('nrotc-api:user-controller');
const User = require('../models/user.model');

/**
 * Returns all users present in the database.
 *
 * @param {Request} req - The client request object.
 * @param {Response} res - The server response object.
 */
async function getUsers(req, res) {
  try {
    const users = await User.find({}).lean().select('-_id -__v').exec();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

/**
 * Returns a user in the database, specified by the URL parameter.
 *
 * @param {Request} req - The client request object. Should contain a URL
 * parameter named username to query the database with.
 * @param {Response} res - The server response object.
 */
async function getUserWithName(req, res) {
  try {
    const user = await User.findOne({
      username: req.params.username
    }).lean().select('-_id -__v').exec();
    if (user) {
      res.status(200).send(user);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

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
  const user = new User(params);
  try {
    let dbUser = await user.save();
    debug(`Created user ${dbUser.username}`);

    // Remove internal values.
    dbUser = dbUser.toObject({
      versionKey: false
    });
    delete dbUser._id;

    // Return the result
    res.status(201).set('Location', `/users/${dbUser.username}`).send(dbUser);
  } catch(err) {
    // Log the error.
    debug(`Error while creating user ${params.username}`);
    debug(err);

    // Determine the type of error and return it.
    if (err instanceof ValidationError) {
      res.status(400).send(err.errors);
    } else if (err.message.indexOf('duplicate key error') !== -1) {
      res.status(409).send('Duplicate username detected');
    } else {
      res.status(500).send(err.message);
    }
  }
}

/**
 * Deletes a user in the database.
 *
 * @param {Request} req - The client request object. Should contain a URL
 * parameter named username to query the database with.
 * @param {Response} res - The server response object.
 */
async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({
      username: req.params.username
    }).lean().select('-_id -__v').exec();
    if (user) {
      debug(`Deleted user ${user.username}`);
      res.status(200).send(user);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    debug(`Error while deleting user ${req.params.username}`);
    res.status(500).send(err.message);
  }
}

/**
 * Patches a user in the database.
 *
 * @param {Request} req - The client request object. Should contain a URL
 * parameter named username to query the database with. Should also contain
 * a body with changes to make to the user.
 * @param {Response} res - The server response object.
 */
async function patchUser(req, res) {
  try {
    let user = await User.findOne({ username: req.params.username }).exec();
    if (user) {
      // Change the user and save the results.
      user.set(req.body);
      let dbUser = await user.save();
      debug(`Modified user ${dbUser.username}`);

      // Remove internal values.
      dbUser = dbUser.toObject({
        versionKey: false
      });
      delete dbUser._id;

      // Return the result
      res.status(200).send(dbUser);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

/**
 * Export the defined functions.
 */
module.exports = {
  getUsers: getUsers,
  getUserWithName: getUserWithName,
  createUser: createUser,
  deleteUser: deleteUser,
  patchUser: patchUser
};