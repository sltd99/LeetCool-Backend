const express = require("express");
const router = express.Router();
const Question = require("../schema/questionSchema");
const DailyQuestion = require("../schema/dailyQuestionSchema");
const QuestionAmount = require("../schema/questionAmountSchema");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv/config");

/*
Input: question_id, question_answers {answer: "This is an answer", user: "This is a user"}
Append question_answer into question_id object
Return { message: success } if success else { message: error }
*/
router.post("/save-solution", async (req, res) => {
  const { question_id, question_answers } = req.body;
  try {
    const query = { question_id: question_id };
    question_answers.date = Date.now();
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
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" });
  }
});

router.get("/test", async (req, res) => {
  const result = await Question.aggregate([
    {
      $lookup: {
        from: "dailyquestions",
        localField: "question_id",
        foreignField: "question_id",
        // let: { question_id: "question_id" },
        // pipeline: [
        //   { $match: { $expr: { $eq: ["question_id", "$$question_id"] } } },
        // ],
        as: "dailyQuestions",
      },
    },
    // {
    //   $project: {
    //     question_title: 1,
    //     question_id: 1,
    //     dailyQuestions: 1,
    //   },
    // },
  ]);
  res.json(result);
});

/*
Input question_id
Return 
{
    "question_tags": [
        "",
        "",
    ],
    "question_is_answered": true,
    "_id": "",
    "question_id": 1963,
    "question_url": ""
    "question_title": "",
    "question_difficulty": "",
    "question_content": ""
    "question_answers": [
        {
            "_id": "",
            "answer": "",
            "date": "",
            "user": ""
        },
        {
            "_id": "",
            "answer": "",
            "date": "",
            "user": ""
        }
    ],
    "question_last_submit_date": "2021-08-13T23:02:36.635Z",
    "__v": 0
}
*/
router.get("/question", async (req, res) => {
  try {
    const { question_id } = req.body;
    const question = await Question.findOne({ question_id: question_id });
    if (question) {
      res.json(question);
    } else {
      res.json({ message: "No such question id" });
    }
  } catch (error) {
    res.json({ message: "Fuck, getQuestionById出bug了" });
  }
});

/*
Input nothing
Return all answered question in this format sort by question_last_submit_date: descending
[
    {
    "question_id": 12111,
        "question_tags": [
            "Two Pointers",
            "String",
            "Stack",
            "Greedy"
        ],
        "_id": "6116e75be277d6219ca3ca5a",
        "question_title": "Minimum Number of Swaps to Make the String Balanced",
        "question_difficulty": "Medium",
        "question_answers": [
            {
                "user": "Alex Lin"
            },
            {
                "user": "Longlong Lu"
            }
        ],
        "question_last_submit_date": "2021-08-13T23:02:36.635Z"
    },
]
*/
router.get("/all-questions", async (req, res) => {
  try {
    const result = await Question.find({ question_is_answered: true }, [
      "question_id",
      "question_title",
      "question_difficulty",
      "question_tags",
      "question_answers.user",
      "question_last_submit_date",
    ]).sort({ question_id: "ascending" });
    if (result) {
      res.json(result);
    }
  } catch (error) {
    res.json({ message: "Fuck, saveSolution出bug了" });
  }
});

/*
Input nothing
Fetch all 
questions {
  question_id
  question_title
  question_url
  question_difficulty
  question_tags
  question_content
} into database.
If a question is "paid_only" or question schema already has this question, then skip
Return { message: success } if success else { message: error }
can be improve
*/
router.get("/refersh-question-list", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://leetcode.com/api/problems/algorithms/"
    );

    if (data) {
      const questions = data.stat_status_pairs;
      const newNumTotal = data.num_total;
      const { question_amount } = await QuestionAmount.findOne({ id: 1 });
      for (var i = 0; i < 10; i++) {
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
        const temp = await axios.get(process.env.URL + "playwright", {
          data: {
            url: question_url,
          },
        });
        const { question_difficulty, question_tags, question_content } =
          temp.data;

        const question = new Question({
          question_id: question_id,
          question_url: question_url,
          question_title: question_title,
          question_difficulty: question_difficulty,
          question_tags: question_tags,
          question_content: question_content,
        });
        const saved = await question.save();
      }
      res.json({ message: "success" });
    } else {
      res.json({ message: "fail" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

/*
Input nothing
Fetch daily question and put into dailyQuestion schame
Return { message: success } if success else { message: error }
can be improve by just get question_id and question_title from playwright and then directly store into db
*/
router.get("/fetch-daily", async (req, res) => {
  try {
    const { data } = await axios.get(process.env.URL + "playwright");
    const question_title = data.question_title.split(". ")[1];
    const { question_id } = await Question.findOne({
      question_title: "Find the Longest Valid Obstacle Course at Each Position",
    });
    if (!question_id) {
      res.json({ message: "Can not find this daily question in our db" });
    }
    const dailyQuestion = new DailyQuestion({
      question_id: question_id,
      data: Date.now(),
    });
    const savedDailyQuestion = await dailyQuestion.save();

    res.json({ message: "success" });
  } catch (error) {
    res.json({ message: "Fuck, fetchDaily出bug了" });
  }
});

// router.get("/fetchDaily", async (req, res) => {
//   try {
//     const { data } = await axios.get(process.env.URL + "playwright");
//     const question_title = data.question_title.split(". ")[1];
//     const query = { question_title: question_title };
//     const update = {
//       $set: {
//         question_difficulty: data.question_difficulty,
//         question_content: data.question_content,
//         question_tags: data.question_tags,
//       },
//     };
//     const options = {
//       upsert: true,
//       new: true,
//       setDefaultsOnInsert: true,
//     };
//     const { question_id } = await Question.findOneAndUpdate(
//       query,
//       update,
//       options
//     );

//     const dailyQuestion = new DailyQuestion({
//       question_id: question_id,
//       data: Date.now(),
//     });
//     const savedDailyQuestion = await dailyQuestion.save();

//     res.json({ message: "success" });
//   } catch (error) {
//     res.json({ message: "Fuck, fetchDaily出bug了" });
//   }
// });

module.exports = router;
