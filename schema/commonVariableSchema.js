const mongoose = require("mongoose");

const commonVariableSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
    default: 0,
  },
  value: {},
});

module.exports = mongoose.model("CommonVariable", commonVariableSchema);
