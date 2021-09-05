const schedule = require("node-schedule");
const { sendMail } = require("./daily_report/send_email");
const axios = require("axios");
const url = "https://leet-cool-backend.herokuapp.com/";

async function setFetchDailyRule() {
  console.log("setFetchDailyRule starts");
  schedule.scheduleJob({ hour: 7, minute: 30 }, async () => {
    try {
      await axios.get(url + "call-tasks/fetch-daily");
      console.log("Fetch Daily success");
    } catch (error) {
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Fetch Daily Question Error",
        `Fetch Daily Question Error`
      );
      console.log("Fetch Daily fail");
    }
  });
}

async function setSendDailyReportRule() {
  console.log("setSendDailyReportRule starts");
  schedule.scheduleJob({ hour: 2, minute: 30 }, async () => {
    try {
      await axios.get(url + "call-tasks/send-daily-report");
      console.log("send daily report success");
    } catch (error) {
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Send Daily Report Error",
        `Send Daily Report Error`
      );
      console.log("send daily report fails");
    }
  });
}

async function setRefreshQuestionListRule() {
  console.log("setRefreshQuestionListRule starts");
  schedule.scheduleJob({ hour: 7, minute: 1, dayOfWeek: 0 }, async () => {
    try {
      await axios.get(url + "call-tasks/refersh-question-list");
      console.log("Refresh Question List success");
    } catch (error) {
      const message = `
      <p>Message from leetcool</p>
      <p>Refreshed Question List Error</p>
      `;
      await sendMail(
        "qq836482561@gmail.com, hlin3517@gmail.com",
        "Refreshed Question List Error",
        message.replaceAll("\n", "")
      );
      console.log("Refresh Question List Error");
    }
  });
}

setSendDailyReportRule();
setRefreshQuestionListRule();
setFetchDailyRule();
module.exports.setRefreshQuestionListRule = setRefreshQuestionListRule;
module.exports.setFetchDailyRule = setFetchDailyRule;
module.exports.setSendDailyReportRule = setSendDailyReportRule;
