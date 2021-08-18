const mongoose = require("mongoose");

const dailyQuestionSchema = mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("DailyQuestion", dailyQuestionSchema);
