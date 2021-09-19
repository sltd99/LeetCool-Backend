const sgMail = require("@sendgrid/mail");

async function sendMail(recipient, subject, message) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  sgMail.setApiKey(SENDGRID_API_KEY);
  const msg = {
    to: recipient,
    from: "qq836482561@gmail.com",
    subject: subject,
    html: message,
  };
  try {
    await sgMail.send(msg);
    return "success";
  } catch (error) {
    console.error(error);
    return "error";
  }
}

module.exports.sendMail = sendMail;
