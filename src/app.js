/**
 * Import application dependencies.
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('nrotc-api:app');
debug.write = function(input) {
  this(input);
};

/**
 * Create the express application.
 */
const app = express();

/**
 * Import required routers.
 */
const users = require('./routes/users.router');
const routers = [users];

/**
 * Configure logger and universal middleware.
 */
app.use(logger('dev', {
  stream: debug
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * TODO: Require all requests to admin routes to be authenticated by an admin
 */

/**
 * Assign each router to their respective route.
 */
routers.forEach((router) => {
  if (router.publicRoute) {
    debug(`/api/${router.name} using ${router.name} router`);
    app.use(`/api/${router.name}`, router.publicRoute);
  }
  if (router.adminRoute) {
    debug(`/api/admin/${router.name} using ${router.name} admin router`);
    app.use(`/api/admin/${router.name}`, router.adminRoute);
  }
});

/**
 * Export the application for testing and execution.
 */
module.exports = app;
