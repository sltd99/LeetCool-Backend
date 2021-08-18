const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_email: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("User", userSchema);
