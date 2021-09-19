const express = require("express");
const router = express.Router();
const DailyQuestion = require("../schema/dailyQuestionSchema");
const User = require("../schema/userSchema");
const { fetchDaily } = require("../timer_task/playwright/fetch_daily");
const {
  refreshQuestionList,
} = require("../timer_task/playwright/refresh_question_list");
const SendMail = require("../timer_task/daily_report/send_grid");
const DailyReportTemplate = require("../timer_task/daily_report/daily_report_template");
const moment = require("moment");

router.get("/send-daily-report", async (req, res) => {
  try {
    const yesterday = moment().add(-1, "days").startOf("days");
    const query = {
      date: {
        $gte: yesterday.toDate(),
        $lte: moment(yesterday).endOf("day").toDate(),
      },
    };
    const dailyUsers = await DailyQuestion.find(query)
      .populate({ path: "users", select: ["user_email", "user_name"] })
      .select("users");
    const allUsers = await User.find().select("user_email user_name");

    let recipients = [];
    allUsers.map((user) => {
      recipients.push(user.user_email);
    });

    const subject = "~ o(*￣▽￣*)o Daily Report From Leetcool";
    const usersDid = dailyUsers[0].users;

    const usersDidNot = allUsers.filter(
      ({ user_email: email1 }) =>
        !usersDid.some(({ user_email: email2 }) => {
          return email1 == email2;
        })
    );
    const template = DailyReportTemplate.dailyReportTemplate(
      usersDid,
      usersDidNot
    );

    const result = await SendMail.sendMail(recipients, subject, template);
    res.json(result);
  } catch (error) {
    console.log("error");
    res.json("error");
  }
});

router.get("/fetch-daily", async (req, res) => {
  try {
    const question_id = await fetchDaily();
    const message = `
      <p>Message from leetcool</p>
      <p>Question Number: <code>${question_id}</code> is today's daily question</p>
      `;
    console.log(question_id);
    const result = await SendMail.sendMail(
      ["longlonglu68@gmail.com", "hlin3517@gmail.com"],
      "Fetch Daily Question Finished",
      message.split("\n").join("")
    );
    res.json(result);
  } catch (error) {
    console.log("Fetch Daily error");
    res.json(error);
  }
});

router.get("/refersh-question-list", async (req, res) => {
  try {
    const result = await refreshQuestionList();
    const message = `
      <p>Message from leetcool</p>
      <p>Refreshed Question List</p>
      `;
    await SendMail.sendMail(
      ["longlonglu68@gmail.com", "hlin3517@gmail.com"],
      "Refreshed Question List",
      message.split("\n").join("")
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
