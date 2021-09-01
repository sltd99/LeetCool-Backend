const Question = require("../../schema/questionSchema");
const DailyQuestion = require("../../schema/dailyQuestionSchema");
const playwright = require("./playwright");
const { chromium } = require("playwright-chromium");

async function fetchDaily() {
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
    await dailyQuestion.save();
    await page.close();
    await context.close();
    await broswer.close();
    return question_id;
  } catch (error) {
    return error;
  }
}
module.exports.fetchDaily = fetchDaily;
