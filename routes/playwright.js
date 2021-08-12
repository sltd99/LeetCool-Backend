var express = require("express")
var router = express.Router()
const { chromium } = require("playwright-chromium")

chromium.launch({ chromiumSandbox: false }).then(browser => {
  router.get("/", async (req, res) => {
    const { url = "" } = req.body

    const question = await getQuestionDetail(browser, url)

    res.json(question)
  })
})

/* GET users listing. */

async function getQuestionDetail(browser, questionUrl) {
  let context, page
  try {
    context = await browser.newContext()
    page = await context.newPage()

    // get daily question
    if (!questionUrl) {
      //Let page goto leetcode website
      await page.goto("https://leetcode.com/problemset/all/")
      //The first row of the rowgroup is today's question
      //In future, we only need to change the css selector
      const textContent = await page.textContent(
        `div[role="rowgroup"] > div:first-child > div > div a[href*="/explore/item"]`
      )
      questionUrl =
        "https://leetcode.com/problems/" +
        textContent.split(". ")[1].toLocaleLowerCase().split(" ").join("-")
    }

    console.log("12312312", questionUrl)

    //Let page goto leetcode problem
    await page.goto(questionUrl)
    //In future, we only need to change the css selector

    //=====================================================================================================
    const questionTitle = await page.textContent(
      `div[data-key*=description-content] > div div[data-cy=question-title]`
    )
    console.log(questionTitle)
    //=====================================================================================================

    //=====================================================================================================
    const diff = await page.textContent(`div[data-key*=description-content] > div div[diff]`)
    console.log(diff)
    //=====================================================================================================

    //=====================================================================================================
    // const questionContentText = await page.innerText(
    //   `div[data-key*=description-content] > div div[class*=question-content]`
    // );
    // console.log(questionContentText);
    //=====================================================================================================

    //=====================================================================================================
    const questionContentHTML = await page.innerHTML(
      `div[data-key*=description-content] > div div[class*=question-content]`
    )
    //=====================================================================================================

    //=====================================================================================================
    const tagPromises = await page.$$(`div > a[class*=topic-tag]`)
    let tags = []
    // tagPromises.forEach(async (e) => {
    //   tags.push(await e.innerText());
    // });

    for (const tagPromise of tagPromises) {
      tags.push(await tagPromise.innerText())
    }
    console.log(tags)

    //=====================================================================================================

    return {
      questionTitle,
      diff,
      questionContentHTML,
      tags,
    }
  } catch (error) {
    // TODO Send email to notify if crawler breaks
    console.log("Error", error)
  } finally {
    if (page) await page.close()
    if (context) await context.close()
  }
}

module.exports = router
