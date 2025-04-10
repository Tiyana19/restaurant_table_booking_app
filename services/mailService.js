// mailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another provider like 'hotmail', 'yahoo'
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_app_password', // Use App Password, not your real Gmail password
  },
});

const sendConfirmationEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'your_email@gmail.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail };
