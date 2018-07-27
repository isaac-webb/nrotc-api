/**
 * Import model dependencies.
 */
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);