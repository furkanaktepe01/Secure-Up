const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    unique: false,
  },

  publicKey: {
    type: Array,
    required: true,
    unique: false,
  }

});

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
