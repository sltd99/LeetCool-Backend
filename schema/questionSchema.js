const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  question_id: {
    type: Number,
    required: true,
    unique: true,
  },
  question_url: {
    type: String,
    required: true,
  },
  question_title: {
    type: String,
    required: true,
    unique: true,
  },
  question_difficulty: {
    type: String,
    required: true,
  },
  question_tags: {
    type: Array,
    required: true,
  },
  question_content: {
    type: String,
    required: true,
  },
  question_answers: [
    { answer: String, date: { type: Date, default: Date.now }, user: String },
  ],
  question_is_answered: {
    type: Boolean,
    default: false,
  },
  question_last_submit_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("questions", questionSchema);
