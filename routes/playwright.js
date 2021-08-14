var express = require("express");
var router = express.Router();
const { chromium } = require("playwright-chromium");

chromium.launch({ chromiumSandbox: false }).then((browser) => {
  router.get("/", async (req, res) => {
    const { url = "" } = req.body;
    const question = await getQuestionDetail(browser, url);
    res.json(question);
  });
});

/* GET users listing. */

async function getQuestionDetail(browser, questionUrl) {
  let context, page;
  try {
    context = await browser.newContext();
    page = await context.newPage();

    // get daily question
    if (!questionUrl) {
      //Let page goto leetcode website
      await page.goto("https://leetcode.com/problemset/all/");
      //The first row of the rowgroup is today's question
      //In future, we only need to change the css selector
      const textContent = await page.textContent(
        `div[role="rowgroup"] > div:first-child > div > div a[href*="/explore/item"]`
      );
      questionUrl =
        "https://leetcode.com/problems/" +
        textContent.split(". ")[1].toLocaleLowerCase().split(" ").join("-");
    }

    //Let page goto leetcode problem
    await page.goto(questionUrl);
    //In future, we only need to change the css selector

    //=====================================================================================================
    const question_title = await page.textContent(
      `div[data-key*=description-content] > div div[data-cy=question-title]`
    );
    //=====================================================================================================

    //=====================================================================================================
    const question_difficulty = await page.textContent(
      `div[data-key*=description-content] > div div[diff]`
    );
    //=====================================================================================================

    //=====================================================================================================
    const question_content = await page.innerHTML(
      `div[data-key*=description-content] > div div[class*=question-content]`
    );
    //=====================================================================================================

    //=====================================================================================================
    const tagPromises = await page.$$(`div > a[class*=topic-tag]`);
    let question_tags = [];
    for (const tagPromise of tagPromises) {
      question_tags.push(await tagPromise.innerText());
    }
    //=====================================================================================================

    return {
      question_title,
      question_difficulty,
      question_content,
      question_tags,
    };
  } catch (error) {
    // TODO Send email to notify if crawler breaks
    console.log("Error", error);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
  }
}

module.exports = router;
