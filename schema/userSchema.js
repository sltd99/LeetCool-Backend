const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  user_email: {
    type: String,
    unique: true,
  },

  user_name: {
    type: String,
  },
})

module.exports = mongoose.model("User", userSchema)
