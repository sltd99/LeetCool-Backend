const Question = require("../schema/questionSchema");
const QuestionAmount = require("../schema/questionAmountSchema");
const axios = require("axios");
const playwright = require("./playwright");
const { chromium } = require("playwright-chromium");

async function refreshQuestionList() {
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
      for (var i = 0; i < 5; i++) {
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
        console.log(question_url, " added");
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
}
module.exports.refreshQuestionList = refreshQuestionList;
