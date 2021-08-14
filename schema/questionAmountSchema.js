const mongoose = require("mongoose");

const questionAmountSchema = mongoose.Schema({
  question_amount: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("questionAmount", questionAmountSchema);
