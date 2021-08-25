const mongoose = require("mongoose");

const dailyQuestionSchema = mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("DailyQuestion", dailyQuestionSchema);
