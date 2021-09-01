const Question = require("../../schema/questionSchema");
const CommonVariable = require("../../schema/commonVariableSchema");
const axios = require("axios");
const playwright = require("./playwright");
const { chromium } = require("playwright-chromium");

async function refreshQuestionList() {
  try {
    //"https://leetcode.com/api/problems/algorithms/"
    const leetcode_api = process.env.LEETCODEAPI;
    const data = await getDataFromLeetcode(leetcode_api);
    if (data) {
      const questions = data.stat_status_pairs; //all questions from getDataFromLeetcode();
      const broswer = await chromium.launch({ chromiumSandbox: false });
      const context = await broswer.newContext();
      const page = await context.newPage();
      // const numOfNewQuestions = await updateQuestionAmount(data.num_total);
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].paid_only) {
          continue;
        }
        const question_id = questions[i].stat.frontend_question_id;
        const exists = await Question.findOne({ question_id: question_id });
        if (exists) {
          console.log(question_id, " exits");
          continue;
        }
        try {
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
          await question.save();
          console.log(question_url, " added");
        } catch (error) {
          console.log(question_url, " fails");
        }
      }
      await page.close();
      await context.close();
      await broswer.close();
      console.log("success");
    } else {
      console.log("Leetcode_api fails");
    }
  } catch (error) {
    console.log("refersh_question_list DB fails");
  }
}

/**
 * retrive data from giving url
 * @param {string} url - The leetcode_api url
 * @return {json | null} - return data if success, else null
 */
async function getDataFromLeetcode(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * save new question amount to db
 * @param {string} newTotalQuestionAmount - new total question amount from leetcode_api
 * @return {number} - return number of questions we need to parese if success, else 0
 */
async function updateQuestionAmount(newTotalQuestionAmount) {
  try {
    const { value } = await CommonVariable.findOne({ id: 1 });
    await CommonVariable.findOneAndUpdate(
      { id: 1 },
      { value: newTotalQuestionAmount }
    );
    return newTotalQuestionAmount - value;
  } catch (error) {
    return 0;
  }
}

module.exports.refreshQuestionList = refreshQuestionList;
