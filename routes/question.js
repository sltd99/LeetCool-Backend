const express = require("express");
const router = express.Router();
const Question = require("../schema/questionSchema");
const DailyQuestion = require("../schema/dailyQuestionSchema");
const User = require("../schema/userSchema");

router.post("/:question_id/solution", async (req, res) => {
  const { question_id } = req.params;
  const { question_answers } = req.body;
  question_answers.question_date = Date.now();
  try {
    const answerExists = await Question.find({
      question_id: question_id,
      "question_answers.user": question_answers.user,
    });
    if (answerExists.length) {
      await Question.updateOne(
        {
          question_id: question_id,
          "question_answers.user": question_answers.user,
        },
        {
          $set: {
            "question_answers.$.question_answer":
              question_answers.question_answer,
            question_last_submit_date: Date.now(),
          },
        }
      );
      await saveToDaily(answerExists[0]._id, question_answers.user);
      res.json({ message: "success" });
    } else {
      const query = {
        question_id: question_id,
      };
      const update = {
        $push: { question_answers: question_answers },
        $set: {
          question_last_submit_date: Date.now(),
          question_is_answered: true,
        },
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };
      const result = await Question.findOneAndUpdate(query, update, options);
      await saveToDaily(result._id, question_answers.user);
      const user = await User.findById(question_answers.user);
      user.total_question_amount = user.total_question_amount + 1;
      await user.save();
      if (result) {
        res.json({ message: "success" });
      }
    }
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" });
  }
});

async function saveToDaily(question_id, user_id) {
  try {
    const todayDaily = await DailyQuestion.findOne().sort({ _id: -1 });
    if (
      todayDaily.question.toString() !== question_id.toString() ||
      todayDaily.users.includes(user_id)
    ) {
      console.log("not today's quesiton || user already in the daily list");
      return false;
    }
    const query = {
      _id: todayDaily._id,
    };
    const update = {
      $push: { users: user_id },
    };
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };
    const teemp = await DailyQuestion.updateOne(query, update, options);
    return true;
  } catch (error) {
    return false;
  }
}

router.post("/:question_id", async (req, res) => {
  try {
    const { question_id } = req.params;
    const { user_id } = req.body;

    const question = await Question.findOne({
      question_id: question_id,
    }).populate({
      path: "question_answers.user",
      select: "user_name",
    });
    if (question) {
      if (user_id && question.question_answers.length > 0) {
        const answer = question.question_answers.filter(
          (answer) => answer.user._id == user_id
        );
        const result = {
          question_tags: question.question_tags,
          question_id: question.question_id,
          question_url: question.question_url,
          question_title: question.question_title,
          question_difficulty: question.question_difficulty,
          question_content: question.question_content,
          question_answer: answer.length != 0 ? answer[0].question_answer : "",
        };
        console.log(result);
        res.json(result);
      } else {
        res.json(question);
      }
    } else {
      res.json({ message: "No such question id" });
    }
  } catch (error) {
    res.json({ message: "Fuck, getQuestionById出bug了" });
  }
});

router.get("/", async (req, res) => {
  try {
    const questionFilter =
      req.query.question_is_answered === "true"
        ? {
            question_is_answered: true,
          }
        : {};

    const [questions, daily] = await Promise.all([
      Question.find(questionFilter, [
        "question_id",
        "question_title",
        "question_difficulty",
        "question_tags",
        "question_last_submit_date",
        "question_answers.user",
      ])
        .populate({
          path: "question_answers.user",
          select: "user_name user_image_url",
        })
        .sort({ question_last_submit_date: "descending" }),
      DailyQuestion.findOne()
        .sort({ _id: -1 })
        .populate({
          path: "question",
          select:
            "question_id question_title question_difficulty question_tags question_last_submit_date",
        })
        .populate({
          path: "users",
          select: "user_name user_image_url",
        }),
    ]);

    if (daily && questions) {
      res.json({ daily, questions });
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    res.json({ message: "Fuck, all-questions出bug了" });
  }
});

module.exports = router;
