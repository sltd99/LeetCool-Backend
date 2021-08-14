const fetch = require("node-fetch");
const Question = require("../schema/questionSchema");

(async () => {
  try {
    const response = await fetch(
      "https://leetcode.com/api/problems/algorithms/"
    );
    if (response.ok) {
      const body = await response.json();
      const questions = body.stat_status_pairs;
      for (const question of questions) {
        const query = { question_id: question.stat.frontend_question_id };
        const update = {
          $set: {
            question_id: question.stat.frontend_question_id,
            question_url:
              "https://leetcode.com/problems/" +
              question.stat.question__title_slug +
              "/",
            question_title: question.stat.question__title,
          },
        };
        const options = {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        };
        const result = await Question.findOneAndUpdate(query, update, options);
      }
    } else {
      console.log("Fetch Error");
    }
  } catch (error) {
    console.log("Error", error);
  }
})();
