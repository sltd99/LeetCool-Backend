const { chromium } = require("playwright-chromium");

async function getQuestionDetail(page, questionUrl) {
  try {
    //Let page goto leetcode problem
    //In future, we only need to change the css selector
    await page.goto(questionUrl);

    const question_title = await page.textContent(
      `div[data-key*=description-content] > div div[data-cy=question-title]`
    );

    const question_difficulty = await page.textContent(
      `div[data-key*=description-content] > div div[diff]`
    );

    const question_content = await page.innerHTML(
      `div[data-key*=description-content] > div div[class*=question-content]`
    );

    const tagPromises = await page.$$(`div > a[class*=topic-tag]`);
    let question_tags = [];
    for (const tagPromise of tagPromises) {
      question_tags.push(await tagPromise.innerText());
    }
    return {
      question_title,
      question_difficulty,
      question_content,
      question_tags,
    };
  } catch (error) {
    // TODO Send email to notify if crawler breaks
    console.log("Error", error);
  }
}

async function getDailyQuestionUrl(page) {
  try {
    //Let page goto leetcode website
    await page.goto("https://leetcode.com/problemset/all/");
    //The first row of the rowgroup is today's question
    //In future, we only need to change the css selector
    const textContent = await page.textContent(
      `div[role="rowgroup"] > div:first-child > div > div a[href*="/explore/item"]`
    );
    question_id = textContent.split(". ")[0];

    return question_id;
  } catch (error) {
    // TODO Send email to notify if crawler breaks
    console.log("Error", error);
  }
}

module.exports.getDailyQuestionUrl = getDailyQuestionUrl;
module.exports.getQuestionDetail = getQuestionDetail;
