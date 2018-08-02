/**
 * Import dependencies.
 */
const Router = require('express').Router;
const controller = require('../controllers/user.controller');

/**
 * Initialize the routers.
 */
const userRouter = Router();
const adminRouter = Router();

/**
 * Configure the routes to use controller methods.
 */
adminRouter.get('/', controller.getUsers);
adminRouter.get('/:username', controller.getUserWithName);
adminRouter.post('/', controller.createUser);
adminRouter.patch('/:username', controller.patchUser);
adminRouter.delete('/:username', controller.deleteUser);

/**
 * Export the routers, also providing a name to serve them under.
 */
module.exports = {
  name: 'users',
  publicRoute: userRouter,
  adminRoute: adminRouter
};