const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_email: {
    type: String,
    unique: true,
  },
  user_name: {
    type: String,
  },
  total_question_amount: {
    type: Number,
    default: 0,
  },
  user_image_url: {
    type: String,
  },
  last_login: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
