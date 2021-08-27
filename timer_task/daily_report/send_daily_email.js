const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const config = require("./config");
const OAuth2 = google.auth.OAuth2;
require("dotenv").config({ path: "../../.env" });

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const OAuth2_client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET);
OAuth2_client.setCredentials({ refresh_token: config.REFRESH_TOKEN });

async function sendMail(recipient, message) {
  try {
    const accessToken = await OAuth2_client.getAccessToken();
    console.log(OAuth2_client);
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: config.USER,
        clientId: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        refreshToken: config.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `leetcool <${config.USER}>`,
      to: recipient,
      subject: config.SUBJECT,
      html: message,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

sendMail(
  "qq836482561@gmail.com, hlin3517@gmail.com",
  `<h1> Hello From asdfasdfasdfasdfasdfasdfsdf</h1>`
)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
