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
});

module.exports = mongoose.model("User", userSchema);
