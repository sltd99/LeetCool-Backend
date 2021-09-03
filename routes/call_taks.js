const express = require("express");
const router = express.Router();
const DailyQuestion = require("../schema/dailyQuestionSchema");
const User = require("../schema/userSchema");
const { fetchDaily } = require("../timer_task/playwright/fetch_daily");
const {
  refreshQuestionList,
} = require("../timer_task/playwright/refresh_question_list");
const { sendMail } = require("../timer_task/daily_report/send_email");
const DailyReportTemplate = require("../timer_task/daily_report/daily_report_template");

router.get("/send-daily-report", async (req, res) => {
  const dailyUsers = await DailyQuestion.findOne()
    .sort({ _id: -1 })
    .populate({ path: "users", select: ["user_email", "user_name"] })
    .select("users");
  const allUsers = await User.find().select("user_email user_name");
  let recipients = "";
  allUsers.map((user) => {
    recipients += user.user_email + ", ";
  });
  const subject = "~ o(*￣▽￣*)o Daily Report From Leetcool";
  const usersDid = dailyUsers.users;
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

  const result = await sendMail(recipients, subject, template);
  res.json({ template: template, subject: subject, recipients: recipients });
});

router.get("/fetch_daily", async (req, res) => {
  try {
    const question_id = await fetchDaily();
    const message = `
      <p>Message from leetcool</p>
      <p>Question: <code>${question_id}</code> is today's daily question</p>
      `;
    const result = await sendMail(
      "qq836482561@gmail.com, hlin3517@gmail.com",
      "Fetch Daily Question Finished",
      message.replaceAll("\n", "")
    );
    res.json(question_id);
  } catch (error) {
    res.json(error);
  }
});

router.get("/refersh_question_list", async (req, res) => {
  try {
    const result = await refreshQuestionList();
    const message = `
      <p>Message from leetcool</p>
      <p>Refreshed Question List</p>
      `;
    await sendMail(
      "qq836482561@gmail.com, hlin3517@gmail.com",
      "Refreshed Question List",
      message.replaceAll("\n", "")
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
