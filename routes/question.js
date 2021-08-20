const express = require("express")
const router = express.Router()
const Question = require("../schema/questionSchema")
const DailyQuestion = require("../schema/dailyQuestionSchema")
const QuestionAmount = require("../schema/questionAmountSchema")
const UserSchema = require("../schema/userSchema")
const axios = require("axios")
const playwright = require("./playwright")
const { chromium } = require("playwright-chromium")
require("dotenv/config")

router.post("/:question_id/solution", async (req, res) => {
  const { question_id } = req.params
  const { question_answers } = req.body
  try {
    const answerExists = await Question.find({
      question_id: question_id,
      "question_answers.user_id": question_answers.user_id,
    })
    if (answerExists.length) {
      res.json({ message: "user already answered" })
      return
    } else {
      question_answers.question_date = Date.now()
      const query = {
        question_id: question_id,
      }
      const update = {
        $push: { question_answers: question_answers },
        $set: {
          question_last_submit_date: Date.now(),
          question_is_answered: true,
        },
      }
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
      const result = await Question.findOneAndUpdate(query, update, options)
      if (result) {
        res.json({ message: "success" })
      }
    }
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" })
  }
})

router.get("/:question_id", async (req, res) => {
  try {
    const { question_id } = req.params

    const question = await Question.findOne({
      question_id: question_id,
    }).populate({
      path: "question_answers.user_id",
      select: "user_name",
    })
    if (question) {
      res.json(question)
    } else {
      res.json({ message: "No such question id" })
    }
  } catch (error) {
    res.json({ message: "Fuck, getQuestionById出bug了" })
  }
})

router.get("/", async (req, res) => {
  try {
    const questionFilter =
      req.query.question_is_answered === "true"
        ? {
            question_is_answered: true,
          }
        : {}

    const [questions, daily] = await Promise.all([
      Question.find(questionFilter, [
        "question_id",
        "question_title",
        "question_difficulty",
        "question_tags",
        "question_last_submit_date",
        "question_answers.user_id",
      ])
        .populate({
          path: "question_answers.user_id",
          select: "user_name",
        })
        .sort({ question_last_submit_date: "descending" }),
      DailyQuestion.findOne().sort({ _id: -1 }).populate({
        path: "question_id",
      }),
    ])

    if (daily && questions) {
      res.json({ daily, questions })
    } else {
      res.sendStatus(500)
    }
  } catch (error) {
    res.json({ message: "Fuck, all-questions出bug了" })
  }
})

router.post("/daily-solution", async (req, res) => {
  const { question_id, question_answers } = req.body
  try {
    question_answers.question_date = Date.now()
    const query = { question_id: question_id }
    const update = {
      $push: { question_answers: question_answers },
      $set: {
        question_last_submit_date: Date.now(),
        question_is_answered: true,
      },
    }
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
    const result = await Question.findOneAndUpdate(query, update, options)
    if (result) {
      res.json({ message: "success" })
    }
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" })
  }
})

router.get("/refersh-question-list", async (req, res) => {
  try {
    const { data } = await axios.get("https://leetcode.com/api/problems/algorithms/")

    if (data) {
      const broswer = await chromium.launch({ chromiumSandbox: false })
      const context = await broswer.newContext()
      const page = await context.newPage()
      const questions = data.stat_status_pairs
      const newNumTotal = data.num_total
      const { question_amount } = await QuestionAmount.findOne({ id: 1 })
      for (var i = 0; i < 5; i++) {
        if (questions[i].paid_only) {
          continue
        }
        const question_id = questions[i].stat.frontend_question_id
        const exists = await Question.findOne({ question_id: question_id })
        if (exists) {
          continue
        }
        const question_title = questions[i].stat.question__title
        const question_url =
          "https://leetcode.com/problems/" + questions[i].stat.question__title_slug + "/"
        const { question_difficulty, question_tags, question_content } =
          await playwright.getQuestionDetail(page, question_url)

        const question = new Question({
          question_id: question_id,
          question_url: question_url,
          question_title: question_title,
          question_difficulty: question_difficulty,
          question_tags: question_tags,
          question_content: question_content,
        })
        const saved = await question.save()
        console.log(question_url, " added")
      }
      await page.close()
      await context.close()
      await broswer.close()
      res.json({ message: "success" })
    } else {
      res.json({ message: "fail" })
    }
  } catch (error) {
    res.json({ message: "error" })
  }
})

router.get("/fetch-daily", async (req, res) => {
  try {
    const broswer = await chromium.launch({ chromiumSandbox: false })
    const context = await broswer.newContext()
    const page = await context.newPage()
    const question_id = await playwright.getDailyQuestionUrl(page)
    const { _id } = await Question.findOne({
      question_id: question_id,
    })
    const dailyQuestion = new DailyQuestion({
      question_id: _id,
      data: Date.now(),
    })
    const savedDailyQuestion = await dailyQuestion.save()
    await page.close()
    await context.close()
    await broswer.close()
    res.json({ message: "success" })
  } catch (error) {
    res.json({ message: "Fuck, fetchDaily出bug了" })
  }
})
module.exports = router
