const nodemailer = require("nodemailer");
const { google } = require("googleapis");

async function sendMail(recipient, subject, message) {
  // const CLIENT_ID = process.env.CLIENT_ID;
  // const CLIENT_SECRET = process.env.CLIENT_SECRET;
  // const REDIRECT_URL = process.env.REDIRECT_URL;
  // const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  // const USER = process.env.USER;

  const CLIENT_ID =
    "630647017025-7dtpmh018j7s5qiuvrp79q9fg8lh3rai.apps.googleusercontent.com";
  const CLIENT_SECRET = "KL2RRRhYjqzD-j9761fjymsz";
  const REDIRECT_URL = process.env.REDIRECT_URL;
  const REFRESH_TOKEN =
    "1//04zA_EwbmAHw6CgYIARAAGAQSNwF-L9Ir_goE3pB-eH5wc5-HMkouZ6-wrTuZJlxXeDWIE2lmhunuY-AFuPdm58hqJXs6Zf1z5aU";
  const USER = "longlonglu68@gmail.com";

  console.log(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, USER);

  const OAuth2 = google.auth.OAuth2;
  const OAuth2_client = new OAuth2(CLIENT_ID, CLIENT_SECRET);
  OAuth2_client.setCredentials({ refresh_token: REFRESH_TOKEN });
  try {
    const accessToken = await OAuth2_client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `Leetcool <${USER}>`,
      to: recipient,
      subject: subject,
      html: message,
    };
    const result = await transport.sendMail(mailOptions);
    console.log("try + Send_email: ", result);
    return result;
  } catch (error) {
    console.log("catch + Send_email: ", error);
    return error;
  }
}
module.exports.sendMail = sendMail;
