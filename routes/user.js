const express = require("express");
const router = express.Router();
const User = require("../schema/userSchema");

router.post("/", async (req, res) => {
  const { email, name } = req.body.params;

  const user = await User.findOne({ user_email: email });
  if (user) {
    res.json({ user_id: user._id });
  } else {
    const saveUser = new User({
      user_email: email,
      user_name: name,
    });
    const result = await saveUser.save();
    if (result) {
      res.json({ user_id: result._id });
    } else {
      res.json({ message: "fail" });
    }
  }
});

module.exports = router;
