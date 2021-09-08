const express = require("express");
const router = express.Router();
const User = require("../schema/userSchema");
const Question = require("../schema/questionSchema");

router.post("/", async (req, res) => {
  const { email, name, image_url } = req.body;

  const user = await User.findOne({ user_email: email });
  if (user) {
    await User.findOneAndUpdate(
      { user_email: email },
      {
        $set: {
          user_email: email,
          user_name: name,
          user_image_url: image_url,
          last_login: Date.now(),
        },
      }
    );
    res.json({ user_id: user._id });
  } else {
    const saveUser = new User({
      user_email: email,
      user_name: name,
      user_image_url: image_url,
      last_login: null,
    });
    const result = await saveUser.save();
    if (result) {
      res.json({ user_id: result._id });
    } else {
      res.json({ message: "fail" });
    }
  }
});

router.get("/performance", async (req, res) => {
  try {
    const users = await User.find().sort({ total_question_amount: "desc" });
    if (users) {
      res.json(users);
    } else {
      res.json({ message: "fails" });
    }
  } catch (error) {
    res.json({ message: "fails" });
  }
});

/*
  const today = moment().startOf("day");
{
    question_is_answered: true,
    question_last_submit_date: {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    },
    "question_answers.question_date": {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    },
  }

  .populate({
    path: "question_answers.user",
    select: ["user_name", "user_email"],
  });
*/
router.get("/one/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(user_id);
    const questionQuery = {
      question_is_answered: true,
      "question_answers.user": user_id,
    };
    const allAnswers = await Question.find(questionQuery, [
      "question_id",
      "question_title",
      "question_answers.user",
      "question_answers.question_date",
    ]).sort({ "question_answers.question_date": "desc" });
    let userAnswers = [];
    allAnswers.map((answer) => {
      answer.question_answers.map((user) => {
        if (user.user == user_id) {
          const temp = {
            question_id: answer.question_id,
            question_title: answer.question_title,
            question_date: user.question_date,
          };
          userAnswers.push(temp);
        }
      });
    });
    res.json(userAnswers);
  } catch (error) {
    res.json({ message: "fail" });
  }
});

module.exports = router;
