const schedule = require("node-schedule");
const { sendMail } = require("../timer_task/daily_report/send_email");
const { fetchDaily } = require("../timer_task/playwright/fetch_daily");
const {
  refreshQuestionList,
} = require("../timer_task/playwright/refresh_question_list");
const DailyQuestion = require("../schema/dailyQuestionSchema");
const DailyReportTemplate = require("../timer_task/daily_report/daily_report_template");
const User = require("../schema/userSchema");

async function setFetchDailyRule() {
  console.log("setFetchDailyRule starts");
  // const rule = new schedule.RecurrenceRule();
  // rule.hour = 1;
  // rule.minute = 30;
  // rule.tz = "PST";
  schedule.scheduleJob({ hour: 7, minute: 30 }, async () => {
    try {
      const question_id = await fetchDaily();
      const message = `
      <p>Message from leetcool</p>
      <p>Question: <code>${question_id}</code> is today's daily question</p>
      `;
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Fetch Daily Question Finished",
        message.replaceAll("\n", "")
      );
      console.log("Fetch Daily Finished");
    } catch (error) {
      saveCall();
    }
  });
}

async function setSendDailyReportRule() {
  console.log("setSendDailyReportRule starts");
  // const rule = new schedule.RecurrenceRule();
  // rule.hour = 21;
  // rule.minute = 29;
  // rule.tz = "EST";
  schedule.scheduleJob({ hour: 2, minute: 30 }, async () => {
    try {
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
      await sendMail(
        recipients.substring(0, recipients.length - 2),
        subject,
        template
      );
      console.log("send daily report");
    } catch (error) {
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Send Daily Report Error",
        `Send Daily Report Error`
      );
      console.log("send daily fails");
    }
  });
}

async function setRefreshQuestionListRule() {
  console.log("setRefreshQuestionListRule starts");
  // const rule = new schedule.RecurrenceRule();
  // rule.hour = 1;
  // rule.minute = 1;
  // rule.tz = "PST";
  schedule.scheduleJob({ hour: 7, minute: 1, dayOfWeek: 0 }, async () => {
    try {
      await refreshQuestionList();
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Refreshed Question List",
        `Message from leetcool \n Refreshed Question List`
      );
      console.log("Refresh Question Lis Finished");
    } catch (error) {
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Refreshed Question List Error",
        `Message from leetcool \n Refreshed Question List Error`
      );
      console.log("Refresh Question List Error");
    }
  });
}

async function saveCall() {
  try {
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
    await sendMail(recipients, subject, template);
  } catch (error) {
    await sendMail(
      "qq836482561@gmail.com, hlin3517@gmail.com",
      "Fetch Daily Question Error",
      `Fetch Daily Question Error`
    );
    console.log("Fetch Daily Error");
  }
}

setSendDailyReportRule();
setRefreshQuestionListRule();
setFetchDailyRule();
module.exports.setRefreshQuestionListRule = setRefreshQuestionListRule;
module.exports.setFetchDailyRule = setFetchDailyRule;
module.exports.setSendDailyReportRule = setSendDailyReportRule;
