const mongoose = require("mongoose");

const dailyQuestionSchema = mongoose.Schema({
  question_id: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("dailyQuestion", dailyQuestionSchema);
