const nodemailer = require("nodemailer");
const config = require("../config/smtp.config");

module.exports = async function (email, text) {
  let transporter = nodemailer.createTransport({
    host: config.HOST,
    port: config.PORT,
    secure: false,
    auth: {
      user: config.SMTP_NAME,
      pass: config.PASSWORD
    }
  });

  const data = {
    from: config.SMTP_NAME,
    to: config.ADMIN_MAIL,
    subject: `Письмо от пользователя ${email}`,
    html: `<p>${text}</p>`
  }
  let send = transporter.sendMail(data, (error, result) => {
    if (error) console.log(error);
    console.log(result);
  });


}
