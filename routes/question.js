const express = require("express");
const router = express.Router();
const Question = require("../schema/questionSchema");
const DailyQuestion = require("../schema/dailyQuestionSchema");
const QuestionAmount = require("../schema/questionAmountSchema");
const User = require("../schema/userSchema");
const axios = require("axios");
const playwright = require("./playwright");
const { chromium } = require("playwright-chromium");
require("dotenv/config");

router.post("/:question_id/solution", async (req, res) => {
  const { question_id } = req.params;
  const { question_answers } = req.body;
  try {
    const answerExists = await Question.find({
      question_id: question_id,
      "question_answers.user": question_answers.user,
    });
    saveToDaily(answerExists[0]._id, question_answers.user);
    if (answerExists.length) {
      console.log(answerExists);
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
      res.json({ message: "success" });
    } else {
      question_answers.question_date = Date.now();
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
      if (result) {
        res.json({ message: "success" });
      }
    }
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" });
  }
});

async function saveToDaily(question_id, user_id) {
  const todayDaily = await DailyQuestion.findOne().sort({ _id: -1 });

  if (todayDaily.question === question_id) {
    console.log("not today's qeustion");
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
          select: "user_name",
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
          select: "user_name",
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

router.get("/refersh-question-list", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://leetcode.com/api/problems/algorithms/"
    );

    if (data) {
      const broswer = await chromium.launch({ chromiumSandbox: false });
      const context = await broswer.newContext();
      const page = await context.newPage();
      const questions = data.stat_status_pairs;
      const newNumTotal = data.num_total;
      const { question_amount } = await QuestionAmount.findOne({ id: 1 });
      const savedQuestionAmount = await QuestionAmount.findOneAndUpdate(
        { id: 1 },
        { question_amount: newNumTotal }
      );
      for (var i = 0; i < newNumTotal - question_amount; i++) {
        if (questions[i].paid_only) {
          continue;
        }
        const question_id = questions[i].stat.frontend_question_id;
        const exists = await Question.findOne({ question_id: question_id });
        if (exists) {
          continue;
        }
        const question_title = questions[i].stat.question__title;
        const question_url =
          "https://leetcode.com/problems/" +
          questions[i].stat.question__title_slug +
          "/";
        try {
          const { question_difficulty, question_tags, question_content } =
            await playwright.getQuestionDetail(page, question_url);
          const question = new Question({
            question_id: question_id,
            question_url: question_url,
            question_title: question_title,
            question_difficulty: question_difficulty,
            question_tags: question_tags,
            question_content: question_content,
          });
          const saved = await question.save();
        } catch (error) {
          console.log(question_url, " error");
          continue;
        }
      }

      await page.close();
      await context.close();
      await broswer.close();
      res.json({ message: "success" });
    } else {
      res.json({ message: "fail" });
    }
  } catch (error) {
    res.json({ message: "error" });
  }
});

router.get("/fetch-daily", async (req, res) => {
  try {
    const broswer = await chromium.launch({ chromiumSandbox: false });
    const context = await broswer.newContext();
    const page = await context.newPage();
    const question_id = await playwright.getDailyQuestionUrl(page);
    const { _id, question_answers } = await Question.findOne({
      question_id: question_id,
    });
    let users = [];
    for (var answer of question_answers) {
      users.push(answer.user);
    }

    const dailyQuestion = new DailyQuestion({
      question: _id,
      data: Date.now(),
      users: users,
    });
    const savedDailyQuestion = await dailyQuestion.save();

    await page.close();
    await context.close();
    await broswer.close();
    res.json({ message: "success" });
  } catch (error) {
    res.json({ message: "Fuck, fetchDaily出bug了" });
  }
});
module.exports = router;
